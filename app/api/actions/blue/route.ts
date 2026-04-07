import type { GovernanceActionResult, GovernanceDecisionTrace } from "@/lib/governance";
import { checkBlueAuditFeedAccess } from "@/lib/openfga-blue";

export const runtime = "nodejs";

const BLUE_ACTION_ID = "dashboard_access_decision";
const BLUE_DOMAIN = "auth_security_surfaces";
const BLUE_TIER = "HARD_STOP";

type BlueAuditFeedArtifact = {
  artifact_type: "audit_feed_export";
  exported_at: string;
  subject: string;
  relation: string;
  object: string;
  entries: Array<{
    lane: "green" | "yellow" | "red" | "blue";
    note: string;
  }>;
};

type BlueActionResult = GovernanceActionResult & {
  artifact?: BlueAuditFeedArtifact;
};

function buildTrace(
  steps: GovernanceDecisionTrace["steps"]
): GovernanceDecisionTrace {
  return {
    actionId: BLUE_ACTION_ID,
    provider: "internal",
    domain: BLUE_DOMAIN,
    tier: BLUE_TIER,
    requiresApproval: false,
    requiresFGA: true,
    credentialRequested: false,
    steps
  };
}

function buildArtifact(subject: string, relation: string, object: string): BlueAuditFeedArtifact {
  return {
    artifact_type: "audit_feed_export",
    exported_at: new Date().toISOString(),
    subject,
    relation,
    object,
    entries: [
      {
        lane: "green",
        note: "Green route remains provider-backed and unchanged."
      },
      {
        lane: "yellow",
        note: "Yellow route remains approval-first and demo-HOLD until browser-authenticated capture."
      },
      {
        lane: "red",
        note: "Red route remains governance-first with credential suppression intact."
      },
      {
        lane: "blue",
        note: "This export was released only after a real OpenFGA viewer check."
      }
    ]
  };
}

function buildFailureResult(reason: string): BlueActionResult {
  const timestamp = new Date().toISOString();

  return {
    event: {
      timestamp,
      action: BLUE_ACTION_ID,
      domain: BLUE_DOMAIN,
      tier: BLUE_TIER,
      outcome: "error",
      credential_requested: false,
      approval_requested: false,
      fga_checked: false,
      reason
    },
    trace: buildTrace([
      {
        label: "protected_surface",
        status: "complete",
        detail: "Audit Feed export route selected for the blue lane."
      },
      {
        label: "fga_check",
        status: "blocked",
        detail: reason
      },
      {
        label: "artifact_release",
        status: "blocked",
        detail: "Audit Feed export stayed withheld because the live OpenFGA path did not complete."
      }
    ])
  };
}

export async function POST() {
  try {
    const decision = await checkBlueAuditFeedAccess();
    const artifact = decision.allowed
      ? buildArtifact(decision.subject, decision.relation, decision.object)
      : undefined;
    const timestamp = new Date().toISOString();
    const reason = decision.allowed
      ? `OpenFGA allowed Audit Feed export. ${decision.subject} has ${decision.relation} on ${decision.object}.`
      : `OpenFGA denied Audit Feed export. ${decision.subject} does not have ${decision.relation} on ${decision.object}.`;

    return Response.json(
      {
        event: {
          timestamp,
          action: BLUE_ACTION_ID,
          domain: BLUE_DOMAIN,
          tier: BLUE_TIER,
          outcome: decision.allowed ? "success" : "blocked",
          credential_requested: false,
          approval_requested: false,
          fga_checked: true,
          reason
        },
        trace: buildTrace([
          {
            label: "protected_surface",
            status: "complete",
            detail: "Audit Feed export route selected for the blue lane."
          },
          {
            label: "subject_resolution",
            status: "complete",
            detail: `Resolved the demo OpenFGA tuple subject ${decision.subject} against ${decision.object}.`
          },
          {
            label: "fga_check",
            status: "complete",
            detail:
              `OpenFGA checked ${decision.subject}#${decision.relation}@${decision.object} on store ${decision.storeId} using model ${decision.modelId}.`
          },
          {
            label: "artifact_release",
            status: decision.allowed ? "complete" : "blocked",
            detail: decision.allowed
              ? "Audit Feed export was returned because the OpenFGA viewer check allowed access."
              : "Audit Feed export was withheld because the OpenFGA viewer check denied access."
          }
        ]),
        artifact
      } satisfies BlueActionResult,
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const reason = `HOLD: live OpenFGA check failed. ${message}`;

    return Response.json(buildFailureResult(reason), {
      status: 500,
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }
}
