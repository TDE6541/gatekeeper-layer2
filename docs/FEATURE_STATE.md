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

- Real: `POST /api/actions/supervised` is a real supervised server route for `github_issue_create`. It requests approval first and only attempts GitHub execution after approved execute.
- Partial: Approval is local to the Action Surface. Success still depends on Auth0 session refresh-token material, GitHub connection token exchange, and GitHub repo access.
- HOLD: Missing refresh token, missing federated connection token-exchange grant, or insufficient GitHub repo access can stop the lane after approval and surface a precise HOLD.
- Do not claim: external supervisor automation, Guardian/CIBA approval, or guaranteed GitHub issue creation in every tenant/session.

## Red Lane

- Real: `POST /api/actions/hard-stop` exists, requires an authenticated app session, and returns a hard-stop receipt showing `provider_consulted: false` and `blocked_before_identity: true`.
- Partial: It is a focused proof lane for one governed action, not a full policy platform rollout.
- HOLD: OpenFGA and broader authorization backends are not part of this red route today.
- Do not claim: red proves OpenFGA, broad policy orchestration, or a completed multi-system enforcement stack.

## Blue Lane / OpenFGA

- Real: `POST /api/actions/blue` is a live server route. It performs a real OpenFGA `check` for `user:tim` viewer on `doc:dashboard` and only returns the Audit Feed export when the check allows access.
- Partial: This is one thin demo proof, not a broad authorization platform. The blue route uses a fixed demo subject/object pair and depends on live OpenFGA store/model/credential configuration.
- HOLD: If the OpenFGA store, model, tuple, or hosted credentials drift, the route can truthfully return `blocked` or `HOLD` instead of success.
- Do not claim: blue is a broad RBAC/ABAC system, blue resolves caller identity from the Auth0 session, or the repo ships multi-resource OpenFGA enforcement.

## Safe Public Posture

- GateKeeper Layer 2 is a governance-first hackathon build with live Auth0 Universal Login, a protected dashboard, a real green Token Vault path, and a real red hard-stop proof.
- Green may truthfully resolve as `HOLD` when tenant/session credential prerequisites are missing.
- Yellow is a live supervised proof lane that may truthfully return `success` or `HOLD`; blue is now a thin live OpenFGA proof lane.
- Safe public line: `30+ operator-facing governance surfaces`.

## Do Not Claim

- OpenFGA is broadly shipped across the product.
- Yellow is fully implemented.
- Green is guaranteed success in every tenant/session.
- Blue resolves live caller identity instead of the fixed demo tuple.
- Exact plugin skill counts in public-facing copy.

