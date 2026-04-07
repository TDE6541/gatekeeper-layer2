import type { HardStopReceipt } from "@/lib/governance";

function ReceiptValue({
  label,
  value,
  tone = "text-slate-100"
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
      <dt className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
        {label}
      </dt>
      <dd className={`mt-2 break-all text-sm ${tone}`}>{value}</dd>
    </div>
  );
}

export function RedLaneReceipt({
  receipt
}: {
  receipt: HardStopReceipt | null;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-panel/90 p-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">
            Red Receipt
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Deterministic proof that governance blocked before identity.
          </p>
        </div>
        <span className="rounded-full border border-rose-400/30 bg-rose-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-rose-200">
          hard stop
        </span>
      </div>

      {!receipt ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 px-4 py-8 text-sm text-slate-400">
          Trigger the red action to capture the server receipt.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <ReceiptValue label="route" value={receipt.route} />
            <ReceiptValue label="domain" value={receipt.domain} />
            <ReceiptValue label="tier" value={receipt.tier} tone="text-rose-200" />
            <ReceiptValue label="outcome" value={receipt.outcome} tone="text-rose-200" />
            <ReceiptValue
              label="credential_requested"
              value={String(receipt.credential_requested)}
            />
            <ReceiptValue
              label="approval_requested"
              value={String(receipt.approval_requested)}
            />
            <ReceiptValue
              label="provider_consulted"
              value={String(receipt.provider_consulted)}
            />
            <ReceiptValue
              label="blocked_before_identity"
              value={String(receipt.blocked_before_identity)}
            />
            <ReceiptValue label="reason" value={receipt.reason} tone="text-rose-200" />
          </dl>
        </div>
      )}
    </section>
  );
}
