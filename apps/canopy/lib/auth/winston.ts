/**
 * Winston SSO — optional genericOAuth provider for Canopy.
 *
 * Design: Winston can act as OIDC Provider (better-auth oidcProvider plugin)
 *          Canopy acts as OIDC Client via genericOAuth. No hard coupling.
 *
 * How to enable:
 *  1. In Winston app (`winston`): enable `oidcProvider` plugin in `lib/auth.ts`:
 *       import { oidcProvider } from "better-auth/plugins";
 *       plugins: [..., oidcProvider({ loginPage: "/login", trustedClients: [...] })]
 *     Then create an OIDC client for Canopy (via better-auth OIDC admin) with:
 *       client_id + client_secret, redirect_uris: ["https://canopy.your.app/api/auth/callback/winston"]
 *  2. In Canopy: set env vars WINSTON_OIDC_... (see .env.example)
 *     If any of them are absent, Winston SSO is simply not offered.
 *
 * Open-source note: self-hosting Canopy without Winston works perfectly —
 * this provider is only added when env vars exist, and never throws if missing.
 */

export type WinstonOAuthConfig = {
  clientId: string;
  clientSecret: string;
  issuer: string;
};

export function getWinstonOAuthConfig(): WinstonOAuthConfig | null {
  const issuer = process.env.WINSTON_OIDC_ISSUER?.trim().replace(/\/$/, '');
  const clientId = process.env.WINSTON_OIDC_CLIENT_ID?.trim();
  const clientSecret = process.env.WINSTON_OIDC_CLIENT_SECRET?.trim();
  if (!issuer || !clientId || !clientSecret) return null;
  return { issuer, clientId, clientSecret };
}

// GenericOAuth expects { clientId, clientSecret, authorizationUrl, tokenUrl, userInfoUrl, scopes }
// We derive those from the issuer's .well-known/openid-configuration if possible,
// but better-auth genericOAuth also accepts discoveryUrl.
export function winstonOAuthProvider() {
  const cfg = getWinstonOAuthConfig();
  if (!cfg) return null;

  // better-auth genericOAuth('oidc') style — discoveryUrl auto-fetches endpoints
  // We return the shape expected by `genericOAuth({ config: [...] })`
  // If your better-auth version expects explicit URLs, we fall back to standard OIDC paths.
  return {
    providerId: 'winston',
    clientId: cfg.clientId,
    clientSecret: cfg.clientSecret,
    discoveryUrl: `${cfg.issuer}/.well-known/openid-configuration`,
    // Fallbacks for older better-auth versions without discoveryUrl:
    authorizationUrl: `${cfg.issuer}/api/auth/oidc/authorize`,
    tokenUrl: `${cfg.issuer}/api/auth/oidc/token`,
    userInfoUrl: `${cfg.issuer}/api/auth/oidc/userinfo`,
    scopes: ['openid', 'email', 'profile'],
    // Map Winston user info → Canopy user
    // Winston OIDC returns { sub, email, name, picture }
    mapProfileToUser: (profile: Record<string, unknown>) => ({
      email: profile.email as string,
      name: (profile.name as string) || (profile.email as string),
      image: (profile.picture as string) || undefined,
      emailVerified: true, // Winston already verified enterprise users
    }),
  } as const;
}

export function isWinstonSsoEnabled(): boolean {
  return getWinstonOAuthConfig() !== null;
}
