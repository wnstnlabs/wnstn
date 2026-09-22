'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { site, member } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

function slugify(domain: string) {
  return domain.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

export async function createSiteAction(formData: FormData) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) redirect('/login?next=/dashboard');

  const domainRaw = String(formData.get('domain') ?? '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
  if (!domainRaw || !domainRaw.includes('.')) throw new Error('Invalid domain');

  const id = `canopy_${domainRaw.replace(/[^a-z0-9]/g, '_')}`;

  // pick first org for user, or create personal org
  const memberships = await db.select().from(member).where(eq(member.userId, session.user.id));
  let orgId: string | null = (session.session as any)?.activeOrganizationId ?? memberships[0]?.organizationId ?? null;

  if (!orgId && memberships.length === 0) {
    // let better-auth create org via API? fallback: create minimal org row
    const { organization } = await import('@/db/schema');
    const newOrgId = `org_${Date.now().toString(36)}`;
    const slug = slugify(session.user.name || session.user.email.split('@')[0]) + '-' + newOrgId.slice(-4);
    await db.insert(organization).values({ id: newOrgId, name: `${session.user.name}'s workspace`, slug, createdAt: new Date() }).onConflictDoNothing();
    await db.insert(member).values({ id: `mem_${Date.now().toString(36)}`, organizationId: newOrgId, userId: session.user.id, role: 'owner', createdAt: new Date() });
    orgId = newOrgId;
  }

  await db
    .insert(site)
    .values({ 
      id, 
      domain: domainRaw, 
      name: domainRaw, 
      organizationId: orgId, 
      createdById: session.user.id, 
      createdAt: new Date(), 
      public: false,
      verificationRecord: null,
      verified: false,
      verifiedAt: null,
    })
    .onConflictDoNothing();

  redirect(`/dashboard?site=${encodeURIComponent(id)}`);
}

export async function deleteSiteAction(formData: FormData) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) redirect('/login');
  const id = String(formData.get('siteId') ?? '');
  if (!id) return;
  await db.delete(site).where(eq(site.id, id));
  redirect('/dashboard');
}

export async function inviteMemberAction(formData: FormData) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) redirect('/login');
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const role = (String(formData.get('role') ?? 'member') as 'member' | 'admin' | 'owner') || 'member';
  if (!email || !email.includes('@')) throw new Error('Invalid email');
  const memberships = await db.select().from(member).where(eq(member.userId, session.user.id));
  const orgId = memberships[0]?.organizationId ?? (session.session as any)?.activeOrganizationId;
  if (!orgId) throw new Error('No workspace');

  // Use better-auth organization invite API — creates invitation + sends email via our hook
  try {
    await (auth as any).api.createInvitation({
      headers: h,
      body: { organizationId: orgId, email, role },
    });
  } catch (e: any) {
    // fallback: direct insert if API fails (e.g. in dev without mail)
    const { invitation } = await import('@/db/schema');
    const id = `inv_${Date.now().toString(36)}`;
    await db.insert(invitation).values({
      id,
      organizationId: orgId,
      email,
      role,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      inviterId: session.user.id,
      createdAt: new Date(),
    }).onConflictDoNothing();
  }
  redirect('/dashboard/settings');
}
