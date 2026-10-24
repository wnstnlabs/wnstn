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

/** Load a site and confirm the user can access it (org membership or creator). */
async function getAccessibleSite(db: any, userId: string, siteId: string) {
  const rows = await db.select().from(site).where(eq(site.id, siteId)).limit(1);
  const current = rows[0];
  if (!current) return null;
  const accessible = await getUserSites(db, userId);
  if (!accessible.some((s: any) => s.id === siteId)) return null;
  return current;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; domainId: string }> }
) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: siteId, domainId } = await params;
  if (!siteId || !domainId) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

  const program = Effect.gen(function* () {
    const db = yield* Db;
    const current = yield* Effect.tryPromise({
      try: () => getAccessibleSite(db, session.user.id, siteId),
      catch: () => null,
    });
    if (!current) return { status: 'not_found' as const };

    const domainRows = yield* Effect.tryPromise({
      try: () => db.select().from(customDomain).where(and(eq(customDomain.id, domainId), eq(customDomain.siteId, siteId))).limit(1),
      catch: () => [] as any,
    });
    const domain = domainRows[0];
    if (!domain) return { status: 'not_found' as const };

    const record = domain.verificationRecord || genRecord();
    const domainName = domain.domain;

    // Persist the record if it didn't exist
    if (!domain.verificationRecord) {
      yield* Effect.tryPromise({
        try: () => db.update(customDomain).set({ verificationRecord: record }).where(eq(customDomain.id, domainId)),
        catch: () => new Error('Failed to set verification record'),
      });
    }

    // Use a DNS-over-HTTPS check (Cloudflare) for CNAME record
    const dnsUrl = `https://cloudflare-dns.com/dns-query?name=${domainName}&type=CNAME`;

    const verified = yield* Effect.tryPromise({
      try: async () => {
        const res = await fetch(dnsUrl, { headers: { accept: 'application/dns-json' } });
        const data = await res.json();
        if (data.Answer) {
          return data.Answer.some((a: any) => a.data && a.data.includes(domain.cnameTarget));
        }
        return false;
      },
      catch: () => false,
    });

    if (verified) {
      yield* Effect.tryPromise({
        try: () => db.update(customDomain).set({ verified: true, verifiedAt: new Date() }).where(eq(customDomain.id, domainId)),
        catch: () => new Error('Failed to update verified status'),
      });
      return { status: 'verified' as const, domain: domainName };
    }
    return { status: 'pending' as const, record, domain: domainName, cnameTarget: domain.cnameTarget };
  });

  const result = await CanopyRuntime.runPromise(program.pipe(Effect.catchAll(() => Effect.succeed({ status: 'error' as const }))));

  if ('status' in result && result.status === 'not_found') {
    return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
  }
  if ('status' in result && result.status === 'error') {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }

  return NextResponse.json(result);
}