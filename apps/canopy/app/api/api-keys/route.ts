import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Effect } from 'effect';
import { CanopyRuntime } from '@/lib/effect/runtime';
import { Db } from '@/lib/effect/db';
import { db } from '@/lib/db';
import { site, apiKey, member } from '@/db/schema';
import { eq, desc, inArray, isNull, and, sql } from 'drizzle-orm';
import { hashApiKey, generateApiKey, storeApiKeyInInfisical, deleteApiKeyFromInfisical } from '@/lib/infisical';

export const dynamic = 'force-dynamic';

/**
 * Get the site IDs the current user has access to
 */
async function getUserSiteIds(session: any): Promise<string[]> {
  const myMembers = await db.select().from(member).where(eq(member.userId, session.user.id));
  const orgIds = myMembers.map((m: any) => m.organizationId).filter(Boolean);

  if (orgIds.length === 0) {
    // No org membership — only sites created by this user with no org
    const rows = await db.select({ id: site.id }).from(site).where(eq(site.createdById, session.user.id)).limit(50);
    return rows.map(r => r.id);
  }

  // Sites in user's orgs
  const orgSites = await db.select({ id: site.id }).from(site).where(inArray(site.organizationId, orgIds)).limit(50);
  // Sites created by user with no org
  const personalSites = await db.select({ id: site.id }).from(site).where(and(eq(site.createdById, session.user.id), isNull(site.organizationId))).limit(50);
  // Sites created by user that have org (creator)
  const creatorSites = await db.select({ id: site.id }).from(site).where(and(eq(site.createdById, session.user.id), sql`${site.organizationId} IS NOT NULL`)).limit(50);

  const all = [...orgSites, ...personalSites, ...creatorSites];
  return all.filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i).map(s => s.id);
}

/**
 * Verify the user has access to a site
 */
async function userCanAccessSite(session: any, siteId: string): Promise<boolean> {
  const siteIds = await getUserSiteIds(session);
  return siteIds.includes(siteId);
}

export async function GET(req: Request) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const siteIds = await getUserSiteIds(session);
  if (siteIds.length === 0) {
    return NextResponse.json({ keys: [] });
  }

  // Optional filter by a single site
  const requestedSiteId = new URL(req.url).searchParams.get('siteId');
  const scopedSiteIds = requestedSiteId
    ? siteIds.filter((id) => id === requestedSiteId)
    : siteIds;
  if (scopedSiteIds.length === 0) {
    return NextResponse.json({ keys: [] });
  }

  const program = Effect.gen(function* () {
    const db = yield* Db;
    const keys = yield* Effect.tryPromise({
      try: () => db.select().from(apiKey).where(inArray(apiKey.siteId, scopedSiteIds)).orderBy(desc(apiKey.createdAt)),
      catch: () => [] as any,
    });
    return keys as any[];
  });

  const keys = await CanopyRuntime.runPromise(program.pipe(Effect.catchAll(() => Effect.succeed([]))));
  return NextResponse.json({ keys });
}

export async function POST(req: Request) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, siteId } = body;
  let key = body.key;

  if (!name || !siteId) {
    return NextResponse.json({ error: 'Name and siteId are required' }, { status: 400 });
  }

  // Verify the site belongs to this user
  const canAccess = await userCanAccessSite(session, siteId);
  if (!canAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // If no key provided, generate one
  if (!key) {
    key = generateApiKey();
  }

  const program = Effect.gen(function* () {
    const db = yield* Db;
    const id = `ak_${Date.now().toString(36)}`;
    const keyHash = hashApiKey(key);

    yield* Effect.tryPromise({
      try: () => db.insert(apiKey).values({ id, siteId, name, keyHash, createdAt: new Date() }),
      catch: (cause: any) => new Error(String(cause)),
    });

    return { id, name, keyHash };
  });

  const result = await CanopyRuntime.runPromise(
    program.pipe(Effect.catchAll(() => Effect.succeed(null)))
  );

  if (!result) {
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }

  // Store key in Infisical if configured (best-effort, local row is the source of truth)
  const infisicalHash = await storeApiKeyInInfisical(siteId, name, key);
  if (!infisicalHash) {
    console.warn('[canopy] Infisical could not store key, using local-only');
  }

  // Return the raw key only if we generated it (so user can copy it once)
  const response = {
    ...result,
    ...(body.key ? {} : { key }), // Include raw key only when it was server-generated
  };

  return NextResponse.json(response, { status: 201 });
}

export async function DELETE(req: Request) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const keyId = url.searchParams.get('id');
  const keySiteId = url.searchParams.get('siteId');

  if (!keyId) {
    return NextResponse.json({ error: 'API key ID is required' }, { status: 400 });
  }

  // If siteId provided, verify access
  if (keySiteId) {
    const canAccess = await userCanAccessSite(session, keySiteId);
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const program = Effect.gen(function* () {
    const db = yield* Db;

    // Look up the key record so we can clean up the Infisical secret too
    const existing = (yield* Effect.tryPromise({
      try: () => db.select({ id: apiKey.id, name: apiKey.name, siteId: apiKey.siteId }).from(apiKey).where(eq(apiKey.id, keyId)).limit(1),
      catch: () => [] as any[],
    })) as any[];

    yield* Effect.tryPromise({
      try: () => db.delete(apiKey).where(eq(apiKey.id, keyId)),
      catch: (cause: any) => new Error(String(cause)),
    });

    // Remove the secret from Infisical (best-effort)
    const record = existing[0];
    if (record) {
      yield* Effect.promise(() => deleteApiKeyFromInfisical(record.siteId, record.name)).pipe(
        Effect.catchAll(() => Effect.void)
      );
    }

    return { success: true };
  });

  const result = await CanopyRuntime.runPromise(
    program.pipe(Effect.catchAll(() => Effect.succeed({ success: false })))
  );
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}