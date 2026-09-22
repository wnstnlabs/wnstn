import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { Effect } from 'effect';
import { CanopyRuntime } from '@/lib/effect/runtime';
import { Db } from '@/lib/effect/db';
import { event, site, member } from '@/db/schema';
import { eq, sql, and, gte, desc, inArray } from 'drizzle-orm';

function getRangeStart(range: string): Date {
  const now = new Date();
  switch (range) {
    case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
    case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default: return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
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
  const format = searchParams.get('format') === 'json' ? 'json' : 'csv';
  const eventName = searchParams.get('eventName') || undefined;
  const limit = Math.min(parseInt(searchParams.get('limit') || '10000'), 50000);

  if (!siteId) {
    return new Response(JSON.stringify({ error: 'siteId is required' }), { status: 400 });
  }

  const activeOrgId = (session as any)?.session?.activeOrganizationId ?? null;

  const program = Effect.gen(function* () {
    const db = yield* Db;

    // Verify access
    const myMembers = yield* Effect.tryPromise({
      try: () => db.select().from(member).where(eq(member.userId, session.user.id)),
      catch: () => [] as any,
    });
    const orgIds = (myMembers as any[]).map((m: any) => m.organizationId);
    let sitesQuery: any = db.select().from(site);
    if (orgIds.length > 0) sitesQuery = sitesQuery.where(
      sql`${site.organizationId} IN (${orgIds.join(',')}) OR ${site.createdById} = ${session.user.id}`
    );
    else sitesQuery = sitesQuery.where(eq(site.createdById, session.user.id));
    if (activeOrgId) sitesQuery = sitesQuery.where(eq(site.organizationId, activeOrgId));
    const sites = (yield* Effect.tryPromise({
      try: () => sitesQuery,
      catch: () => [] as any,
    })) as any[];
    if (!sites.some((s: any) => s.id === siteId)) {
      return { error: 'Site not found or access denied' } as const;
    }

    const start = getRangeStart(range);
    const conditions = [eq(event.siteId, siteId), gte(event.createdAt, start)];
    if (eventName) conditions.push(eq(event.name, eventName));

    const rows = (yield* Effect.tryPromise({
      try: () =>
        db
          .select({
            id: event.id,
            name: event.name,
            url: event.url,
            path: event.path,
            referrer: event.referrer,
            title: event.title,
            viewportW: event.viewportW,
            sessionId: event.sessionId,
            country: event.country,
            createdAt: event.createdAt,
          })
          .from(event)
          .where(and(...conditions))
          .orderBy(desc(event.createdAt))
          .limit(limit),
      catch: () => [] as any,
    })) as any[];

    return {
      events: rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        url: r.url ?? '',
        path: r.path ?? '',
        referrer: r.referrer ?? '',
        title: r.title ?? '',
        viewport_width: r.viewportW ?? '',
        session_id: r.sessionId ?? '',
        country: r.country ?? '',
        created_at: r.createdAt?.toISOString?.() ?? String(r.createdAt),
      })),
    };
  });

  const result: any = await CanopyRuntime.runPromise(
    program.pipe(Effect.catchAll((e) => Effect.succeed({ error: String(e) })))
  );

  if ('error' in result) {
    return new Response(JSON.stringify({ error: result.error }), { status: 500 });
  }

  const filename = `canopy_${siteId}_${range}.${format}`;

  if (format === 'json') {
    return new Response(JSON.stringify({ siteId, range, count: result.events.length, events: result.events }, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }

  return new Response(toCsv(result.events), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}