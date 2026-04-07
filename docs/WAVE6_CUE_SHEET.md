# Wave 6 Judge Cue Sheet

## Screenshot Checklist

- Logged-in dashboard with the governance matrix and connected accounts visible.
- Receipt ledger before execution, with red, green, yellow, and blue shells visible. Yellow and blue empty shells should read as intentional pre-check state, not generic failure.
- Red route executed, with the red lane selected, blocked receipt evidence visible, the decision trace showing the block before provider consultation, and the enforcement feed showing `blocked`.
- Optional green route executed with `success`, showing the Google Calendar FreeBusy result.
- Optional green route executed with `HOLD`, showing the truthful credential/setup reason when tenant or session prerequisites are missing.
- Optional yellow route executed as a two-step supervised proof: request approval first, then approved execute. If execute returns `HOLD`, narrate the blocker instead of claiming success.
- Optional blue route executed, with the blue lane selected, the decision trace showing `fga_checked`, and the enforcement feed showing the real OpenFGA-backed result.

## Feature Map

- `app/dashboard/page.tsx` - protected console frame
- `components/dashboard/action-surface.tsx` - route triggers and lane-to-ledger wiring
- `components/dashboard/receipt-ledger.tsx` - unified red/green/yellow/blue evidence shell
- `components/dashboard/decision-trace-panel.tsx` - classification and enforcement replay
- `components/dashboard/enforcement-feed.tsx` - newest-first proof feed
- `app/api/actions/full-auto/route.ts` - real green Token Vault route
- `app/api/actions/supervised/route.ts` - approval-first yellow route
- `app/api/actions/hard-stop/route.ts` - real red hard-stop route
- `lib/token-vault.ts` - Google Calendar FreeBusy call

## Demo Notes

- Universal Login is real. The dashboard is protected by an Auth0 session.
- The governance-first claim applies at the lane level: once inside the dashboard, governance resolves before extra provider credentials are requested.
- Green is a real Token Vault path, but it may truthfully return `HOLD` when the session lacks a refresh token, the federated connection token-exchange grant is missing, or the connection setup is incomplete.
- Yellow is a live supervised proof. It requests approval first, then approved execute attempts GitHub issue creation and returns `success` or a truthful `HOLD`.
- Red is real proof that governance can block the action before provider consultation.
- Blue is a thin live OpenFGA proof in this build. Keep the claim narrow: one Audit Feed export gate, not a broad authorization platform.

## Safe Talk Track

- "Universal Login is live, the dashboard is protected, and the lanes show what governance allowed, staged, or blocked."
- "Green is a real route today, but it may correctly HOLD if the tenant or session is missing credential prerequisites."
- "Red is a real governance hard-stop proof."
- "Yellow is a live supervised proof: approval is requested first, then GitHub execution either succeeds or truthfully HOLDs on the blocker."

## Do Not Say

- "OpenFGA is fully shipped across the product."
- "Yellow is fully implemented."
- "Green always succeeds."

