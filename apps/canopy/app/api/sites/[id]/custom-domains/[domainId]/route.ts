import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Effect } from 'effect';
import { CanopyRuntime } from '@/lib/effect/runtime';
import { Db } from '@/lib/effect/db';
import { getUserSites } from '@/lib/api/access';
import { site, customDomain } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/** Load a site and confirm the user can access it (org membership or creator). */
async function getAccessibleSite(db: any, userId: string, siteId: string) {
  const rows = await db.select().from(site).where(eq(site.id, siteId)).limit(1);
  const current = rows[0];
  if (!current) return null;
  const accessible = await getUserSites(db, userId);
  if (!accessible.some((s: any) => s.id === siteId)) return null;
  return current;
}

export async function DELETE(
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

    yield* Effect.tryPromise({
      try: () => db.delete(customDomain).where(and(eq(customDomain.id, domainId), eq(customDomain.siteId, siteId))),
      catch: () => new Error('Failed to delete custom domain'),
    });

    return { status: 'deleted' as const };
  });

  const result = await CanopyRuntime.runPromise(program.pipe(Effect.catchAll(() => Effect.succeed({ status: 'error' as const }))));

  if ('status' in result && result.status === 'not_found') {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 });
  }
  if ('status' in result && result.status === 'error') {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}