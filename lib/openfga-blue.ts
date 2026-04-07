import { CredentialsMethod, OpenFgaClient } from "@openfga/sdk";

export const BLUE_OPENFGA_SUBJECT = "user:tim";
export const BLUE_OPENFGA_RELATION = "viewer";
export const BLUE_OPENFGA_OBJECT = "doc:dashboard";

export type BlueOpenFgaDecision = {
  allowed: boolean;
  checkedAt: string;
  subject: string;
  relation: string;
  object: string;
  storeId: string;
  modelId: string;
};

let client: OpenFgaClient | null = null;

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required OpenFGA configuration: ${name}`);
  }

  return value;
}

function normalizeApiUrl(apiUrl: string) {
  return apiUrl.replace(/\/+$/, "");
}

function resolveAudience(apiUrl: string) {
  const configuredAudience = process.env.OPENFGA_API_AUDIENCE?.trim();

  if (configuredAudience) {
    return configuredAudience;
  }

  return `${normalizeApiUrl(apiUrl)}/`;
}

function resolveIssuer() {
  const configuredIssuer = process.env.OPENFGA_API_TOKEN_ISSUER?.trim();

  if (configuredIssuer) {
    return configuredIssuer;
  }

  return "auth.fga.dev";
}

function getClient() {
  if (client) {
    return client;
  }

  const apiUrl = readRequiredEnv("OPENFGA_API_URL");

  client = new OpenFgaClient({
    apiUrl,
    storeId: readRequiredEnv("OPENFGA_STORE_ID"),
    authorizationModelId: readRequiredEnv("OPENFGA_MODEL_ID"),
    credentials: {
      method: CredentialsMethod.ClientCredentials,
      config: {
        apiTokenIssuer: resolveIssuer(),
        apiAudience: resolveAudience(apiUrl),
        clientId: readRequiredEnv("OPENFGA_CLIENT_ID"),
        clientSecret: readRequiredEnv("OPENFGA_CLIENT_SECRET")
      }
    }
  });

  return client;
}

export async function checkBlueAuditFeedAccess(): Promise<BlueOpenFgaDecision> {
  const storeId = readRequiredEnv("OPENFGA_STORE_ID");
  const modelId = readRequiredEnv("OPENFGA_MODEL_ID");
  const openFga = getClient();
  const response = await openFga.check({
    user: BLUE_OPENFGA_SUBJECT,
    relation: BLUE_OPENFGA_RELATION,
    object: BLUE_OPENFGA_OBJECT
  });

  return {
    allowed: Boolean(response.allowed),
    checkedAt: new Date().toISOString(),
    subject: BLUE_OPENFGA_SUBJECT,
    relation: BLUE_OPENFGA_RELATION,
    object: BLUE_OPENFGA_OBJECT,
    storeId,
    modelId
  };
}
