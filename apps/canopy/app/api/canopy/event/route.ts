import { NextRequest, NextResponse } from 'next/server';
import { Effect } from 'effect';
import { z } from 'zod';
import crypto from 'crypto';
import { site, event } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { CanopyRuntime } from '@/lib/effect/runtime';
import { Db } from '@/lib/effect/db';

// Drizzle + Effect ingestion — no useState/useEffect (server-only), Effect pipeline + Db Layer.

const Body = z.object({
  s: z.string().min(1),
  n: z.string().min(1).max(64),
  u: z.string().max(2048).optional(),
  r: z.string().max(2048).optional(),
  p: z.string().max(2048).optional(),
  t: z.string().max(512).optional(),
  w: z.coerce.number().optional(),
  props: z.record(z.string(), z.unknown()).optional(),
  sid: z.string().max(64).optional(),
  v: z.string().optional(),
  ts: z.number().optional(),
});

function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.CANOPY_IP_SALT ?? 'canopy-dev-salt';
  return crypto.createHash('sha256').update(ip + salt).digest('hex').slice(0, 16);
}

function getIp(req: NextRequest): string | null {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? null;
  return req.headers.get('x-real-ip') ?? null;
}

function getRequestHost(req: NextRequest): string | null {
  const origin = req.headers.get('origin');
  if (origin && origin !== 'null') {
    try {
      return new URL(origin).hostname.toLowerCase() || null;
    } catch {}
  }
  const referer = req.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).hostname.toLowerCase() || null;
    } catch {}
  }
  return null;
}

function hostMatchesDomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

function corsHeaders(allowOrigin: string | null): Record<string, string> {
  const headers: Record<string, string> = { Vary: 'Origin' };
  if (allowOrigin) {
    headers['Access-Control-Allow-Origin'] = allowOrigin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Access-Control-Max-Age'] = '86400';
  }
  return headers;
}

export async function POST(req: NextRequest) {
  const originHeader = req.headers.get('origin');
  const requestHost = getRequestHost(req);
  const isProd = process.env.NODE_ENV === 'production';

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400, headers: corsHeaders(null) });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid payload', issues: parsed.error.flatten() }, { status: 400, headers: corsHeaders(null) });
  }

  const { s: siteId, n: name, u: url, r: referrer, p: path, t: title, w, props, sid } = parsed.data;
  const ip = getIp(req);
  const ipHash = hashIp(ip);
  const country = req.headers.get('x-vercel-ip-country') ?? req.headers.get('cf-ipcountry') ?? null;

  // Effect program: validate site via Drizzle, insert event — all through Db layer
  const program = Effect.gen(function* () {
    const dbLive = yield* Db;
    const found = yield* Effect.tryPromise({
      try: () => dbLive.select({ id: site.id, domain: site.domain }).from(site).where(eq(site.id, siteId)).limit(1),
      catch: (cause) => new Error(String(cause)),
    });

    if (found.length === 0) {
      if (!isProd) {
        yield* Effect.tryPromise({
          try: () =>
            dbLive
              .insert(site)
              .values({
                id: siteId,
                domain: siteId.replace(/^canopy_/, '') || 'dev.local',
                name: siteId,
                createdAt: new Date(),
                public: false,
              })
              .onConflictDoNothing(),
          catch: () => new Error('site auto-create failed'),
        }).pipe(Effect.catchAll(() => Effect.succeed(undefined as unknown as void)));
      } else {
        return yield* Effect.fail({ _tag: 'UnknownSite' } as const);
      }
    }

    const siteDomain = found[0]?.domain;
    if (siteDomain && isProd && requestHost && !hostMatchesDomain(requestHost, siteDomain)) {
      return yield* Effect.fail({ _tag: 'ForbiddenOrigin' } as const);
    }

    const id = `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    yield* Effect.tryPromise({
      try: () =>
        dbLive.insert(event).values({
          id,
          siteId,
          name,
          url: url ?? null,
          path: path ?? null,
          referrer: referrer ?? null,
          title: title ?? null,
          viewportW: w ?? null,
          props: props ?? null,
          sessionId: sid ?? null,
          ipHash,
          country,
          createdAt: new Date(),
        }),
      catch: (cause) => new Error(String(cause)),
    });
  });

  const exit = await CanopyRuntime.runPromiseExit(program);

  // Map Effect exit to HTTP without React hooks
  if (exit._tag === 'Success') {
    const allow = originHeader && originHeader !== 'null' ? originHeader : null;
    return new NextResponse(null, { status: 202, headers: corsHeaders(allow) });
  }

  // Extract failure cause
  const cause = (exit as unknown as { cause: unknown }).cause as unknown;
  const causeTag = JSON.stringify(cause ?? '');
  if (causeTag.includes('ForbiddenOrigin')) {
    return NextResponse.json({ error: 'origin not allowed' }, { status: 403, headers: corsHeaders(null) });
  }
  if (causeTag.includes('UnknownSite')) {
    return NextResponse.json({ error: 'unknown site' }, { status: 404, headers: corsHeaders(null) });
  }

  console.error('[canopy] drizzle insert failed', cause);
  return NextResponse.json({ error: 'store failed' }, { status: 500, headers: corsHeaders(null) });
}

export async function OPTIONS(req: NextRequest) {
  const originHeader = req.headers.get('origin');
  const requestHost = getRequestHost(req);

  if (!originHeader || originHeader === 'null' || !requestHost) {
    return new NextResponse(null, { status: 204, headers: corsHeaders(null) });
  }

  const program = Effect.gen(function* () {
    const dbLive = yield* Db;
    const found = yield* Effect.tryPromise({
      try: () =>
        dbLive
          .select({ id: site.id })
          .from(site)
          .where(sql`${requestHost} = ${site.domain} OR ${requestHost} LIKE ${'%.'} || ${site.domain}`)
          .limit(1),
      catch: (cause) => new Error(String(cause)),
    });
    return found.length > 0;
  });

  const exit = await CanopyRuntime.runPromiseExit(program);
  const siteFound = exit._tag === 'Success' && exit.value === true;
  const isProd = process.env.NODE_ENV === 'production';
  const allow = siteFound || !isProd ? originHeader : null;
  return new NextResponse(null, { status: 204, headers: corsHeaders(allow) });
}
