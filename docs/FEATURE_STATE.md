# Feature State

This file is the claim boundary for the current local repo state. If public/demo copy and older notes disagree, local code wins.

## Universal Login

- Real: Auth0 Universal Login and session protection are wired through `lib/auth0.ts`, `proxy.ts`, `app/page.tsx`, and `app/dashboard/page.tsx`.
- Partial: Runtime success still depends on valid tenant and `.env.local` configuration.
- HOLD: No tenant debugging or callback/provider repair work is part of this docs wave.
- Do not claim: every social/provider connection is already configured or production-ready.

## Green Lane

- Real: `POST /api/actions/full-auto` is a real server route. It resolves governance for `google_calendar_read`, attempts `auth0.getAccessTokenForConnection(...)`, and calls Google Calendar FreeBusy through `lib/token-vault.ts`.
- Partial: The same real route can end in `success` or in a governed `HOLD` depending on session and tenant-side credential material.
- HOLD: Missing refresh token, missing federated connection token-exchange grant, or missing/invalid connection setup can stop the lane before a usable Google access token is available.
- Do not claim: green always succeeds, all tenant-side credential material is already in place, or the lane is production-hardened across tenants.

## Yellow Lane

- Real: `POST /api/actions/supervised` exists and returns the governed supervised lane shape for `github_issue_create`.
- Partial: It is a staged lane. There is no live supervisor approval flow, no GitHub credential exchange, and no provider call in the current local repo.
- HOLD: Approval and identity handoff are still unwired.
- Do not claim: yellow is fully working, GitHub issue creation is live, or supervisor approval is already enforced end to end.

## Red Lane

- Real: `POST /api/actions/hard-stop` exists, requires an authenticated app session, and returns a hard-stop receipt showing `provider_consulted: false` and `blocked_before_identity: true`.
- Partial: It is a focused proof lane for one governed action, not a full policy platform rollout.
- HOLD: OpenFGA and broader authorization backends are not part of this red route today.
- Do not claim: red proves OpenFGA, broad policy orchestration, or a completed multi-system enforcement stack.

## Blue Lane / OpenFGA

- Real: The UI has a blue access-decision shell in the ledger and decision trace, and `lib/governance.ts` models which domains will require FGA later.
- Partial: There is no blue route, no blue server artifact, and current route outputs keep `fga_checked: false`.
- HOLD: OpenFGA is not wired as a live protected server-side surface in the current local repo.
- Do not claim: blue is shipped, OpenFGA is enforcing access decisions, or FGA-backed authorization is demo-ready.

## Safe Public Posture

- GateKeeper Layer 2 is a governance-first hackathon build with live Auth0 Universal Login, a protected dashboard, a real green Token Vault path, and a real red hard-stop proof.
- Green may truthfully resolve as `HOLD` when tenant/session credential prerequisites are missing.
- Yellow and blue are intentionally staged surfaces, not finished backend implementations.
- Safe public line: `30+ operator-facing governance surfaces`.

## Do Not Claim

- OpenFGA is shipped.
- Yellow is fully implemented.
- Green is guaranteed success in every tenant/session.
- Blue has a real server artifact in this repo state.
- Exact plugin skill counts in public-facing copy.
