/**
 * Infisical Integration for Canopy API Key Management
 * 
 * Uses Infisical v4 API for secret management.
 * API Reference: https://infisical.com/docs/api-reference/endpoints/secrets
 */

import crypto from 'crypto';

/**
 * Generate a new API key with the canopy_ prefix
 */
export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(24);
  const randomPart = randomBytes.toString('base64url');
  return `canopy_${randomPart}`;
}

/**
 * Hash an API key for secure storage (SHA-256 hex)
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Verify an API key against a stored hash using timing-safe comparison
 */
export function verifyApiKey(key: string, hash: string): boolean {
  const keyHash = hashApiKey(key);
  return crypto.timingSafeEqual(Buffer.from(keyHash), Buffer.from(hash));
}

/**
 * Infisical client configuration from environment variables
 */
interface InfisicalConfig {
  siteUrl: string;
  clientId: string;
  clientSecret: string;
  projectId: string;
  environment: string;
}

/**
 * Get Infisical configuration from environment variables
 */
export function getInfisicalConfig(): InfisicalConfig | null {
  const siteUrl = process.env.INFISICAL_SITE_URL;
  const clientId = process.env.INFISICAL_CLIENT_ID;
  const clientSecret = process.env.INFISICAL_CLIENT_SECRET;
  const projectId = process.env.INFISICAL_PROJECT_ID;
  const environment = process.env.INFISICAL_ENVIRONMENT ?? 'dev';

  if (!siteUrl || !clientId || !clientSecret || !projectId) {
    return null;
  }

  return { siteUrl, clientId, clientSecret, projectId, environment };
}

/**
 * Infisical access token response
 */
interface InfisicalTokenResponse {
  accessToken: string;
  expiresIn: number;
}

/**
 * Get an access token from Infisical using client credentials (Universal Auth)
 * POST /api/v1/auth/universal-auth/login
 */
export async function getInfisicalAccessToken(config: InfisicalConfig): Promise<string> {
  const response = await fetch(`${config.siteUrl}/api/v1/auth/universal-auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Infisical auth failed: ${response.status} ${error}`);
  }

  const data = (await response.json()) as { accessToken: string };
  return data.accessToken;
}

/**
 * Fetch a secret from Infisical
 * GET /api/v4/secrets/{secretName}?projectId=&environment=&viewSecretValue=true
 */
export async function getInfisicalSecret(
  config: InfisicalConfig,
  token: string,
  secretName: string
): Promise<string | null> {
  const response = await fetch(
    `${config.siteUrl}/api/v4/secrets/${encodeURIComponent(secretName)}?projectId=${config.projectId}&environment=${config.environment}&viewSecretValue=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    const error = await response.text();
    throw new Error(`Infisical secret fetch failed: ${response.status} ${error}`);
  }

  const data = (await response.json()) as { secret: { secretValue: string } };
  return data.secret?.secretValue ?? null;
}

/**
 * Create or update a secret in Infisical
 * POST /api/v4/secrets/{secretName}
 */
export async function setInfisicalSecret(
  config: InfisicalConfig,
  token: string,
  secretName: string,
  secretValue: string
): Promise<boolean> {
  const response = await fetch(`${config.siteUrl}/api/v4/secrets/${encodeURIComponent(secretName)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId: config.projectId,
      environment: config.environment,
      secretValue,
    }),
  });

  return response.ok;
}

/**
 * Delete a secret from Infisical
 * DELETE /api/v4/secrets/{secretName}?projectId=&environment=
 */
export async function deleteInfisicalSecret(
  config: InfisicalConfig,
  token: string,
  secretName: string
): Promise<boolean> {
  const response = await fetch(
    `${config.siteUrl}/api/v4/secrets/${encodeURIComponent(secretName)}?projectId=${config.projectId}&environment=${config.environment}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.ok;
}

/**
 * List all secrets for a project/environment
 * GET /api/v4/secrets?projectId=&environment=&viewSecretValue=true
 */
export async function listInfisicalSecrets(
  config: InfisicalConfig,
  token: string
): Promise<Array<{ secretKey: string; secretValue: string }>> {
  const response = await fetch(
    `${config.siteUrl}/api/v4/secrets?projectId=${config.projectId}&environment=${config.environment}&viewSecretValue=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) return [];

  const data = (await response.json()) as { secrets: Array<{ secretKey: string; secretValue: string }> };
  return data.secrets ?? [];
}

/**
 * Store an API key in Infisical (as a secret) and return its hash
 * 
 * @param siteId - The site ID
 * @param name - The API key name (user-facing)
 * @param key - The raw API key (only shown once)
 * @returns The stored key hash, or null if Infisical not configured
 */
export async function storeApiKeyInInfisical(
  siteId: string,
  name: string,
  key: string
): Promise<string | null> {
  const config = getInfisicalConfig();
  if (!config) return null;

  try {
    const token = await getInfisicalAccessToken(config);
    const secretName = `CANOPY_API_KEY_${siteId}_${name}`;
    await setInfisicalSecret(config, token, secretName, key);
    return hashApiKey(key);
  } catch (error) {
    console.error('[canopy] Infisical store failed:', error);
    return null;
  }
}

/**
 * Retrieve an API key from Infisical by site and name
 * 
 * @param siteId - The site ID
 * @param name - The API key name
 * @returns The raw API key or null if not found/Infisical not configured
 */
export async function getApiKeyFromInfisical(siteId: string, name: string): Promise<string | null> {
  const config = getInfisicalConfig();
  if (!config) return null;

  try {
    const token = await getInfisicalAccessToken(config);
    const secretName = `CANOPY_API_KEY_${siteId}_${name}`;
    return await getInfisicalSecret(config, token, secretName);
  } catch (error) {
    console.error('[canopy] Infisical fetch failed:', error);
    return null;
  }
}

/**
 * Delete an API key from Infisical
 * 
 * @param siteId - The site ID
 * @param name - The API key name
 * @returns True if deleted successfully
 */
export async function deleteApiKeyFromInfisical(siteId: string, name: string): Promise<boolean> {
  const config = getInfisicalConfig();
  if (!config) return false;

  try {
    const token = await getInfisicalAccessToken(config);
    const secretName = `CANOPY_API_KEY_${siteId}_${name}`;
    return await deleteInfisicalSecret(config, token, secretName);
  } catch (error) {
    console.error('[canopy] Infisical delete failed:', error);
    return false;
  }
}

/**
 * List all API key names for a site from Infisical
 * 
 * @param siteId - The site ID
 * @returns Array of API key names
 */
export async function listApiKeysFromInfisical(siteId: string): Promise<string[]> {
  const config = getInfisicalConfig();
  if (!config) return [];

  try {
    const token = await getInfisicalAccessToken(config);
    const secrets = await listInfisicalSecrets(config, token);
    const prefix = `CANOPY_API_KEY_${siteId}_`;
    return secrets
      .filter(s => s.secretKey.startsWith(prefix))
      .map(s => s.secretKey.slice(prefix.length));
  } catch (error) {
    console.error('[canopy] Infisical list failed:', error);
    return [];
  }
}