import {
  type GovernanceProfile,
  getGovernanceMatrix,
  getTierTone
} from "@/lib/governance";

export function GovernanceMatrix({
  profile
}: {
  profile: GovernanceProfile;
}) {
  const rows = getGovernanceMatrix(profile);

  return (
    <section className="rounded-2xl border border-slate-800 bg-panel/90 p-5 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">
            Governance Matrix
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Active profile <span className="text-slate-100">{profile}</span>
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-400">
          10 domains / 3 tiers
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-800">
        <div className="grid grid-cols-[1.5fr_0.9fr_0.8fr] bg-slate-950/80 px-4 py-3 text-[10px] uppercase tracking-[0.28em] text-slate-500">
          <span>Domain</span>
          <span>Resolved tier</span>
          <span>FGA</span>
        </div>
        <div className="divide-y divide-slate-800">
          {rows.map((row) => {
            const tone = getTierTone(row.tier);

            return (
              <div
                key={row.domain}
                className="grid grid-cols-[1.5fr_0.9fr_0.8fr] items-center gap-3 bg-slate-950/55 px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3 text-slate-100">
                  <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                  <span className="break-all">{row.domain}</span>
                </div>
                <span
                  className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tone.badge}`}
                >
                  {row.tier}
                </span>
                <span className="text-xs text-slate-400">
                  {row.requiresFGA ? "required later" : "not required"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
