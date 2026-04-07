import { Auth0Client } from "@auth0/nextjs-auth0/server";

const audience =
  process.env.AUTH0_AUDIENCE || process.env.AUTH0_CUSTOM_API_AUDIENCE;
const scope = process.env.AUTH0_SCOPE;

const authorizationParameters =
  audience || scope
    ? {
        ...(audience ? { audience } : {}),
        ...(scope ? { scope } : {})
      }
    : undefined;

export const auth0 = new Auth0Client({
  authorizationParameters,
  beforeSessionSaved: async (session) => ({
    ...session,
    tokenSet: {
      ...session.tokenSet,
      refreshToken: session.tokenSet.refreshToken
    }
  })
});
