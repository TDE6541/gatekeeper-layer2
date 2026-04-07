# GateKeeper Layer 2

Wave 1 scaffolds the Auth0 hackathon web app substrate for GateKeeper Layer 2. The thesis is fixed: governance decides first, identity follows second.

## Local Run

1. Copy `.env.local.example` to `.env.local`.
2. Fill in the Auth0 values you have tonight and leave the OpenFGA placeholders blank for now.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`.
5. Open `http://localhost:3000`.

## Verification

- `npm run typecheck`
- `npm run build`

## Notes

- Auth is wired with `@auth0/nextjs-auth0` v4 using `lib/auth0.ts` and `proxy.ts`.
- The SDK mounts `/auth/login`, `/auth/logout`, `/auth/callback`, `/auth/profile`, and `/auth/access-token`.
- Wave 1 does not perform real provider calls, approval flows, OpenFGA checks, or CIBA wiring.
