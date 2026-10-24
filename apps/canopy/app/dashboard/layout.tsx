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
import { HelpMenu } from '@/components/dashboard/HelpMenu';
import { LogOut } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0b0d12] text-slate-200 flex antialiased">
      <aside className="hidden md:flex w-[256px] shrink-0 flex-col border-r border-white/[0.08] bg-[#0e1118] sticky top-0 h-screen">
        <Link href="/" className="h-14 px-4 flex items-center gap-2.5 border-b border-white/[0.06] shrink-0">
          <span className="size-7 rounded-md bg-rose-500 text-white grid place-items-center text-[12px] font-semibold shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_8px_rgba(251,113,133,0.35)]">◈</span>
          <span className="font-semibold tracking-[-0.02em] text-[14px] text-slate-100">canopy</span>
          <span className="mono text-[9px] uppercase tracking-[0.18em] text-slate-700 ml-auto">analytics</span>
        </Link>

        <div className="px-3 py-3 border-b border-white/[0.06] shrink-0">
          <WorkspaceSwitcher orgs={orgs} activeId={activeId} activeName={orgName ?? orgs.find((o) => o.id === activeId)?.name ?? null} />
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav liveCount={liveCount} />

          <div className="mt-5 px-4 flex items-center justify-between">
            <div className="mono text-[10px] uppercase tracking-[0.16em] text-slate-600 font-medium">Sites</div>
            <div className="mono text-[10px] text-slate-700 tabular">{sites.length}</div>
          </div>
          <div className="mt-2 px-3">
            <ClientSidebar
              activeId={activeId}
              initialSites={sites}
            />
          </div>
        </div>

        <div className="px-3 py-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
          <span className="mono text-[10px] text-slate-600 truncate flex-1 min-w-0">{session.user.email}</span>
          <HelpMenu />
          <form
            action={async () => {
              'use server';
              const { auth } = await import('@/lib/auth');
              const h = await (await import('next/headers')).headers();
              await auth.api.signOut({ headers: h });
              const { redirect } = await import('next/navigation');
              redirect('/login');
            }}
          >
            <button
              type="submit"
              aria-label="Log out"
              title="Log out"
              className="size-6 grid place-items-center rounded-md border border-white/[0.08] text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition shrink-0"
            >
              <LogOut className="size-3.5" />
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col bg-[#0b0d12] relative">
        <header className="md:hidden relative h-14 px-4 flex items-center justify-between border-b border-white/[0.08] bg-[#0e1118]/90 backdrop-blur-xl sticky top-0 z-20">
          <Link href="/" className="flex items-center gap-2">
            <span className="size-7 rounded-lg bg-rose-500 text-white grid place-items-center font-semibold text-xs">◈</span>
            <span className="font-semibold text-sm tracking-tight text-slate-100">canopy</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline mono text-[10px] text-slate-500">{sites[0]?.domain ?? ''}</span>
            <MobileNav siteId={sites[0]?.id} orgs={orgs} activeId={activeId} activeName={orgName ?? orgs.find((o) => o.id === activeId)?.name ?? null} />
          </div>
        </header>
        <div className="relative flex-1 flex flex-col min-w-0">{children}</div>
      </div>
    </div>
  );
}
