import {
  AccessTokenForConnectionError,
  AccessTokenForConnectionErrorCode
} from "@auth0/nextjs-auth0/errors";

import { auth0 } from "@/lib/auth0";
import {
  ACTIVE_PROFILE,
  resolveGovernanceAction,
  type GovernanceActionResult,
  type GovernanceDecisionTrace,
  type GovernanceDecisionTraceStep
} from "@/lib/governance";
import {
  createGitHubIssue,
  GITHUB_CONNECTION,
  GitHubIssueCreateError,
  resolveGitHubIssueTarget
} from "@/lib/github-supervised";

export const runtime = "nodejs";

type SupervisedPhase = "request_approval" | "execute_approved";

type SupervisedRequestBody = {
  phase?: SupervisedPhase;
};

type SupervisedFailure = {
  reason: string;
  step: "connection_token_resolution" | "target_resolution" | "provider_call";
  credentialRequested: boolean;
  targetResolved?: string;
};

const resolution = resolveGovernanceAction("github_issue_create", ACTIVE_PROFILE);

function buildTrace(
  steps: GovernanceDecisionTraceStep[],
  credentialRequested: boolean
): GovernanceDecisionTrace {
  return {
    ...resolution,
    credentialRequested,
    steps
  };
}

function buildSessionRequiredResult(): GovernanceActionResult {
  const timestamp = new Date().toISOString();

  return {
    event: {
      timestamp,
      action: resolution.actionId,
      domain: resolution.domain,
      tier: resolution.tier,
      outcome: "error",
      credential_requested: false,
      approval_requested: false,
      fga_checked: false,
      reason: "No authenticated session. Log in first."
    },
    trace: buildTrace(
      [
        {
          label: "session_check",
          status: "blocked",
          detail:
            "No Auth0 session was available for the supervised lane. Approval and GitHub execution were skipped."
        }
      ],
      false
    )
  };
}

function buildApprovalRequestResult(): GovernanceActionResult {
  const timestamp = new Date().toISOString();

  return {
    event: {
      timestamp,
      action: resolution.actionId,
      domain: resolution.domain,
      tier: resolution.tier,
      outcome: "allowed",
      credential_requested: false,
      approval_requested: true,
      fga_checked: false,
      reason:
        "Approval requested. GitHub credential request stays false until approved execute is triggered."
    },
    trace: buildTrace(
      [
        {
          label: "governance_resolver",
          status: "complete",
          detail: `Profile ${ACTIVE_PROFILE} resolved ${resolution.domain} to ${resolution.tier}.`
        },
        {
          label: "approval_gate",
          status: "complete",
          detail:
            "Approval was explicitly requested for github_issue_create. No GitHub credential handoff happened in this pass."
        },
        {
          label: "connection_token_resolution",
          status: "pending",
          detail:
            "Credential request remains false until the approved execute step is sent."
        },
        {
          label: "provider_call",
          status: "pending",
          detail:
            "GitHub issue creation is still waiting behind the explicit approval step."
        }
      ],
      false
    )
  };
}

function buildIssueTitle() {
  return `GateKeeper Yellow Supervised Wave ${new Date().toISOString()}`;
}

function buildIssueBody(target: { owner: string; repo: string; source: string }) {
  return [
    "Live supervised proof from GateKeeper Layer 2.",
    "",
    `- lane: yellow`,
    `- action: ${resolution.actionId}`,
    `- profile: ${ACTIVE_PROFILE}`,
    `- target: ${target.owner}/${target.repo}`,
    `- target_source: ${target.source}`
  ].join("\n");
}

async function parseBody(request: Request): Promise<SupervisedRequestBody> {
  try {
    return (await request.json()) as SupervisedRequestBody;
  } catch {
    return {};
  }
}

function resolveFailure(error: unknown): SupervisedFailure {
  if (error instanceof AccessTokenForConnectionError) {
    if (error.code === AccessTokenForConnectionErrorCode.MISSING_SESSION) {
      return {
        step: "connection_token_resolution",
        credentialRequested: false,
        reason: "No authenticated session. Log in first."
      };
    }

    if (error.code === AccessTokenForConnectionErrorCode.MISSING_REFRESH_TOKEN) {
      return {
        step: "connection_token_resolution",
        credentialRequested: true,
        reason:
          "HOLD: current Auth0 session contains no refresh token, so the GitHub connection access token cannot be minted. Re-authenticate with refresh-token support and try approved execute again."
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
          credentialRequested: true,
          reason:
            "HOLD: Auth0 rejected the GitHub federated connection token-exchange grant. Enable urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token for this application."
        };
      }

      if (
        oauthCode === "invalid_request" &&
        oauthMessage.toLowerCase().includes("connection")
      ) {
        return {
          step: "connection_token_resolution",
          credentialRequested: true,
          reason:
            `HOLD: Auth0 rejected the GitHub connection exchange for ${GITHUB_CONNECTION}. ${oauthMessage}`
        };
      }

      return {
        step: "connection_token_resolution",
        credentialRequested: true,
        reason:
          `HOLD: GitHub connection token exchange failed${oauthCode ? ` (${oauthCode})` : ""}. ${oauthMessage}`
      };
    }
  }

  if (error instanceof GitHubIssueCreateError) {
    if (error.status === 401) {
      return {
        step: "provider_call",
        credentialRequested: true,
        reason:
          "HOLD: GitHub rejected the connection access token during issue creation. Check the Auth0 GitHub connection token and scopes."
      };
    }

    if (error.status === 403) {
      return {
        step: "provider_call",
        credentialRequested: true,
        reason:
          `HOLD: GitHub accepted the request but denied issue creation for the target repo. ${error.body}`
      };
    }

    if (error.status === 404) {
      return {
        step: "provider_call",
        credentialRequested: true,
        reason:
          `HOLD: GitHub could not access the target repo for issue creation. ${error.body}`
      };
    }

    return {
      step: "provider_call",
      credentialRequested: true,
      reason: `GitHub issue creation failed: ${error.body}`
    };
  }

  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("Unable to resolve")) {
    return {
      step: "target_resolution",
      credentialRequested: true,
      reason: `HOLD: ${message} Set GITHUB_TARGET_REPO or keep remote.origin.url available.`
    };
  }

  return {
    step: "provider_call",
    credentialRequested: true,
    reason: `Supervised GitHub execution failed: ${message}`
  };
}

function buildFailureResult(failure: SupervisedFailure): GovernanceActionResult {
  const timestamp = new Date().toISOString();
  const steps: GovernanceDecisionTraceStep[] = [
    {
      label: "governance_resolver",
      status: "complete",
      detail: `Profile ${ACTIVE_PROFILE} resolved ${resolution.domain} to ${resolution.tier}.`
    },
    {
      label: "approval_gate",
      status: "complete",
      detail:
        "Approved execute was received. GitHub credential handoff was allowed to start only after explicit approval."
    }
  ];

  if (
    failure.step === "target_resolution" ||
    failure.step === "provider_call"
  ) {
    steps.push({
      label: "connection_token_resolution",
      status: "complete",
      detail: `Auth0 resolved a GitHub connection access token for ${GITHUB_CONNECTION}.`
    });
  }

  if (failure.step === "provider_call" && failure.targetResolved) {
    steps.push({
      label: "target_resolution",
      status: "complete",
      detail: `Resolved GitHub issue target ${failure.targetResolved}.`
    });
  }

  steps.push({
    label: failure.step,
    status: "blocked",
    detail: failure.reason
  });

  return {
    event: {
      timestamp,
      action: resolution.actionId,
      domain: resolution.domain,
      tier: resolution.tier,
      outcome: "error",
      credential_requested: failure.credentialRequested,
      approval_requested: true,
      fga_checked: false,
      reason: failure.reason
    },
    trace: buildTrace(steps, failure.credentialRequested)
  };
}

export async function POST(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json(buildSessionRequiredResult(), {
      status: 401,
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }

  const body = await parseBody(request);
  if (body.phase !== "execute_approved") {
    return Response.json(buildApprovalRequestResult(), {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }

  try {
    const { token: accessToken } = await auth0.getAccessTokenForConnection(
      { connection: GITHUB_CONNECTION },
      request,
      undefined
    );
    const target = resolveGitHubIssueTarget();
    const issue = await createGitHubIssue(
      accessToken,
      target,
      buildIssueTitle(),
      buildIssueBody(target)
    );
    const timestamp = new Date().toISOString();

    return Response.json(
      {
        event: {
          timestamp,
          action: resolution.actionId,
          domain: resolution.domain,
          tier: resolution.tier,
          outcome: "success",
          credential_requested: true,
          approval_requested: true,
          fga_checked: false,
          reason:
            `Approved execute completed. GitHub issue #${issue.number} was created at ${issue.htmlUrl} for ${target.owner}/${target.repo}.`
        },
        trace: buildTrace(
          [
            {
              label: "governance_resolver",
              status: "complete",
              detail:
                `Profile ${ACTIVE_PROFILE} resolved ${resolution.domain} to ${resolution.tier}.`
            },
            {
              label: "approval_gate",
              status: "complete",
              detail:
                "Approved execute was received. GitHub credential handoff started only after explicit approval."
            },
            {
              label: "connection_token_resolution",
              status: "complete",
              detail:
                `Auth0 resolved a GitHub connection access token for ${GITHUB_CONNECTION}.`
            },
            {
              label: "target_resolution",
              status: "complete",
              detail:
                `Resolved GitHub issue target ${target.owner}/${target.repo} from ${target.source}.`
            },
            {
              label: "provider_call",
              status: "complete",
              detail:
                `GitHub created issue #${issue.number} (${issue.title}).`
            }
          ],
          true
        )
      } satisfies GovernanceActionResult,
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    return Response.json(buildFailureResult(resolveFailure(error)), {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }
}
