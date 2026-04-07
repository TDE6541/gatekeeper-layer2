# Wave 6 Judge Cue Sheet

## Screenshot Checklist

- Logged-in dashboard with the governance matrix and connected accounts visible.
- Receipt ledger before execution, with red, green, yellow, and blue shells visible. Yellow and blue empty shells should read as intentional pre-check state, not generic failure.
- Red route executed, with the red lane selected, blocked receipt evidence visible, the decision trace showing the block before provider consultation, and the enforcement feed showing `blocked`.
- Optional green route executed with `success`, showing the Google Calendar FreeBusy result.
- Optional green route executed with `HOLD`, showing the truthful credential/setup reason when tenant or session prerequisites are missing.
- Optional yellow route executed only if you want to show the staged supervised shell. Do not present it as a completed approval flow.
- Do not plan a blue execution screenshot. The current build has no blue server artifact to capture.

## Feature Map

- `app/dashboard/page.tsx` - protected console frame
- `components/dashboard/action-surface.tsx` - route triggers and lane-to-ledger wiring
- `components/dashboard/receipt-ledger.tsx` - unified red/green/yellow/blue evidence shell
- `components/dashboard/decision-trace-panel.tsx` - classification and enforcement replay
- `components/dashboard/enforcement-feed.tsx` - newest-first proof feed
- `app/api/actions/full-auto/route.ts` - real green Token Vault route
- `app/api/actions/supervised/route.ts` - staged yellow route
- `app/api/actions/hard-stop/route.ts` - real red hard-stop route
- `lib/token-vault.ts` - Google Calendar FreeBusy call

## Demo Notes

- Universal Login is real. The dashboard is protected by an Auth0 session.
- The governance-first claim applies at the lane level: once inside the dashboard, governance resolves before extra provider credentials are requested.
- Green is a real Token Vault path, but it may truthfully return `HOLD` when the session lacks a refresh token, the federated connection token-exchange grant is missing, or the connection setup is incomplete.
- Yellow is staged. It returns the supervised shape, but it does not perform live approval or GitHub execution in the current local repo.
- Red is real proof that governance can block the action before provider consultation.
- Blue is shell-only in this build. Do not claim OpenFGA is live.

## Safe Talk Track

- "Universal Login is live, the dashboard is protected, and the lanes show what governance allowed, staged, or blocked."
- "Green is a real route today, but it may correctly HOLD if the tenant or session is missing credential prerequisites."
- "Red is a real governance hard-stop proof."
- "Yellow and blue show the governed shape of the system without pretending the backend work is complete."

## Do Not Say

- "OpenFGA is shipped."
- "Yellow is fully implemented."
- "Green always succeeds."
