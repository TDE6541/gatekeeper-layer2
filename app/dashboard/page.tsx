import { redirect } from "next/navigation";

import { ActionSurface } from "@/components/dashboard/action-surface";
import { ConnectedAccounts } from "@/components/dashboard/connected-accounts";
import { GovernanceMatrix } from "@/components/dashboard/governance-matrix";
import { auth0 } from "@/lib/auth0";
import { ACTIVE_PROFILE, getDemoActionCards } from "@/lib/governance";

export default async function DashboardPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login?returnTo=/dashboard");
  }

  const user = session.user;
  const userLabel = user.name || user.nickname || user.email || user.sub || "authenticated";
  const userEmail = user.email || "email unavailable";
  const userPicture = user.picture || null;
  const userSub = user.sub || "";
  const actions = getDemoActionCards(ACTIVE_PROFILE);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-6 py-8 sm:px-8 lg:px-10">
      <header className="rounded-2xl border border-slate-800 bg-panel/90 p-5 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
              Protected dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">
              GateKeeper Governance Console
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Authenticated session active. Governance resolves before any
              credential request. Identity is live.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/80 px-4 py-3">
              {userPicture ? (
                <img
                  src={userPicture}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-slate-200">
                  {userLabel.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-100">{userLabel}</p>
                <p className="truncate text-xs text-slate-400">{userEmail}</p>
              </div>
            </div>
            <a
              href="/auth/logout"
              className="rounded-lg border border-slate-700 px-4 py-3 text-sm text-slate-100 hover:border-slate-500 hover:text-white"
            >
              /auth/logout
            </a>
          </div>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <GovernanceMatrix profile={ACTIVE_PROFILE} />
        <ConnectedAccounts
          userLabel={userLabel}
          userEmail={userEmail}
          userPicture={userPicture}
          userSub={userSub}
        />
      </div>

      <ActionSurface actions={actions} />
    </main>
  );
}
