# Repo Index

Use this file when you need the fastest truthful map of the local Layer 2 repo.

## Canonical Entry Points

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Public landing page and Auth0 sign-in entry. |
| `app/dashboard/page.tsx` | Protected governance console. Redirects unauthenticated users to login. |
| `lib/auth0.ts` | Auth0 client setup, authorization parameters, and session refresh-token preservation. |
| `proxy.ts` | Auth0 middleware hook that protects app routes and mounts SDK auth behavior. |
| `lib/governance.ts` | Governance domains, tiers, action catalog, feed contract, HOLD labeling, and hard-stop receipt shape. |
| `app/api/actions/full-auto/route.ts` | Green lane server route. Real Token Vault path for Google Calendar FreeBusy. |
| `app/api/actions/supervised/route.ts` | Yellow lane server route. Approval-first supervised flow that can create a GitHub issue or return a truthful HOLD. |
| `app/api/actions/hard-stop/route.ts` | Red lane server route. Real hard-stop proof and receipt emission. |
| `app/api/actions/blue/route.ts` | Blue lane server route. Real OpenFGA-backed Audit Feed export gate. |
| `lib/token-vault.ts` | Google connection name and Calendar FreeBusy provider call. |
| `lib/openfga-blue.ts` | Thin hosted OpenFGA client helper for the blue lane proof. |

## Major Surfaces

| Surface | Purpose |
| --- | --- |
| `app/` | Next.js App Router pages, layout, and server routes. |
| `components/` | Dashboard panels and lane UI surfaces. |
| `lib/` | Auth0 wiring, governance model, and provider-call helpers. |
| `docs/` | Cue sheet, feature truth sheet, maintenance map, and docs front door. |

## Key Routes

| Route | Purpose |
| --- | --- |
| `/` | Public thesis page with Auth0 login entry and current posture summary. |
| `/dashboard` | Protected operator console. |
| `/auth/login` | Auth0 Universal Login entry. |
| `/auth/logout` | Auth0 logout route. |
| `POST /api/actions/full-auto` | Green lane route. Real provider-token path that can return `success` or a governed `HOLD`. |
| `POST /api/actions/supervised` | Yellow lane route. Requests approval first, then approved execute attempts GitHub issue creation and returns success or HOLD. |
| `POST /api/actions/hard-stop` | Red lane route. Emits blocked evidence and a hard-stop receipt. |
| `POST /api/actions/blue` | Blue lane route. Performs a real OpenFGA check before returning the Audit Feed export proof. |

## Key UI Panels

| Path | Purpose |
| --- | --- |
| `components/dashboard/governance-matrix.tsx` | Shows the resolved tier for each governance domain under the active profile. |
| `components/dashboard/connected-accounts.tsx` | Shows session identity and provider connection posture. |
| `components/dashboard/action-surface.tsx` | Renders lane action cards, calls server routes, and wires responses into the ledger/feed. |
| `components/dashboard/receipt-ledger.tsx` | Unified red, green, yellow, and blue evidence shells. |
| `components/dashboard/decision-trace-panel.tsx` | Replay of classification and enforcement states for the selected lane. |
| `components/dashboard/enforcement-feed.tsx` | Newest-first proof feed for route events. |

## Notes

- The blue lane is a thin live proof. `POST /api/actions/blue` performs a real OpenFGA check and emits a blue event/trace artifact with `fga_checked: true`.
- `components/dashboard/red-lane-receipt.tsx` exists, but it is not wired into `app/dashboard/page.tsx`. The unified ledger panels are the current canonical dashboard surfaces.
- For claim boundaries, use [docs/FEATURE_STATE.md](docs/FEATURE_STATE.md). For maintenance handoffs, use [docs/WHERE_TO_CHANGE_X.md](docs/WHERE_TO_CHANGE_X.md).

