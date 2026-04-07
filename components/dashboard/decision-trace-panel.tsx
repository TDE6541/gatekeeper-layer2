import {
  ACTIVE_PROFILE,
  getGovernanceOutcomeLabel,
  resolveGovernanceAction,
  type DemoActionId,
  type GovernanceDecisionTraceStep
} from "@/lib/governance";

import type { ReceiptLedgerEntry } from "@/components/dashboard/receipt-ledger";

type ReplayStatus = "complete" | "pending" | "blocked" | "not_required";

type ReplayStep = {
  label: string;
  status: ReplayStatus;
  detail: string;
};

function statusTone(status: ReplayStatus) {
  if (status === "complete") {
    return {
      dot: "bg-emerald-400",
      text: "text-emerald-200",
      border: "border-emerald-400/20"
    };
  }

  if (status === "blocked") {
    return {
      dot: "bg-rose-400",
      text: "text-rose-200",
      border: "border-rose-400/20"
    };
  }

  if (status === "not_required") {
    return {
      dot: "bg-slate-500",
      text: "text-slate-300",
      border: "border-slate-700"
    };
  }

  return {
    dot: "bg-amber-400",
    text: "text-amber-200",
    border: "border-amber-400/20"
  };
}

function isDemoActionId(actionId: string): actionId is DemoActionId {
  return (
    actionId === "google_calendar_read" ||
    actionId === "github_issue_create" ||
    actionId === "pricing_rule_change"
  );
}

function resolveEntryGovernance(entry: ReceiptLedgerEntry) {
  if (entry.trace) {
    return {
      domain: entry.trace.domain,
      requiresFGA: entry.trace.requiresFGA
    };
  }

  if (isDemoActionId(entry.expectedAction)) {
    const resolution = resolveGovernanceAction(entry.expectedAction, ACTIVE_PROFILE);

    return {
      domain: resolution.domain,
      requiresFGA: resolution.requiresFGA
    };
  }

  return {
    domain: null,
    requiresFGA: false
  };
}

function buildReplay(entry: ReceiptLedgerEntry): ReplayStep[] {
  const event = entry.event;
  const governance = resolveEntryGovernance(entry);

  if (!event) {
    const pendingDetail =
      entry.lane === "blue"
        ? "No blue access-decision artifact is emitted yet in this build."
        : "No lane execution captured yet. Run the lane route to capture evidence.";
    const fgaDetail = governance.domain
      ? `not_required for ${governance.domain}`
      : "not_required for this lane";

    return [
      { label: "classify domain", status: "pending", detail: pendingDetail },
      { label: "resolve tier", status: "pending", detail: pendingDetail },
      {
        label: "fga checked",
        status: governance.requiresFGA ? "pending" : "not_required",
        detail: governance.requiresFGA ? "OpenFGA remains unwired in this wave." : fgaDetail
      },
      { label: "approval requested", status: "pending", detail: pendingDetail },
      {
        label: "credential requested or suppressed",
        status: "pending",
        detail: pendingDetail
      },
      { label: "execute or block", status: "pending", detail: pendingDetail }
    ];
  }

  const displayOutcome = getGovernanceOutcomeLabel(event);
  const blocked = event.outcome === "blocked" || displayOutcome === "HOLD";
  const approvalOnly =
    entry.lane === "yellow" &&
    event.approval_requested &&
    !event.credential_requested &&
    event.outcome === "allowed";

  return [
    {
      label: "classify domain",
      status: "complete",
      detail: `domain classified as ${event.domain}`
    },
    {
      label: "resolve tier",
      status: "complete",
      detail: `tier resolved as ${event.tier}`
    },
    {
      label: "fga checked",
      status: governance.requiresFGA
        ? event.fga_checked
          ? "complete"
          : blocked
            ? "blocked"
            : "pending"
        : "not_required",
      detail: governance.requiresFGA
        ? event.fga_checked
          ? "fga_checked true in route output"
          : "fga_checked false in route output"
        : `not_required for ${event.domain}`
    },
    {
      label: "approval requested",
      status: event.approval_requested ? "complete" : blocked ? "blocked" : "complete",
      detail: approvalOnly
        ? "approval_requested true; approved execute is not captured yet"
        : `approval_requested ${String(event.approval_requested)}`
    },
    {
      label: "credential requested or suppressed",
      status: approvalOnly
        ? "pending"
        : event.credential_requested
          ? "complete"
          : blocked
            ? "blocked"
            : "complete",
      detail: approvalOnly
        ? "credential_requested false until approved execute starts the GitHub token handoff"
        : `credential_requested ${String(event.credential_requested)}`
    },
    {
      label: "execute or block",
      status: approvalOnly ? "pending" : blocked ? "blocked" : "complete",
      detail: approvalOnly
        ? "Approval is captured. Run approved execute to continue the yellow lane."
        : `outcome ${displayOutcome}`
    }
  ];
}

export function DecisionTracePanel({
  entry
}: {
  entry: ReceiptLedgerEntry;
}) {
  const replay = buildReplay(entry);

  return (
    <section className="rounded-2xl border border-slate-800 bg-panel/90 p-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">
            Decision Trace
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Replay of classification and enforcement states for the selected ledger lane.
          </p>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-300">
          lane {entry.lane}
        </span>
      </div>

      <div className="mt-5 space-y-2">
        {replay.map((step) => {
          const tone = statusTone(step.status);

          return (
            <div
              key={step.label}
              className={`rounded-lg border bg-slate-950/70 p-3 ${tone.border}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                  <p className="text-sm text-slate-100">{step.label}</p>
                </div>
                <span className={`text-xs uppercase tracking-[0.2em] ${tone.text}`}>
                  {step.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">{step.detail}</p>
            </div>
          );
        })}
      </div>

      {entry.trace?.steps?.length ? (
        <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">raw trace steps</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-300">
            {entry.trace.steps.map((step: GovernanceDecisionTraceStep, index: number) => (
              <li key={`${step.label}-${index}`}>
                {step.label}: {step.status}
                {step.detail ? ` - ${step.detail}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
