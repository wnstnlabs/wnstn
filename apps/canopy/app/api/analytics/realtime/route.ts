import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { Effect } from 'effect';
import { CanopyRuntime } from '@/lib/effect/runtime';
import { Db } from '@/lib/effect/db';
import { event, site, member } from '@/db/schema';
import { eq, sql, and, gte, inArray, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');
  const windowSeconds = parseInt(searchParams.get('window') || '60');

  if (!siteId) {
    return new Response(JSON.stringify({ error: 'siteId is required' }), { status: 400 });
  }

  const activeOrgId = (session as any)?.session?.activeOrganizationId ?? null;

  const program = Effect.gen(function* () {
    const db = yield* Db;
    
    const myMembers = yield* Effect.tryPromise({
      try: () => db.select().from(member).where(eq(member.userId, session.user.id)),
      catch: () => [] as any,
    });
    const orgIds = myMembers.map((m: any) => m.organizationId);
    
    let sitesQuery: any = db.select().from(site);
    if (orgIds.length > 0) {
      sitesQuery = sitesQuery.where(
        sql`${site.organizationId} IN (${orgIds.join(',')}) OR ${site.createdById} = ${session.user.id}`
      );
    } else {
      sitesQuery = sitesQuery.where(eq(site.createdById, session.user.id));
    }
    // Don't filter by activeOrgId - user should have access to all their sites
    const sites = (yield* Effect.tryPromise({ try: () => sitesQuery, catch: () => [] as any })) as any[];
    const hasAccess = sites.some((s: any) => s.id === siteId);
    if (!hasAccess) {
      return { error: 'Site not found or access denied' } as const;
    }

    const start = new Date(Date.now() - windowSeconds * 1000);
    
    const conditions = [
      eq(event.siteId, siteId),
      gte(event.createdAt, start),
    ];

    // Active visitors (unique sessions in window)
    const activeVisitorsRows = yield* Effect.tryPromise({
      try: () => db.select({ count: sql<number>`count(DISTINCT ${event.sessionId})::int` }).from(event).where(and(...conditions)),
      catch: () => [{ count: 0 }],
    });
    const activeVisitors = activeVisitorsRows[0]?.count ?? 0;

    // Pageviews per minute
    const pageviewsRows = yield* Effect.tryPromise({
      try: () => db.select({ count: sql<number>`count(*)::int` }).from(event).where(and(...conditions, eq(event.name, 'pageview'))),
      catch: () => [{ count: 0 }],
    });
    const pageviewsPerMinute = (pageviewsRows[0]?.count ?? 0) / (windowSeconds / 60);

    // Events per minute
    const eventsRows = yield* Effect.tryPromise({
      try: () => db.select({ count: sql<number>`count(*)::int` }).from(event).where(and(...conditions)),
      catch: () => [{ count: 0 }],
    });
    const eventsPerMinute = (eventsRows[0]?.count ?? 0) / (windowSeconds / 60);

    // Top active pages
    const topPagesRows = yield* Effect.tryPromise({
      try: () => db
        .select({
          path: event.path,
          count: sql<number>`count(*)::int`,
        })
        .from(event)
        .where(and(...conditions, eq(event.name, 'pageview')))
        .groupBy(event.path)
        .orderBy(desc(sql`count(*)`))
        .limit(10),
      catch: () => [] as any,
    });

    // Recent events
    const recentEventsRows = yield* Effect.tryPromise({
      try: () => db
        .select({
          id: event.id,
          name: event.name,
          path: event.path,
          country: event.country,
          createdAt: event.createdAt,
        })
        .from(event)
        .where(and(...conditions))
        .orderBy(desc(event.createdAt))
        .limit(20),
      catch: () => [] as any,
    });

    return {
      activeVisitors,
      pageviewsPerMinute: Math.round(pageviewsPerMinute * 10) / 10,
      eventsPerMinute: Math.round(eventsPerMinute * 10) / 10,
      topActivePages: topPagesRows.map((p: any) => ({
        key: p.path || '/',
        count: p.count,
        percentage: 0,
      })),
      recentEvents: recentEventsRows.map((e: any) => ({
        id: e.id,
        name: e.name,
        path: e.path || '/',
        country: e.country,
        timestamp: e.createdAt.toISOString(),
      })),
    };
  });

  const result = await CanopyRuntime.runPromise(program.pipe(Effect.catchAll((e) => Effect.succeed({ error: String(e) }))));
  
  if ('error' in result) {
    return new Response(JSON.stringify({ error: result.error }), { status: 500 });
  }

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
}