import { site, member, user as userTable } from '@/db/schema';
import { eq, inArray, or, sql, desc } from 'drizzle-orm';

/**
 * Sites the user can access: sites in their organizations, plus sites
 * created by them (matched directly or by email — covers SSO account linking).
 */
export async function getUserSites(db: any, userId: string): Promise<any[]> {
  const myMembers = await db.select().from(member).where(eq(member.userId, userId));
  const orgIds: string[] = myMembers.map((m: any) => m.organizationId).filter(Boolean);

  const userEmailRows = await db
    .select({ email: userTable.email })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);
  const userEmail = userEmailRows[0]?.email;

  const conditions = [];
  if (orgIds.length > 0) conditions.push(inArray(site.organizationId, orgIds));
  if (userEmail) {
    conditions.push(sql`${site.createdById} IN (SELECT id FROM "user" WHERE email = ${userEmail})`);
  }
  if (conditions.length === 0) return [];

  return db
    .select()
    .from(site)
    .where(or(...conditions))
    .orderBy(desc(site.createdAt))
    .limit(50);
}
