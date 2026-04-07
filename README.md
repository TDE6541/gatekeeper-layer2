# GateKeeper Layer 2

GateKeeper Layer 2 is the Auth0 hackathon build for a governance-first operator console. The thesis is simple: governance decides first, identity follows second.

In this repo, Auth0 Universal Login establishes the application session and protects the dashboard. Once a user is inside the console, each action lane resolves governance before the app asks any provider for extra credentials or access tokens.

## What Is Live Right Now

- Universal Login and session protection are real. `/auth/login`, `/auth/logout`, `proxy.ts`, `lib/auth0.ts`, and `app/dashboard/page.tsx` are wired to `@auth0/nextjs-auth0` v4.
- The green lane is real. `POST /api/actions/full-auto` resolves governance, tries `auth0.getAccessTokenForConnection(...)`, and calls Google Calendar FreeBusy through `lib/token-vault.ts`.
- The red lane is real. `POST /api/actions/hard-stop` returns a hard-stop receipt that shows governance blocked the action before any provider consultation.
- The yellow lane is live supervised. `POST /api/actions/supervised` requests approval first, then approved execute attempts Auth0 GitHub connection token exchange and GitHub issue creation, returning `success` or a truthful `HOLD`.
- The blue lane / OpenFGA surface is live as a thin proof. `POST /api/actions/blue` performs a real OpenFGA check for `user:tim` viewer on `doc:dashboard` and releases an Audit Feed export only when the check allows it.

## Truth Boundaries

- Green is a real Token Vault path, but it is not guaranteed success in every tenant/session. It can truthfully resolve as `HOLD` when refresh tokens, federated token-exchange grant setup, or connection material are missing.
- Yellow is an approval-first supervised proof that can truthfully return `success` or `HOLD`. Blue is a thin live OpenFGA proof that can truthfully return `success`, `blocked`, or `HOLD`.
- If you need claim boundaries for demo or repo copy, read [docs/FEATURE_STATE.md](docs/FEATURE_STATE.md) first.

## Start Here

- [README.md](README.md) - front door and current repo posture
- [REPO_INDEX.md](REPO_INDEX.md) - canonical repo map
- [docs/INDEX.md](docs/INDEX.md) - docs front door
- [docs/FEATURE_STATE.md](docs/FEATURE_STATE.md) - safe public posture and do-not-claim list
- [docs/WAVE6_CUE_SHEET.md](docs/WAVE6_CUE_SHEET.md) - demo and screenshot notes

## Local Run

1. Copy `.env.local.example` to `.env.local`.
2. Fill in the Auth0 values for the tenant you are using.
3. Fill the OpenFGA values if you want to run the blue lane. Hosted Auth0 FGA can use `OPENFGA_API_URL`, `OPENFGA_STORE_ID`, `OPENFGA_MODEL_ID`, `OPENFGA_CLIENT_ID`, and `OPENFGA_CLIENT_SECRET`; issuer and audience can be set explicitly or derived by the helper.
4. Install dependencies with `npm install`.
5. Start the app with `npm run dev`.
6. Open `http://localhost:3000`.

## Verification

- `npm run typecheck`
- `npm run build`

