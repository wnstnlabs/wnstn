import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Effect } from 'effect';
import { CanopyRuntime } from '@/lib/effect/runtime';
import { Db } from '@/lib/effect/db';
import { db } from '@/lib/db';
import { site, member, organization } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function slugify(domain: string) {
  return domain.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

export async function GET() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const program = Effect.gen(function* () {
    const db = yield* Db;
    const myMembers = yield* Effect.tryPromise({
      try: () => db.select().from(member).where(eq(member.userId, session.user.id)),
      catch: () => [] as any,
    });
    const orgIds = (myMembers as any[]).map((m) => m.organizationId);
    let sites: any[] = [];
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
    const activeId = (session as any)?.session?.activeOrganizationId ?? null;
    if (activeId) sites = sites.filter((s: any) => s.organizationId === activeId);
    return sites;
  });

  const sites = await CanopyRuntime.runPromise(program.pipe(Effect.catchAll(() => Effect.succeed([]))));
  return NextResponse.json(sites);
}

export async function POST(req: Request) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const domainRaw = String(formData.get('domain') ?? '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
  if (!domainRaw || !domainRaw.includes('.')) return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });

  const id = `canopy_${domainRaw.replace(/[^a-z0-9]/g, '_')}`;

  // pick first org for user, or create personal org
  const memberships = await db.select().from(member).where(eq(member.userId, session.user.id));
  let orgId: string | null = (session.session as any)?.activeOrganizationId ?? memberships[0]?.organizationId ?? null;

  if (!orgId && memberships.length === 0) {
    const { organization } = await import('@/db/schema');
    const newOrgId = `org_${Date.now().toString(36)}`;
    const slug = slugify(session.user.name || session.user.email.split('@')[0]) + '-' + newOrgId.slice(-4);
    await db.insert(organization).values({ id: newOrgId, name: `${session.user.name}'s workspace`, slug, createdAt: new Date() }).onConflictDoNothing();
    await db.insert(member).values({ id: `mem_${Date.now().toString(36)}`, organizationId: newOrgId, userId: session.user.id, role: 'owner', createdAt: new Date() });
    orgId = newOrgId;
  }

  await db
    .insert(site)
    .values({ id, domain: domainRaw, name: domainRaw, organizationId: orgId, createdById: session.user.id, createdAt: new Date(), public: false, verificationRecord: null, verified: false, verifiedAt: null })
    .onConflictDoNothing();

  return NextResponse.json({ id, domain: domainRaw });
}