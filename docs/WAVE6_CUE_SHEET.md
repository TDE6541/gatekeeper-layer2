# Wave 6 Judge Cue Sheet

## Screenshot Checklist

- Dashboard with receipt ledger showing all four lanes in pending state
- Red route executed: red lane card captured with blocked evidence
- Decision trace panel focused on red lane with six replay phases visible
- Enforcement feed showing newest-first event with proof labels

## Feature Map

- Unified receipt ledger shell: `components/dashboard/receipt-ledger.tsx`
- Decision trace replay panel: `components/dashboard/decision-trace-panel.tsx`
- Action-to-ledger wiring: `components/dashboard/action-surface.tsx`
- Deterministic proof feed: `components/dashboard/enforcement-feed.tsx`

## Demo Notes

- Green, yellow, and blue shells are intentionally honest when no artifacts exist.
- Red lane proves governance-first blocking before identity requests.
- No OpenFGA, deployment, or provider-logic claims are introduced in Wave 6.
