import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Effect } from 'effect';
import { CanopyRuntime } from '@/lib/effect/runtime';
import { Db } from '@/lib/effect/db';
import { site } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

function genRecord(): string {
  return `canopy-site=${randomBytes(16).toString('hex')}`;
}

export async function GET(req: Request) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get('site');
  if (!siteId) return NextResponse.json({ error: 'Missing site parameter' }, { status: 400 });

  const program = Effect.gen(function* () {
    const db = yield* Db;
    const memberships = yield* Effect.tryPromise({
      try: () => db.select().from(site).where(eq(site.id, siteId)).limit(1),
      catch: () => [] as any,
    });
    const current = memberships[0];
    if (!current) return { status: 'not_found' as const };

    // check if user owns this site via org
    const myOrgs = yield* Effect.tryPromise({
      try: () => db.execute(sql`SELECT organization_id FROM member WHERE user_id = ${session.user.id}`),
      catch: () => [] as any,
    });
    const orgIds = (myOrgs as unknown as any[]).map((m) => m.organization_id);
    if (orgIds.length === 0 || !orgIds.includes(current.organizationId)) {
      return { status: 'forbidden' as const };
    }

    const record = current.verificationRecord ?? genRecord();
    if (!current.verificationRecord) {
      yield* Effect.tryPromise({
        try: () => db.update(site).set({ verificationRecord: record }).where(eq(site.id, siteId)),
        catch: () => new Error('Failed to set verification record'),
      });
    }
    return { status: 'pending' as const, record, domain: current.domain };
  });

  const result = await CanopyRuntime.runPromise(program.pipe(Effect.catchAll(() => Effect.succeed({ status: 'error' as const }))));
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get('site');
  if (!siteId) return NextResponse.json({ error: 'Missing site parameter' }, { status: 400 });

  const program = Effect.gen(function* () {
    const db = yield* Db;
    const memberships = yield* Effect.tryPromise({
      try: () => db.select().from(site).where(eq(site.id, siteId)).limit(1),
      catch: () => [] as any,
    });
    const current = memberships[0];
    if (!current) return { status: 'not_found' as const };

    const record = current.verificationRecord ?? genRecord();
    const domain = current.domain;

    // Use a DNS-over-HTTPS check (Cloudflare)
    const dnsUrl = `https://cloudflare-dns.com/dns-query?name=${domain}&type=TXT`;
    
    const verified = yield* Effect.tryPromise({
      try: async () => {
        const res = await fetch(dnsUrl, { headers: { accept: 'application/dns-json' } });
        const data = await res.json();
        if (data.Answer) {
          return data.Answer.some((a: any) => a.data && a.data.includes(record));
        }
        return false;
      },
      catch: () => false,
    });

    if (verified) {
      yield* Effect.tryPromise({
        try: () => db.update(site).set({ verified: true, verifiedAt: new Date() }).where(eq(site.id, siteId)),
        catch: () => new Error('Failed to update verified status'),
      });
      return { status: 'verified' as const, domain };
    }
    return { status: 'pending' as const, record, domain };
  });

  const result = await CanopyRuntime.runPromise(program.pipe(Effect.catchAll(() => Effect.succeed({ status: 'error' as const }))));
  return NextResponse.json(result);
}