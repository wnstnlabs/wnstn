import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Effect } from 'effect';
import { CanopyRuntime } from '@/lib/effect/runtime';
import { Db } from '@/lib/effect/db';
import { event, site, member, organization } from '@/db/schema';
import { eq, sql, desc, and, gte, inArray, isNotNull, ne, ilike } from 'drizzle-orm';
import { AnalyticsQuerySchema } from '@/types/analytics';
import { formatRelativeTime } from '@/lib/utils';

function getRangeInterval(range: string): { start: Date; interval: 'minute' | 'hour' | 'day' } {
  const now = new Date();
  switch (range) {
    case '1h':
      return { start: new Date(now.getTime() - 60 * 60 * 1000), interval: 'minute' };
    case '24h':
      return { start: new Date(now.getTime() - 24 * 60 * 60 * 1000), interval: 'hour' };
    case '7d':
      return { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), interval: 'hour' };
    case '30d':
      return { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), interval: 'day' };
    case '90d':
      return { start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), interval: 'day' };
    default:
      return { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), interval: 'hour' };
  }
}

function formatTimeBucket(date: Date, interval: 'minute' | 'hour' | 'day'): string {
  if (interval === 'minute') {
    return date.toISOString().slice(0, 16) + ':00';
  }
  if (interval === 'hour') {
    return date.toISOString().slice(0, 13) + ':00:00';
  }
  return date.toISOString().slice(0, 10);
}

async function getUserSites(db: any, userId: string, activeOrgId: string | null) {
  const myMembers = await db.select().from(member).where(eq(member.userId, userId));
  const orgIds = myMembers.map((m: any) => m.organizationId);
  
  let sitesQuery = db.select().from(site);
  
  if (orgIds.length > 0) {
    sitesQuery = sitesQuery.where(
      sql`${site.organizationId} IN (${orgIds.join(',')}) OR ${site.createdById} = ${userId}`
    );
  } else {
    sitesQuery = sitesQuery.where(eq(site.createdById, userId));
  }
  
  if (activeOrgId) {
    sitesQuery = sitesQuery.where(eq(site.organizationId, activeOrgId));
  }
  
  return sitesQuery.orderBy(desc(site.createdAt)).limit(50);
}

export async function GET(request: Request) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = AnalyticsQuerySchema.safeParse({
    siteId: searchParams.get('siteId'),
    range: searchParams.get('range') || '7d',
    eventName: searchParams.get('eventName') || undefined,
    path: searchParams.get('path') || undefined,
    referrer: searchParams.get('referrer') || undefined,
    country: searchParams.get('country') || undefined,
    limit: searchParams.get('limit') || '100',
    offset: searchParams.get('offset') || '0',
  });

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid query params', details: parsed.error.flatten() }), { status: 400 });
  }

  const { siteId, range, eventName, path, referrer, country, limit, offset } = parsed.data;
  const activeOrgId = (session as any)?.session?.activeOrganizationId ?? null;

  const program = Effect.gen(function* () {
    const db = yield* Db;
    
    // Verify user has access to this site
    const sites = yield* Effect.tryPromise({
      try: () => getUserSites(db, session.user.id, activeOrgId),
      catch: () => [] as any,
    });
    
    const hasAccess = sites.some((s: any) => s.id === siteId);
    if (!hasAccess) {
      return { error: 'Site not found or access denied' } as const;
    }

    const { start, interval } = getRangeInterval(range);
    
    // Build base conditions
    const conditions = [
      eq(event.siteId, siteId),
      gte(event.createdAt, start),
    ];
    
    if (eventName) conditions.push(eq(event.name, eventName));
    if (path) conditions.push(ilike(event.path, `%${path}%`));
    if (referrer) conditions.push(ilike(event.referrer, `%${referrer}%`));
    if (country) conditions.push(eq(event.country, country));

    // Total events
    const totalEventsRows = yield* Effect.tryPromise({
      try: () => db.select({ count: sql<number>`count(*)::int` }).from(event).where(and(...conditions)),
      catch: () => [{ count: 0 }],
    });
    const totalEvents = totalEventsRows[0]?.count ?? 0;

    // Total pageviews
    const pageviewsRows = yield* Effect.tryPromise({
      try: () => db.select({ count: sql<number>`count(*)::int` }).from(event).where(and(...conditions, eq(event.name, 'pageview'))),
      catch: () => [{ count: 0 }],
    });
    const totalPageviews = pageviewsRows[0]?.count ?? 0;

    // Unique visitors (by sessionId)
    const uniqueVisitorsRows = yield* Effect.tryPromise({
      try: () => db.select({ count: sql<number>`count(DISTINCT ${event.sessionId})::int` }).from(event).where(and(...conditions)),
      catch: () => [{ count: 0 }],
    });
    const uniqueVisitors = uniqueVisitorsRows[0]?.count ?? 0;

    // Bounce rate - sessions with only 1 pageview
    const bounceRows = yield* Effect.tryPromise({
      try: () => db
        .select({ sessionId: event.sessionId, count: sql<number>`count(*)::int` })
        .from(event)
        .where(and(...conditions, eq(event.name, 'pageview')))
        .groupBy(event.sessionId)
        .having(sql`count(*) = 1`),
      catch: () => [] as any,
    });
    const bounceSessions = bounceRows.length;
    const totalSessionsRows = yield* Effect.tryPromise({
      try: () => db.select({ count: sql<number>`count(DISTINCT ${event.sessionId})::int` }).from(event).where(and(...conditions, eq(event.name, 'pageview'))),
      catch: () => [{ count: 0 }],
    });
    const totalSessions = totalSessionsRows[0]?.count ?? 0;
    const bounceRate = totalSessions > 0 ? (bounceSessions / totalSessions) * 100 : 0;

    // Avg session duration (approximate - time between first and last event in session)
    const sessionDurationRows = yield* Effect.tryPromise({
      try: () => db
        .select({
          sessionId: event.sessionId,
          minTime: sql<Date>`min(${event.createdAt})`,
          maxTime: sql<Date>`max(${event.createdAt})`,
        })
        .from(event)
        .where(and(...conditions))
        .groupBy(event.sessionId),
      catch: () => [] as any,
    });
    let avgSessionDuration = 0;
    if (sessionDurationRows.length > 0) {
      const totalMs = sessionDurationRows.reduce((sum, s) => sum + (new Date(s.maxTime).getTime() - new Date(s.minTime).getTime()), 0);
      avgSessionDuration = totalMs / sessionDurationRows.length;
    }

    // Top pages
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

    // Top referrers
    const topReferrersRows = yield* Effect.tryPromise({
      try: () => db
        .select({
          referrer: event.referrer,
          count: sql<number>`count(*)::int`,
        })
        .from(event)
        .where(and(...conditions, isNotNull(event.referrer), ne(event.referrer, '')))
        .groupBy(event.referrer)
        .orderBy(desc(sql`count(*)`))
        .limit(10),
      catch: () => [] as any,
    });

    // Top countries
    const topCountriesRows = yield* Effect.tryPromise({
      try: () => db
        .select({
          country: event.country,
          count: sql<number>`count(*)::int`,
        })
        .from(event)
        .where(and(...conditions, isNotNull(event.country), ne(event.country, '')))
        .groupBy(event.country)
        .orderBy(desc(sql`count(*)`))
        .limit(10),
      catch: () => [] as any,
    });

    // Time series
    const timeSeriesRows = yield* Effect.tryPromise({
      try: () => db
        .select({
          bucket: sql.raw(`date_trunc('${interval}', ${event.createdAt})`).as('bucket'),
          count: sql<number>`count(*)::int`,
        })
        .from(event)
        .where(and(...conditions))
        .groupBy(sql.raw(`date_trunc('${interval}', ${event.createdAt})`))
        .orderBy(sql.raw(`date_trunc('${interval}', ${event.createdAt})`)),
      catch: () => [] as any,
    });

    const timeSeries = timeSeriesRows.map((row: any) => ({
      timestamp: row.bucket,
      value: row.count,
      label: formatTimeBucket(new Date(row.bucket), interval),
    }));

    return {
      totalEvents,
      totalPageviews,
      uniqueVisitors,
      bounceRate: Math.round(bounceRate * 10) / 10,
      avgSessionDuration: Math.round(avgSessionDuration),
      topPages: topPagesRows.map((p: any) => ({
        key: p.path || '/',
        count: p.count,
        percentage: totalPageviews > 0 ? Math.round((p.count / totalPageviews) * 1000) / 10 : 0,
      })),
      topReferrers: topReferrersRows.map((r: any) => ({
        key: r.referrer || 'Direct',
        count: r.count,
        percentage: totalEvents > 0 ? Math.round((r.count / totalEvents) * 1000) / 10 : 0,
      })),
      topCountries: topCountriesRows.map((c: any) => ({
        key: c.country || 'Unknown',
        count: c.count,
        percentage: totalEvents > 0 ? Math.round((c.count / totalEvents) * 1000) / 10 : 0,
      })),
      timeSeries,
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