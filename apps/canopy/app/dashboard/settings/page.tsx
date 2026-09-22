import { Effect } from 'effect';
import { CanopyRuntime } from '@/lib/effect/runtime';
import { Db } from '@/lib/effect/db';
import { member, user, invitation, site } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { resolveSites } from '@/lib/resolve-sites';
import { SettingsPage } from './SettingsPageContent';

export const dynamic = 'force-dynamic';

export default async function SettingsRoutePage({ searchParams }: { searchParams: Promise<{ site?: string; tab?: string }> }) {
  const { site: siteIdParam } = await searchParams;
  const resolved = await resolveSites(siteIdParam);
  if (!resolved) {
    return <div className="p-8 text-sm text-zinc-500">Session required. <a href="/login" className="underline">Sign in</a></div>;
  }
  const { sites, current } = resolved;

  if (sites.length === 0) {
    return <div className="px-7 py-8 text-sm text-zinc-500">No sites yet — create one from the dashboard.</div>;
  }
  if (!current) {
    return <div className="p-7 text-sm text-zinc-500">Select a site.</div>;
  }

  // Fetch full site record (includes verification fields) + team members
  const program = Effect.gen(function* () {
    const db = yield* Db;

    const siteRows = (yield* Effect.tryPromise({
      try: () => db.select().from(site).where(eq(site.id, current.id)).limit(1),
      catch: () => [] as any,
    })) as any[];

    const members = (yield* Effect.tryPromise({
      try: async () => {
        if (!current.organizationId) return [];
        const rows = await db
          .select({
            id: member.id,
            userId: member.userId,
            role: member.role,
            createdAt: member.createdAt,
            email: user.email,
            name: user.name,
            image: user.image,
          })
          .from(member)
          .innerJoin(user, eq(member.userId, user.id))
          .where(eq(member.organizationId, current.organizationId))
          .limit(50);
        return rows.map((r: any) => ({
          ...r,
          status: 'active' as const,
        }));
      },
      catch: () => [] as any,
    })) as any[];

    const invitations = (yield* Effect.tryPromise({
      try: async () => {
        if (!current.organizationId) return [];
        const rows = await db
          .select()
          .from(invitation)
          .where(eq(invitation.organizationId, current.organizationId))
          .limit(50);
        return rows.map((i: any) => ({
          id: i.id,
          email: i.email,
          role: i.role ?? 'member',
          status: i.status ?? 'pending',
          createdAt: i.createdAt.toISOString(),
        }));
      },
      catch: () => [] as any,
    })) as any[];

    return { site: siteRows[0] ?? null, members, invitations };
  });

  const { site: siteRow, members, invitations }: any = await CanopyRuntime.runPromise(
    program.pipe(Effect.catchAll(() => Effect.succeed({ site: null, members: [], invitations: [] })))
  );

  const siteData = siteRow
    ? {
        id: siteRow.id,
        domain: siteRow.domain,
        name: siteRow.name,
        public: siteRow.public ?? false,
        verified: siteRow.verified ?? false,
        verificationRecord: siteRow.verificationRecord ?? '',
        createdAt: siteRow.createdAt?.toISOString?.() ?? String(siteRow.createdAt),
      }
    : {
        id: current.id,
        domain: current.domain,
        name: current.name,
        public: false,
        verified: false,
        verificationRecord: '',
        createdAt: new Date().toISOString(),
      };

  return (
    <SettingsPage
      site={siteData}
      members={members.map((m: any) => ({
        ...m,
        createdAt: m.createdAt?.toISOString?.() ?? String(m.createdAt),
      }))}
      invitations={invitations}
    />
  );
}