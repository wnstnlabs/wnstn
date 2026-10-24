import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Effect } from 'effect';
import { CanopyRuntime } from '@/lib/effect/runtime';
import { Db } from '@/lib/effect/db';
import { getUserSites } from '@/lib/api/access';
import { site, customDomain } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

function genRecord(): string {
  return `canopy-site=${randomBytes(16).toString('hex')}`;
}

function genId(): string {
  return `cd_${randomBytes(12).toString('hex')}`;
}

const CANOPY_CNAME_TARGET = process.env.CANOPY_CNAME_TARGET || 'cname.cano-py.wnstn.space';

/** Load a site and confirm the user can access it (org membership or creator). */
async function getAccessibleSite(db: any, userId: string, siteId: string) {
  const rows = await db.select().from(site).where(eq(site.id, siteId)).limit(1);
  const current = rows[0];
  if (!current) return null;
  const accessible = await getUserSites(db, userId);
  if (!accessible.some((s: any) => s.id === siteId)) return null;
  return current;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: siteId } = await params;
  if (!siteId) return NextResponse.json({ error: 'Missing site parameter' }, { status: 400 });

  const program = Effect.gen(function* () {
    const db = yield* Db;
    const current = yield* Effect.tryPromise({
      try: () => getAccessibleSite(db, session.user.id, siteId),
      catch: () => null,
    });
    if (!current) return { status: 'not_found' as const };

    const domains = yield* Effect.tryPromise({
      try: () => db.select().from(customDomain).where(eq(customDomain.siteId, siteId)).orderBy(customDomain.createdAt),
      catch: () => [] as any,
    });

    return domains.map((d: any) => ({
      id: d.id,
      domain: d.domain,
      verified: d.verified,
      sslStatus: d.sslStatus,
      cnameTarget: d.cnameTarget,
      createdAt: d.createdAt.toISOString(),
    }));
  });

  const result = await CanopyRuntime.runPromise(program.pipe(Effect.catchAll(() => Effect.succeed([]))));
  return NextResponse.json(result);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: siteId } = await params;
  if (!siteId) return NextResponse.json({ error: 'Missing site parameter' }, { status: 400 });

  let domain: string;
  try {
    const body = await req.json();
    domain = String(body.domain ?? '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!domain || !domain.includes('.')) {
    return NextResponse.json({ error: 'Invalid domain format (e.g., analytics.example.com)' }, { status: 400 });
  }

  const program = Effect.gen(function* () {
    const db = yield* Db;
    const current = yield* Effect.tryPromise({
      try: () => getAccessibleSite(db, session.user.id, siteId),
      catch: () => null,
    });
    if (!current) return { status: 'not_found' as const };

    // Check if domain already exists
    const existing = yield* Effect.tryPromise({
      try: () => db.select().from(customDomain).where(eq(customDomain.domain, domain)).limit(1),
      catch: () => [] as any,
    });
    if (existing.length > 0) {
      return { status: 'conflict' as const, error: 'Domain already in use' };
    }

    const record = genRecord();
    const id = genId();

    yield* Effect.tryPromise({
      try: () => db.insert(customDomain).values({
        id,
        siteId,
        domain,
        verified: false,
        verificationRecord: record,
        sslStatus: 'pending',
        cnameTarget: CANOPY_CNAME_TARGET,
        createdAt: new Date(),
      }),
      catch: () => new Error('Failed to create custom domain'),
    });

    return {
      id,
      domain,
      verified: false,
      sslStatus: 'pending',
      cnameTarget: CANOPY_CNAME_TARGET,
      createdAt: new Date().toISOString(),
    };
  });

  const result = await CanopyRuntime.runPromise(program.pipe(Effect.catchAll((e) => Effect.succeed({ status: 'error' as const, error: String(e) }))));

  if ('status' in result && result.status === 'not_found') {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 });
  }
  if ('status' in result && result.status === 'conflict') {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  if ('status' in result && result.status === 'error') {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result);
}