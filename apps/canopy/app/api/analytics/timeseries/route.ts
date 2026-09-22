import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { Effect } from 'effect';
import { CanopyRuntime } from '@/lib/effect/runtime';
import { Db } from '@/lib/effect/db';
import { event, site, member } from '@/db/schema';
import { eq, sql, and, gte, inArray, desc } from 'drizzle-orm';

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

export async function GET(request: Request) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');
  const range = searchParams.get('range') || '7d';
  const interval = searchParams.get('interval') || 'hour';
  const eventName = searchParams.get('eventName') || undefined;

  if (!siteId) {
    return new Response(JSON.stringify({ error: 'siteId is required' }), { status: 400 });
  }

  const activeOrgId = (session as any)?.session?.activeOrganizationId ?? null;

  const program = Effect.gen(function* () {
    const db = yield* Db;
    
    // Verify user has access to this site
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
    if (activeOrgId) {
      sitesQuery = sitesQuery.where(eq(site.organizationId, activeOrgId));
    }
    const sites = (yield* Effect.tryPromise({ try: () => sitesQuery, catch: () => [] as any })) as any[];
    const hasAccess = sites.some((s: any) => s.id === siteId);
    if (!hasAccess) {
      return { error: 'Site not found or access denied' } as const;
    }

    const { start } = getRangeInterval(range);
    
    const conditions = [
      eq(event.siteId, siteId),
      gte(event.createdAt, start),
    ];
    if (eventName) conditions.push(eq(event.name, eventName));

    const rows = yield* Effect.tryPromise({
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

    return rows.map((row: any) => ({
      timestamp: row.bucket,
      value: row.count,
      label: new Date(row.bucket).toISOString(),
    }));
  });

  const result = await CanopyRuntime.runPromise(program.pipe(Effect.catchAll((e) => Effect.succeed({ error: String(e) }))));
  
  if ('error' in result) {
    return new Response(JSON.stringify({ error: result.error }), { status: 500 });
  }

  return new Response(JSON.stringify({ data: result }), {
    headers: { 'Content-Type': 'application/json' },
  });
}