import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Effect } from 'effect';
import { CanopyRuntime } from '@/lib/effect/runtime';
import { Db } from '@/lib/effect/db';
import { site, member } from '@/db/schema';
import { desc, eq, sql, inArray, isNull, and } from 'drizzle-orm';

export interface SiteSummary {
  id: string;
  domain: string;
  name: string;
  organizationId: string | null;
}

/**
 * Resolve the current user's sites (scoped to active workspace) and the active site.
 * Returns null sites array only on DB errors — the caller decides how to render.
 */
export async function resolveSites(siteIdParam?: string): Promise<{
  sites: SiteSummary[];
  current: SiteSummary | null;
} | null> {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) return null;

  const program = Effect.gen(function* () {
    const db = yield* Db;
    const myMembers = (yield* Effect.tryPromise({
      try: () => db.select().from(member).where(eq(member.userId, session.user.id)),
      catch: () => [] as any,
    })) as any[];
    const orgIds = myMembers.map((m: any) => m.organizationId);

    let sites: SiteSummary[] = [];
    if (orgIds.length > 0) {
      const rows = (yield* Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(site)
            .where(inArray(site.organizationId, orgIds))
            .orderBy(desc(site.createdAt))
            .limit(50),
        catch: () => [] as any,
      })) as any[];
      const extra = (yield* Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(site)
            .where(and(eq(site.createdById, session.user.id), isNull(site.organizationId)))
            .orderBy(desc(site.createdAt))
            .limit(50),
        catch: () => [] as any,
      })) as any[];
      // Also include sites created by user but with organizationId (if user is creator)
      const creatorSites = (yield* Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(site)
            .where(and(eq(site.createdById, session.user.id), sql`${site.organizationId} IS NOT NULL`))
            .orderBy(desc(site.createdAt))
            .limit(50),
        catch: () => [] as any,
      })) as any[];
      sites = [...rows, ...extra, ...creatorSites].filter(
        (v, i, a) => a.findIndex((x) => x.id === v.id) === i
      );
    } else {
      sites = (yield* Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(site)
            .where(eq(site.createdById, session.user.id))
            .orderBy(desc(site.createdAt))
            .limit(50),
        catch: () => [] as any,
      })) as any[];
    }

    const activeOrgId = (session as any)?.session?.activeOrganizationId ?? null;
    if (activeOrgId) {
      sites = sites.filter((s: any) => s.organizationId === activeOrgId);
    }

    const mapped: SiteSummary[] = sites.map((s: any) => ({
      id: s.id,
      domain: s.domain,
      name: s.name,
      organizationId: s.organizationId,
    }));

    const current = siteIdParam
      ? mapped.find((s) => s.id === siteIdParam) ?? mapped[0] ?? null
      : mapped[0] ?? null;

    return { sites: mapped, current };
  });

  try {
    return await CanopyRuntime.runPromise(program.pipe(Effect.catchAll(() => Effect.succeed({ sites: [], current: null }))));
  } catch {
    return { sites: [], current: null };
  }
}

/** Require a session or redirect to login. */
export async function requireSession(loginPath: string) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) redirect(loginPath);
  return session;
}