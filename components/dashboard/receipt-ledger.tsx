import type {
  GovernanceDecisionTrace,
  GovernanceFeedEvent,
  HardStopReceipt
} from "@/lib/governance";

export type LedgerLane = "green" | "yellow" | "red" | "blue";

export type ReceiptLedgerEntry = {
  lane: LedgerLane;
  title: string;
  subtitle: string;
  expectedAction: string;
  route: string;
  provider: string;
  event: GovernanceFeedEvent | null;
  trace: GovernanceDecisionTrace | null;
  receipt: HardStopReceipt | null;
};

function laneTone(lane: LedgerLane) {
  if (lane === "green") {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
  }

  if (lane === "yellow") {
    return "border-amber-400/30 bg-amber-500/10 text-amber-200";
  }

  if (lane === "red") {
    return "border-rose-400/30 bg-rose-500/10 text-rose-200";
  }

  return "border-blue-400/30 bg-blue-500/10 text-blue-200";
}

function statusTone(captured: boolean) {
  return captured
    ? "border-slate-700 bg-slate-900 text-slate-200"
    : "border-slate-700 bg-slate-950 text-slate-400";
}

export function ReceiptLedger({
  entries,
  activeLane,
  onSelectLane
}: {
  entries: ReceiptLedgerEntry[];
  activeLane: LedgerLane;
  onSelectLane: (lane: LedgerLane) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-panel/90 p-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">
            Unified Receipt Ledger
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Red, green, yellow, and blue evidence shells. Empty lanes stay explicit until real artifacts arrive.
          </p>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-300">
          judge lane
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {entries.map((entry) => {
          const captured = Boolean(entry.event || entry.receipt);
          const selected = entry.lane === activeLane;

          return (
            <button
              key={entry.lane}
              type="button"
              onClick={() => onSelectLane(entry.lane)}
              className={`rounded-xl border p-4 text-left transition-colors ${selected ? "border-blue-400/40 bg-blue-500/5" : "border-slate-800 bg-slate-950/70 hover:border-slate-700"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${laneTone(entry.lane)}`}
                >
                  {entry.lane}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${statusTone(captured)}`}
                >
                  {captured ? "captured" : "pending"}
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-100">{entry.title}</p>
              <p className="mt-1 text-xs text-slate-400">{entry.subtitle}</p>

              <dl className="mt-4 grid gap-2 text-xs text-slate-400">
                <div className="flex justify-between gap-3">
                  <dt>expected action</dt>
                  <dd className="break-all text-right text-slate-200">{entry.expectedAction}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>provider</dt>
                  <dd className="break-all text-right text-slate-200">{entry.provider}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>route</dt>
                  <dd className="break-all text-right text-slate-200">{entry.route}</dd>
                </div>
              </dl>

              {entry.event ? (
                <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300">
                  <p>domain {entry.event.domain}</p>
                  <p>tier {entry.event.tier}</p>
                  <p>outcome {entry.event.outcome}</p>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-slate-700 bg-slate-950/60 p-3 text-xs text-slate-500">
                  No receipt artifact emitted yet.
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
