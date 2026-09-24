import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { Effect } from 'effect';
import { CanopyRuntime } from '@/lib/effect/runtime';
import { Db } from '@/lib/effect/db';
import { event, site, member } from '@/db/schema';
import { eq, sql, and, gte, inArray, desc } from 'drizzle-orm';

function getRangeStart(range: string): Date {
  const now = new Date();
  switch (range) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

export async function GET(request: Request) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');
  const range = searchParams.get('range') || '7d';
  const eventName = searchParams.get('eventName') || undefined;
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');

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

    const start = getRangeStart(range);
    
    const conditions = [
      eq(event.siteId, siteId),
      gte(event.createdAt, start),
    ];
    if (eventName) conditions.push(eq(event.name, eventName));

    const totalRows = yield* Effect.tryPromise({
      try: () => db.select({ count: sql<number>`count(*)::int` }).from(event).where(and(...conditions)),
      catch: () => [{ count: 0 }],
    });
    const total = totalRows[0]?.count ?? 0;

    const rows = yield* Effect.tryPromise({
      try: () => db
        .select({
          id: event.id,
          name: event.name,
          url: event.url,
          path: event.path,
          referrer: event.referrer,
          title: event.title,
          viewportW: event.viewportW,
          props: event.props,
          sessionId: event.sessionId,
          country: event.country,
          createdAt: event.createdAt,
        })
        .from(event)
        .where(and(...conditions))
        .orderBy(desc(event.createdAt))
        .limit(limit)
        .offset(offset),
      catch: () => [] as any,
    });

    return {
      events: rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        url: row.url,
        path: row.path,
        referrer: row.referrer,
        title: row.title,
        viewportW: row.viewportW,
        props: row.props,
        sessionId: row.sessionId,
        country: row.country,
        createdAt: row.createdAt.toISOString(),
      })),
      total,
      limit,
      offset,
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