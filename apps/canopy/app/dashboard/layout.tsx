import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Effect } from 'effect';
import { CanopyRuntime } from '@/lib/effect/runtime';
import { Db } from '@/lib/effect/db';
import { site, member, organization, event } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { WorkspaceSwitcher } from '@/components/dashboard/WorkspaceSwitcher';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { ClientSidebar } from '@/components/dashboard/ClientSidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) redirect('/login?next=/dashboard');

  const program = Effect.gen(function* () {
    const db = yield* Db;
    const myMembers = yield* Effect.tryPromise({
      try: () => db.select().from(member).where(eq(member.userId, session.user.id)),
      catch: () => [] as any,
    });
    const orgIds: string[] = (myMembers as any[]).map((m) => m.organizationId);
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
        try: () => db.select().from(site).orderBy(desc(site.createdAt)).limit(50),
        catch: () => [] as any,
      });
    }
    let orgName: string | null = null;
    if ((myMembers as any[])[0]?.organizationId) {
      const orgRow: any = yield* Effect.tryPromise({
        try: () => db.select().from(organization).where(eq(organization.id, (myMembers as any[])[0].organizationId)).limit(1),
        catch: () => [] as any,
      });
      orgName = orgRow[0]?.name ?? null;
    }
    // live count for badge (first site as proxy if no site selected)
    let liveCount = 0;
    if (sites[0]) {
      const liveRows: any = yield* Effect.tryPromise({
        try: () => db.select({ count: sql<number>`count(*)::int` }).from(event).where(sql`${event.siteId} = ${sites[0].id} and ${event.createdAt} >= NOW() - interval '5 minutes'`),
        catch: () => [{ count: 0 }],
      });
      liveCount = liveRows[0]?.count ?? 0;
    }
    return { sites, orgName, liveCount, session };
  });

  // fetch all orgs for switcher first (need activeId to scope sites)
  let orgs: { id: string; name: string; slug: string }[] = [];
  let activeId: string | null = (session as any)?.session?.activeOrganizationId ?? null;
  try {
    const dbOrgs = await CanopyRuntime.runPromise(
      Effect.gen(function* () {
        const db = yield* Db;
        const myMems: any = yield* Effect.tryPromise({ try: () => db.select().from(member).where(eq(member.userId, session.user.id)), catch: () => [] });
        if (myMems.length === 0) return [] as any[];
        const ids = myMems.map((m: any) => m.organizationId);
        const rows: any = yield* Effect.tryPromise({ try: () => db.select().from(organization).where(sql`${organization.id} in ${ids}`), catch: () => [] });
        return rows;
      }).pipe(Effect.catchAll(() => Effect.succeed([])))
    );
    orgs = (dbOrgs as any[]).map((o: any) => ({ id: o.id, name: o.name, slug: o.slug }));
    if (!activeId && orgs[0]) activeId = orgs[0].id;
  } catch {}

  const data: any = await CanopyRuntime.runPromise(program.pipe(Effect.catchAll(() => Effect.succeed({ sites: [], orgName: null, liveCount: 0, session, orgs: [], activeId: null }))));

  // scope sites + orgName to active workspace
  let { sites, orgName, liveCount } = data as { sites: any[]; orgName: string | null; liveCount: number };
  if (activeId) {
    const activeSites = sites.filter((s: any) => s.organizationId === activeId);
    // keep at least empty, don't fallback to other workspaces
    sites = activeSites;
    const activeOrg = orgs.find((o) => o.id === activeId);
    if (activeOrg) orgName = activeOrg.name;
    // recompute live for active workspace's first site
    if (sites[0]) {
      try {
        const liveRows: any = await CanopyRuntime.runPromise(
          Effect.gen(function* () {
            const db = yield* Db;
            return yield* Effect.tryPromise({ try: () => db.select({ count: sql<number>`count(*)::int` }).from(event).where(sql`${event.siteId} = ${sites[0].id} and ${event.createdAt} >= NOW() - interval '5 minutes'`), catch: () => [{ count: 0 }] });
          }).pipe(Effect.catchAll(() => Effect.succeed([{ count: 0 }])))
        );
        liveCount = (liveRows as any)[0]?.count ?? 0;
      } catch {}
    } else {
      liveCount = 0;
    }
  }

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex antialiased">
      <aside className="hidden md:flex w-[268px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a0c] sticky top-0 h-screen overflow-hidden">
        <Link href="/" className="h-[56px] px-4 flex items-center gap-3 border-b border-white/[0.06] shrink-0 hover:bg-white/[0.03] transition">
          <span className="size-8 rounded-[10px] bg-white text-zinc-900 grid place-items-center text-[15px] font-semibold tracking-tighter shrink-0 border border-white/10 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_2px_8px_rgba(0,0,0,0.35)]">○</span>
          <span className="leading-none min-w-0">
            <span className="block font-semibold tracking-[-0.025em] text-[15px] text-white leading-none">canopy</span>
            <span className="block mono text-[11px] leading-none text-zinc-500 tracking-wide mt-0.5">wnstn • analytics</span>
          </span>
        </Link>

        <div className="px-3 pt-3">
          <WorkspaceSwitcher orgs={orgs} activeId={activeId} activeName={orgName ?? "Elias's workspace"} />
        </div>

        <div className="flex-1 overflow-y-auto px-3 pt-5 space-y-6">
          <div>
            <div className="mono text-[11px] tracking-[0.14em] text-zinc-500 uppercase px-2.5 font-medium">Analytics</div>
            <div className="mt-2.5">
              <SidebarNav liveCount={liveCount} />
            </div>
          </div>

          <ClientSidebar 
            activeId={activeId}
            orgs={orgs}
            activeName={orgName ?? "Elias's workspace"}
            initialSites={sites}
          />
        </div>

        <div className="p-3 border-t border-white/[0.06] bg-[#0a0a0c]">
          <div className="flex items-center gap-2.5 rounded-xl hover:bg-white/[0.04] px-1.5 py-1.5 -mx-1.5 transition">
            {session.user.image ? (
              <img src={session.user.image} alt="" className="size-8 rounded-full object-cover border border-white/10 shrink-0" />
            ) : (
              <span className="size-8 rounded-full bg-white text-zinc-900 grid place-items-center text-[12px] font-semibold shrink-0">E</span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium text-white leading-none truncate">{session.user.name ?? 'Elias'}</span>
              <span className="block mono text-[11px] text-zinc-500 leading-none truncate mt-1">{session.user.email}</span>
            </span>
          </div>
          <form
            action={async () => {
              'use server';
              const { auth } = await import('@/lib/auth');
              const h = await (await import('next/headers')).headers();
              await auth.api.signOut({ headers: h });
              const { redirect } = await import('next/navigation');
              redirect('/login');
            }}
            className="mt-2.5"
          >
            <button type="submit" className="w-full mono text-[12px] tracking-wide text-zinc-500 hover:text-zinc-200 border border-white/[0.07] hover:border-white/[0.12] hover:bg-white/[0.04] rounded-xl px-3 py-2.5 transition flex items-center justify-center gap-1.5">
              Sign out <span className="text-zinc-600">→</span>
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col bg-[#050507] relative">
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] dark-grid" />
        <div className="pointer-events-none absolute inset-0 opacity-100 radial-vignette" />
        <header className="md:hidden relative h-14 px-4 flex items-center justify-between border-b border-white/[0.06] bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-20">
          <Link href="/" className="flex items-center gap-2">
            <span className="size-7 rounded-lg bg-white text-zinc-900 grid place-items-center font-semibold text-xs">◯</span>
            <span className="font-semibold text-sm tracking-tight">canopy</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline mono text-[10px] text-zinc-500">{sites[0]?.domain ?? ''}</span>
            <MobileNav siteId={sites[0]?.id} />
          </div>
        </header>
        <div className="relative flex-1 flex flex-col min-w-0">{children}</div>
      </div>
    </div>
  );
}
