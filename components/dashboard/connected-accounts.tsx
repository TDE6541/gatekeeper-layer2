type ConnectedAccountsProps = {
  userLabel: string;
  userEmail: string;
  userPicture: string | null;
  userSub: string;
};

type ProviderStatus = {
  provider: string;
  connectionName: string;
  lane: string;
  action: string;
  configured: boolean;
  connectedViaIdentity: boolean;
  tokenReady: boolean;
};

function deriveProviderStatus(userSub: string): ProviderStatus[] {
  const googleConnection = process.env.AUTH0_GOOGLE_CONNECTION || "";
  const githubConnection = process.env.AUTH0_GITHUB_CONNECTION || "";

  const isGoogleIdentity = userSub.startsWith("google-oauth2|");
  const isGithubIdentity = userSub.startsWith("github|");

  return [
    {
      provider: "Google",
      connectionName: googleConnection,
      lane: "documentation_comments",
      action: "google_calendar_read",
      configured: googleConnection.length > 0,
      connectedViaIdentity: isGoogleIdentity,
      tokenReady: isGoogleIdentity && googleConnection.length > 0
    },
    {
      provider: "GitHub",
      connectionName: githubConnection,
      lane: "new_file_creation",
      action: "github_issue_create",
      configured: githubConnection.length > 0,
      connectedViaIdentity: isGithubIdentity,
      tokenReady: false
    }
  ];
}

function StatusBadge({
  configured,
  connected
}: {
  configured: boolean;
  connected: boolean;
}) {
  if (connected) {
    return (
      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-emerald-200">
        connected via identity
      </span>
    );
  }

  if (configured) {
    return (
      <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-amber-200">
        configured &middot; not primary identity
      </span>
    );
  }

  return (
    <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-300">
      not configured
    </span>
  );
}

export function ConnectedAccounts({
  userLabel,
  userEmail,
  userPicture,
  userSub
}: ConnectedAccountsProps) {
  const providers = deriveProviderStatus(userSub);

  return (
    <section className="rounded-2xl border border-slate-800 bg-panel/90 p-5 shadow-panel">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">
          Connected Accounts
        </h2>
        <div className="flex items-center gap-3">
          {userPicture ? (
            <img
              src={userPicture}
              alt=""
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : null}
          <div>
            <p className="text-xs text-slate-400">
              Session <span className="text-slate-100">{userLabel}</span>
            </p>
            <p className="text-xs text-slate-500">{userEmail}</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-600">sub: {userSub}</p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {providers.map((row) => (
          <div
            key={row.provider}
            className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">
                {row.provider}
              </p>
              <StatusBadge
                configured={row.configured}
                connected={row.connectedViaIdentity}
              />
            </div>
            <dl className="mt-4 space-y-3 text-xs text-slate-400">
              <div className="flex justify-between gap-3">
                <dt>Auth0 connection</dt>
                <dd className="text-right text-slate-200">
                  {row.connectionName || "none"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Token vault</dt>
                <dd className={`text-right ${row.tokenReady ? "text-emerald-200" : "text-slate-200"}`}>
                  {row.tokenReady
                    ? "wired \u2014 Token Vault active"
                    : row.provider === "GitHub"
                      ? "approval-gated \u2014 approved execute tests token path"
                      : "awaiting identity"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Mapped action</dt>
                <dd className="break-all text-right text-slate-200">
                  {row.action}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Governance lane</dt>
                <dd className="break-all text-right text-slate-200">
                  {row.lane}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

