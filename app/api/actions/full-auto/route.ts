import {
  AccessTokenForConnectionError,
  AccessTokenForConnectionErrorCode
} from "@auth0/nextjs-auth0/errors";

import {
  ACTIVE_PROFILE,
  resolveGovernanceAction,
  type GovernanceActionResult,
} from "@/lib/governance";
import { auth0 } from "@/lib/auth0";
import {
  GOOGLE_CONNECTION,
  callGoogleCalendarFreeBusy
} from "@/lib/token-vault";

type FullAutoErrorDetails = {
  step: "connection_token_resolution" | "provider_call";
  reason: string;
};

function resolveFullAutoError(error: unknown): FullAutoErrorDetails {
  if (error instanceof AccessTokenForConnectionError) {
    if (error.code === AccessTokenForConnectionErrorCode.MISSING_REFRESH_TOKEN) {
      return {
        step: "connection_token_resolution",
        reason:
          "HOLD: current Auth0 session contains no refresh token. " +
          "The green route can only resolve a Google connection access token " +
          "after a fresh login creates a session with one."
      };
    }

    if (error.code === AccessTokenForConnectionErrorCode.FAILED_TO_EXCHANGE) {
      const oauthCode = error.cause?.code;
      const oauthMessage = error.cause?.message ?? error.message;

      if (
        oauthCode === "unauthorized_client" ||
        oauthCode === "unsupported_grant_type"
      ) {
        return {
          step: "connection_token_resolution",
          reason:
            "HOLD: Auth0 rejected the federated connection token-exchange grant. " +
            "Enable urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token " +
            "for this application."
        };
      }

      if (
        oauthCode === "invalid_request" &&
        oauthMessage.toLowerCase().includes("connection")
      ) {
        return {
          step: "connection_token_resolution",
          reason:
            `HOLD: Auth0 rejected the Google connection exchange for ${GOOGLE_CONNECTION}. ` +
            oauthMessage
        };
      }

      return {
        step: "connection_token_resolution",
        reason: `Connection token exchange failed: ${oauthCode ? `${oauthCode}: ` : ""}${oauthMessage}`
      };
    }

    if (error.code === AccessTokenForConnectionErrorCode.MISSING_SESSION) {
      return {
        step: "connection_token_resolution",
        reason: "No authenticated session. Log in first."
      };
    }
  }

  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("google_api_error")) {
    return {
      step: "provider_call",
      reason: `Google API call failed after successful connection token retrieval. ${message}`
    };
  }

  return {
    step: "connection_token_resolution",
    reason: `Connection token retrieval failed: ${message}`
  };
}

export async function POST(request: Request) {
  const resolution = resolveGovernanceAction("google_calendar_read", ACTIVE_PROFILE);
  const timestamp = new Date().toISOString();

  const session = await auth0.getSession();
  if (!session) {
    const result: GovernanceActionResult = {
      event: {
        timestamp,
        action: resolution.actionId,
        domain: resolution.domain,
        tier: resolution.tier,
        outcome: "error",
        credential_requested: false,
        approval_requested: false,
        fga_checked: false,
        reason: "No authenticated session. Log in first.",
      },
      trace: {
        ...resolution,
        credentialRequested: false,
        steps: [
          {
            label: "session_check",
            status: "blocked",
            detail:
              "No Auth0 session found. Cannot resolve a Google connection access token.",
          },
        ],
      },
    };
    return Response.json(result, { status: 401 });
  }

  try {
    const { token: accessToken } = await auth0.getAccessTokenForConnection(
      { connection: GOOGLE_CONNECTION },
      request,
      undefined
    );
    const data = await callGoogleCalendarFreeBusy(accessToken);
    const primary = data.calendars?.primary;
    const busySlots = primary?.busy?.length ?? 0;

    const result: GovernanceActionResult = {
      event: {
        timestamp,
        action: resolution.actionId,
        domain: resolution.domain,
        tier: resolution.tier,
        outcome: "success",
        credential_requested: true,
        approval_requested: false,
        fga_checked: false,
        reason:
          `Auth0 v4 resolved a Google connection access token via getAccessTokenForConnection for ${GOOGLE_CONNECTION}. ` +
          `Calendar FreeBusy returned ${busySlots} busy slot(s) in the next 24h.`,
      },
      trace: {
        ...resolution,
        credentialRequested: true,
        steps: [
          {
            label: "governance_resolver",
            status: "complete",
            detail: `Profile ${ACTIVE_PROFILE} resolved ${resolution.domain} to ${resolution.tier}.`,
          },
          {
            label: "approval_gate",
            status: "complete",
            detail: "No approval required for FULL_AUTO lane.",
          },
          {
            label: "connection_token_resolution",
            status: "complete",
            detail:
              `Auth0 v4 resolved a Google connection access token for ${GOOGLE_CONNECTION}.`,
          },
          {
            label: "provider_call",
            status: "complete",
            detail: `Google Calendar FreeBusy API returned ${busySlots} busy slot(s).`,
          },
        ],
      },
    };
    return Response.json(result);
  } catch (err) {
    const errorDetails = resolveFullAutoError(err);
    const completedConnectionStep =
      errorDetails.step === "provider_call"
        ? [
            {
              label: "connection_token_resolution" as const,
              status: "complete" as const,
              detail:
                `Auth0 v4 resolved a Google connection access token for ${GOOGLE_CONNECTION}.`
            }
          ]
        : [];

    const result: GovernanceActionResult = {
      event: {
        timestamp,
        action: resolution.actionId,
        domain: resolution.domain,
        tier: resolution.tier,
        outcome: "error",
        credential_requested: true,
        approval_requested: false,
        fga_checked: false,
        reason: errorDetails.reason,
      },
      trace: {
        ...resolution,
        credentialRequested: true,
        steps: [
          {
            label: "governance_resolver",
            status: "complete",
            detail: `Profile ${ACTIVE_PROFILE} resolved ${resolution.domain} to ${resolution.tier}.`,
          },
          {
            label: "approval_gate",
            status: "complete",
            detail: "No approval required for FULL_AUTO lane.",
          },
          ...completedConnectionStep,
          {
            label: errorDetails.step,
            status: "blocked",
            detail: errorDetails.reason,
          },
        ],
      },
    };
    return Response.json(result);
  }
}

