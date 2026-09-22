import { NextRequest, NextResponse } from 'next/server';
import { Effect } from 'effect';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { site, event } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

function cors(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  } as Record<string, string>;
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin') ?? '*';

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400, headers: cors(origin) });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid payload', issues: parsed.error.flatten() }, { status: 400, headers: cors(origin) });
  }

  const { s: siteId, n: name, u: url, r: referrer, p: path, t: title, w, props, sid } = parsed.data;
  const ip = getIp(req);
  const ipHash = hashIp(ip);
  const country = req.headers.get('x-vercel-ip-country') ?? req.headers.get('cf-ipcountry') ?? null;

  // Effect program: validate site via Drizzle, insert event — all through Db layer
  const program = Effect.gen(function* () {
    const dbLive = yield* Db;
    const found = yield* Effect.tryPromise({
      try: () => dbLive.select({ id: site.id }).from(site).where(eq(site.id, siteId)).limit(1),
      catch: (cause) => new Error(String(cause)),
    });

    if (found.length === 0) {
      if (process.env.NODE_ENV !== 'production') {
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
    return new NextResponse(null, { status: 202, headers: cors(origin) });
  }

  // Extract failure cause
  const cause = (exit as unknown as { cause: unknown }).cause as unknown;
  const isUnknownSite = JSON.stringify(cause ?? '').includes('UnknownSite');
  if (isUnknownSite) {
    return NextResponse.json({ error: 'unknown site' }, { status: 404, headers: cors(origin) });
  }

  console.error('[canopy] drizzle insert failed', cause);
  return NextResponse.json({ error: 'store failed' }, { status: 500, headers: cors(origin) });
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin') ?? '*';
  return new NextResponse(null, { status: 204, headers: cors(origin) });
}
