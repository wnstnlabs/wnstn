// @ts-nocheck
'use client';

import { createAuthClient } from 'better-auth/react';
import { organizationClient, adminClient } from 'better-auth/client/plugins';

export const authClient: any = createAuthClient({
  plugins: [organizationClient(), adminClient()],
});

export const { useSession, signIn, signUp, signOut, organization } = authClient;
