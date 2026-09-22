import Link from 'next/link';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Effect } from 'effect';
import { CanopyRuntime } from '@/lib/effect/runtime';
import { Db } from '@/lib/effect/db';
import { site, event, member } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { createSiteAction, deleteSiteAction } from './actions';
import { DashboardOverview } from './Overview';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string; range?: string }>;
}) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) redirect('/login?next=/dashboard');

  const { site: siteIdParam } = await searchParams;

  const program = Effect.gen(function* () {
    const db = yield* Db;
    const myMembers = yield* Effect.tryPromise({
      try: () => db.select().from(member).where(eq(member.userId, session.user.id)),
      catch: () => [] as any,
    });
    const orgIds = (myMembers as any[]).map((m) => m.organizationId);
    let sites: (typeof site.$inferSelect)[] = [];
    if (orgIds.length > 0) {
      sites = yield* Effect.tryPromise({
        try: () => db.select().from(site).where(sql`${site.organizationId} in ${orgIds}`).orderBy(desc(site.createdAt)).limit(50),
        catch: () => [] as any,
      });
      const extra = yield* Effect.tryPromise({
        try: () => db.select().from(site).where(sql`${site.createdById} = ${session.user.id} and ${site.organizationId} is null`).orderBy(desc(site.createdAt)).limit(50),
        catch: () => [] as any,
      });
      sites = [...sites, ...(extra as any)].filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);
    } else {
      sites = yield* Effect.tryPromise({
        try: () => db.select().from(site).where(eq(site.createdById, session.user.id)).orderBy(desc(site.createdAt)).limit(50),
        catch: () => [] as any,
      });
    }
    const activeId = (session as any)?.session?.activeOrganizationId ?? null;
    if (activeId) sites = sites.filter((s: any) => s.organizationId === activeId);
    const current = siteIdParam ? sites.find((s) => s.id === siteIdParam) ?? sites[0] : sites[0];

    // Live badge count (cheap query, rest is client-side)
    let live = 0;
    if (current) {
      const liveRows = yield* Effect.tryPromise({
        try: () => db.select({ count: sql<number>`count(*)::int` }).from(event).where(sql`${event.siteId} = ${current.id} and ${event.createdAt} >= NOW() - interval '5 minutes'`),
        catch: () => [{ count: 0 }] as any,
      });
      live = (liveRows as any)[0]?.count ?? 0;
    }

    return { sites, current, live };
  });

  const data: any = await CanopyRuntime.runPromise(
    program.pipe(Effect.catchAll(() => Effect.succeed({ sites: [], current: null, live: 0 })))
  );
  const { sites, current, live } = data;

  // Empty state — onboarding prompt with create form
  if (sites.length === 0) {
    return (
      <div className="px-4 md:px-7 py-7 max-w-[1120px] w-full mx-auto">
        <div className="canopy-card rounded-2xl overflow-hidden">
          <div className="p-8 md:p-10 text-center relative">
            <div className="mx-auto size-10 rounded-xl bg-white text-zinc-900 grid place-items-center">◯</div>
            <h2 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-white">No sites yet</h2>
            <p className="mt-1.5 text-[13px] leading-6 text-zinc-400 max-w-[520px] mx-auto">
              Add your first domain — then paste one script. You'll see live visitors in seconds.
            </p>
            <form action={createSiteAction} className="mt-6 mx-auto max-w-[480px] flex gap-2 p-1 rounded-2xl bg-[#08080a] border border-white/[0.08]">
              <input name="domain" placeholder="yourdomain.com" required className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-[13px] mono text-white placeholder:text-zinc-600 outline-none" />
              <button type="submit" className="rounded-xl bg-white text-zinc-900 px-5 py-2.5 text-[13px] font-medium hover:bg-zinc-100">Add site →</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return <div className="px-4 md:px-7 py-7 text-sm text-zinc-500">No site selected.</div>;

  return (
    <>
      {/* Toolbar — site management only; analytics header lives in Overview */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#050507]/65 border-b border-white/[0.06]">
        <div className="px-4 md:px-7 h-[56px] flex items-center gap-3">
          <Link href={`/dashboard?site=${encodeURIComponent(current.id)}`} className="text-[14px] font-semibold tracking-[-0.015em] text-white truncate hover:text-white/80 transition">
            {current.domain}
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 mono text-[10px] text-zinc-400 border border-white/[0.07] rounded-full px-2.5 py-1 bg-white/[0.04]">
            {current.id.slice(0, 10)}…
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 mono text-[11px] font-medium text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> {live} live
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href={`/dashboard/settings?site=${encodeURIComponent(current.id)}`}
              className="mono text-[11px] text-zinc-400 hover:text-white border border-white/[0.06] rounded-full px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.05] transition"
            >
              Settings
            </Link>
            <form action={deleteSiteAction} className="hidden sm:block">
              <input type="hidden" name="siteId" value={current.id} />
              <button type="submit" className="mono text-[11px] text-zinc-500 hover:text-red-400 border border-white/[0.06] rounded-full px-3 py-1.5 bg-white/[0.02] transition">Delete</button>
            </form>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="px-4 md:px-7 py-7 max-w-[1120px] w-full mx-auto mono text-xs text-zinc-500">Loading analytics…</div>}>
        <DashboardOverview siteId={current.id} />
      </Suspense>
    </>
  );
}