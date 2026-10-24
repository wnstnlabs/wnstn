import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Effect } from 'effect';
import { CanopyRuntime } from '@/lib/effect/runtime';
import { Db } from '@/lib/effect/db';
import { getUserSites } from '@/lib/api/access';
import { site } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

    const record = current.verificationRecord || genRecord();
    const domain = current.domain;

    // Persist the record if it didn't exist
    if (!current.verificationRecord) {
      yield* Effect.tryPromise({
        try: () => db.update(site).set({ verificationRecord: record }).where(eq(site.id, siteId)),
        catch: () => new Error('Failed to set verification record'),
      });
    }

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