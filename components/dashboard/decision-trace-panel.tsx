import type { GovernanceDecisionTraceStep } from "@/lib/governance";

import type { ReceiptLedgerEntry } from "@/components/dashboard/receipt-ledger";

type ReplayStep = {
  label: string;
  status: "complete" | "pending" | "blocked";
  detail: string;
};

function statusTone(status: ReplayStep["status"]) {
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

  return {
    dot: "bg-amber-400",
    text: "text-amber-200",
    border: "border-amber-400/20"
  };
}

function buildReplay(entry: ReceiptLedgerEntry): ReplayStep[] {
  const event = entry.event;

  if (!event) {
    const pendingDetail =
      entry.lane === "blue"
        ? "No blue access-decision artifact is emitted yet in this build."
        : "No lane execution captured yet. Run the lane route to capture evidence.";

    return [
      { label: "classify domain", status: "pending", detail: pendingDetail },
      { label: "resolve tier", status: "pending", detail: pendingDetail },
      { label: "fga checked", status: "pending", detail: "OpenFGA remains unwired in this wave." },
      { label: "approval requested", status: "pending", detail: pendingDetail },
      {
        label: "credential requested or suppressed",
        status: "pending",
        detail: pendingDetail
      },
      { label: "execute or block", status: "pending", detail: pendingDetail }
    ];
  }

  const blocked = event.outcome === "blocked";

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
      status: event.fga_checked ? "complete" : blocked ? "blocked" : "pending",
      detail: event.fga_checked
        ? "fga_checked true in route output"
        : "fga_checked false in route output"
    },
    {
      label: "approval requested",
      status: event.approval_requested ? "complete" : blocked ? "blocked" : "complete",
      detail: `approval_requested ${String(event.approval_requested)}`
    },
    {
      label: "credential requested or suppressed",
      status: event.credential_requested ? "complete" : blocked ? "blocked" : "complete",
      detail: `credential_requested ${String(event.credential_requested)}`
    },
    {
      label: "execute or block",
      status: blocked ? "blocked" : "complete",
      detail: `outcome ${event.outcome}`
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
