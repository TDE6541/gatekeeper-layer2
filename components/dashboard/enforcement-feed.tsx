import {
  getGovernanceOutcomeLabel,
  type GovernanceFeedEvent
} from "@/lib/governance";

function FeedBadge({ value }: { value: string }) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-300">
      {value}
    </span>
  );
}

function outcomeTone(event: GovernanceFeedEvent): string {
  const outcome = getGovernanceOutcomeLabel(event);

  if (outcome === "success") return "text-emerald-200";
  if (outcome === "HOLD") return "text-amber-200";
  if (outcome === "error") return "text-rose-200";
  if (outcome === "blocked") return "text-rose-200";
  if (outcome === "stub_ready" || outcome === "allowed") return "text-amber-200";
  return "text-slate-300";
}

function outcomeBorder(event: GovernanceFeedEvent): string {
  const outcome = getGovernanceOutcomeLabel(event);

  if (outcome === "success") {
    return "border-emerald-400/20 bg-emerald-400/5";
  }

  if (outcome === "HOLD") {
    return "border-amber-400/20 bg-amber-400/5";
  }

  if (outcome === "error" || outcome === "blocked") {
    return "border-rose-400/20 bg-rose-400/5";
  }

  return "border-slate-800 bg-slate-950/70";
}

function laneLabel(action: string) {
  if (action === "google_calendar_read") return "green";
  if (action === "github_issue_create") return "yellow";
  if (action === "pricing_rule_change") return "red";
  return "unknown";
}

function FeedField({
  label,
  value,
  tone = "text-slate-100"
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      <dt>{label}</dt>
      <dd className={`mt-1 break-all ${tone}`}>{value}</dd>
    </div>
  );
}

export function EnforcementFeed({
  events
}: {
  events: GovernanceFeedEvent[];
}) {
  const orderedEvents = [...events].sort((left, right) => {
    const timeDelta = Date.parse(right.timestamp) - Date.parse(left.timestamp);
    if (timeDelta !== 0) {
      return timeDelta;
    }

    return left.action.localeCompare(right.action);
  });

  return (
    <section className="rounded-2xl border border-slate-800 bg-panel/90 p-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">
            Enforcement Feed
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Deterministic newest-first event proof. Labels expose domain, tier, suppression, and outcome facts.
          </p>
        </div>
        <FeedBadge value={`${orderedEvents.length} events`} />
      </div>

      {orderedEvents.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 px-4 py-8 text-sm text-slate-400">
          Feed is empty. Run a lane route to capture the first real event.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {orderedEvents.map((event) => {
            const displayOutcome = getGovernanceOutcomeLabel(event);

            return (
              <article
                key={`${event.timestamp}-${event.action}`}
                className={`rounded-xl border p-4 ${outcomeBorder(event)}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    {event.timestamp}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <FeedBadge value={`lane:${laneLabel(event.action)}`} />
                    <FeedBadge value={event.tier} />
                    <FeedBadge value={displayOutcome} />
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-100">{event.action}</p>
                <dl className="mt-4 grid gap-2 text-xs text-slate-400 sm:grid-cols-2 xl:grid-cols-3">
                  <FeedField label="proof_domain" value={event.domain} />
                  <FeedField label="proof_tier" value={event.tier} tone={outcomeTone(event)} />
                  <FeedField label="proof_outcome" value={displayOutcome} tone={outcomeTone(event)} />
                  <FeedField
                    label="proof_credential_requested"
                    value={String(event.credential_requested)}
                  />
                  <FeedField
                    label="proof_approval_requested"
                    value={String(event.approval_requested)}
                  />
                  <FeedField
                    label="proof_fga_checked"
                    value={String(event.fga_checked)}
                  />
                  <FeedField label="proof_reason" value={event.reason} tone={outcomeTone(event)} />
                </dl>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
