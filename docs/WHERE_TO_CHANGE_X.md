# Where To Change X

Use this as the fast maintenance map for the current Layer 2 repo.

| If you need to change... | Start here | Why |
| --- | --- | --- |
| Governance domains, tiers, or profiles | `lib/governance.ts` | Defines the domain list, profile list, tier resolution, and action catalog. |
| Feed event contract or HOLD labeling | `lib/governance.ts` | `GovernanceFeedEvent`, `HardStopReceipt`, and `getGovernanceOutcomeLabel(...)` live here. |
| Auth0 client/session setup | `lib/auth0.ts` | Auth0 client construction, authorization parameters, and `beforeSessionSaved` live here. |
| Route protection and auth route coverage | `proxy.ts` | Auth0 middleware is mounted here for app routes. |
| Public landing page copy | `app/page.tsx` | Home page thesis, login entry, and current posture cards live here. |
| Protected dashboard shell | `app/dashboard/page.tsx` | Dashboard header, auth gate, and panel composition live here. |
| Green lane behavior | `app/api/actions/full-auto/route.ts` | Real Token Vault route, green-lane success/HOLD behavior, and event/trace emission live here. |
| Google provider call details | `lib/token-vault.ts` | Connection name and Calendar FreeBusy API call live here. |
| Yellow lane behavior | `app/api/actions/supervised/route.ts` | Approval-first supervised route logic lives here. |
| Red lane behavior | `app/api/actions/hard-stop/route.ts` | Protected hard-stop route and receipt emission live here. |
| Blue lane behavior | `app/api/actions/blue/route.ts`, `lib/openfga-blue.ts` | Thin live OpenFGA check and Audit Feed export gate live here. |
| Action cards and lane summaries | `lib/governance.ts` | `ACTION_CATALOG` drives titles, providers, routes, and lane summaries. |
| Run buttons and lane-to-ledger wiring | `components/dashboard/action-surface.tsx` | Client-side route execution and ledger/feed updates live here. |
| Unified receipt ledger | `components/dashboard/receipt-ledger.tsx` | Red/green/yellow/blue evidence shells and empty-state wording live here. |
| Decision trace replay | `components/dashboard/decision-trace-panel.tsx` | Replay phases and raw trace rendering live here. |
| Enforcement feed | `components/dashboard/enforcement-feed.tsx` | Event ordering, proof labels, and HOLD rendering live here. |
| Connected account posture | `components/dashboard/connected-accounts.tsx` | Session identity, connection names, and token-ready hints live here. |
| Governance matrix | `components/dashboard/governance-matrix.tsx` | Domain-to-tier matrix for the active profile lives here. |
| Demo/public claim boundaries | `docs/FEATURE_STATE.md` | Safe public posture and do-not-claim list live here. |
| Video talk track and screenshot plan | `docs/WAVE6_CUE_SHEET.md` | Final demo notes live here. |
| Repo front doors and navigation docs | `README.md`, `REPO_INDEX.md`, `docs/INDEX.md` | Start here for repo-level copy and orientation. |

## Blue Lane Note

- The blue lane is now a thin live server route backed by `app/api/actions/blue/route.ts`.
- If blue scope grows beyond this one proof, update `lib/openfga-blue.ts`, `components/dashboard/action-surface.tsx`, `components/dashboard/receipt-ledger.tsx`, `components/dashboard/decision-trace-panel.tsx`, `docs/FEATURE_STATE.md`, and `docs/WAVE6_CUE_SHEET.md` together.

