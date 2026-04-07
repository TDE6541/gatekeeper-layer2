import { auth0 } from "@/lib/auth0";
import { ACTIVE_PROFILE, getDemoActionCards } from "@/lib/governance";

function IdentityValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
      <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-all text-sm text-slate-100">{value}</p>
    </div>
  );
}

export default async function HomePage() {
  const session = await auth0.getSession();
  const actions = getDemoActionCards();
  const userLabel =
    session?.user.name || session?.user.email || session?.user.sub || "unverified";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
      <section className="rounded-2xl border border-slate-800 bg-panel/90 p-6 shadow-panel">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
              GateKeeper / Layer 2 / Wave 2
            </p>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
                Governance decides first. Identity follows second.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                This scaffold proves the thesis before live provider work begins:
                if the system is going to block the action, it blocks it before
                requesting credentials.
              </p>
            </div>
          </div>
          <div className="flex min-w-[250px] flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
              Auth Shell
            </p>
            {session ? (
              <>
                <IdentityValue label="Session" value={userLabel} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <a
                    href="/dashboard"
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-center text-sm text-slate-100 hover:border-blue-400/50 hover:text-blue-200"
                  >
                    Open Dashboard
                  </a>
                  <a
                    href="/auth/logout"
                    className="rounded-lg border border-slate-700 px-3 py-2 text-center text-sm text-slate-100 hover:border-slate-500 hover:text-white"
                  >
                    /auth/logout
                  </a>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm leading-6 text-slate-300">
                  No application session is active yet. Sign in through the SDK
                  route to reach the protected dashboard.
                </p>
                <a
                  href="/auth/login"
                  className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-3 py-2 text-center text-sm text-blue-200 hover:border-blue-400/60 hover:bg-blue-500/20"
                >
                  /auth/login
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-slate-800 bg-panel/85 p-6 shadow-panel">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
            Current posture
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {actions.map((action) => (
              <div
                key={action.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
              >
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
                  {action.title}
                </p>
                <p className="mt-2 text-sm text-slate-100">{action.id}</p>
                <p className="mt-1 text-xs text-slate-400">
                  provider {action.provider} / domain {action.domain}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-panel/85 p-6 shadow-panel">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
            Active governance profile
          </p>
          <p className="mt-4 text-2xl font-semibold text-slate-50">
            {ACTIVE_PROFILE}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Conservative is pinned for Wave 1 so the yellow and red lanes remain
            honest before any live auth or policy backend is introduced.
          </p>
        </div>
      </section>
    </main>
  );
}
