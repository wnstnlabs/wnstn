import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { organization, admin } from 'better-auth/plugins';
import { genericOAuth } from 'better-auth/plugins/generic-oauth';
import { db } from './db';
import * as schema from '@/db/schema';
import { winstonOAuthProvider, isWinstonSsoEnabled } from './auth/winston';

// Canopy auth — standalone, enterprise-ready, Winston SSO optional.
// Enterprise features inherited from better-auth: organization, admin, sso (future), 2FA-ready.
// Winston login is appended only if WINSTON_OIDC_* env vars are present —
// so open-source self-hosters never need Winston.
const appUrl = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_CANOPY_URL ?? 'http://localhost:3002';

const winstonProvider = winstonOAuthProvider();

export const auth = betterAuth({
  baseURL: appUrl,
  secret: process.env.BETTER_AUTH_SECRET ?? 'dev-secret-change-me-in-prod-32-chars-min',
  trustedOrigins: [appUrl],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      // TODO: wire Resend / email provider
      console.log(`[canopy] reset password for ${user.email}: ${url}`);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`[canopy] verify ${user.email}: ${url}`);
    },
  },
  user: {
    additionalFields: {
      username: { type: 'string', required: false, unique: true, input: true },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['winston'],
      allowDifferentEmails: false,
    },
  },
  session: {
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      creatorRole: 'owner',
    }),
    admin(),
    ...(winstonProvider
      ? [
          genericOAuth({
            config: [
              {
                providerId: winstonProvider.providerId,
                clientId: winstonProvider.clientId,
                clientSecret: winstonProvider.clientSecret,
                // better-auth supports either discoveryUrl or explicit URLs
                discoveryUrl: (winstonProvider as unknown as { discoveryUrl?: string }).discoveryUrl,
                authorizationUrl: winstonProvider.authorizationUrl,
                tokenUrl: winstonProvider.tokenUrl,
                userInfoUrl: winstonProvider.userInfoUrl,
                scopes: [...winstonProvider.scopes],
                mapProfileToUser: winstonProvider.mapProfileToUser as unknown as (profile: Record<string, unknown>) => Record<string, unknown>,
              },
            ],
          }),
        ]
      : []),
  ],
});

export type Session = typeof auth.$Infer.Session;
export const isWinstonEnabled = isWinstonSsoEnabled();
