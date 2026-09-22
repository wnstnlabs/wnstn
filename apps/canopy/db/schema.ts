import { pgTable, text, timestamp, boolean, index, uniqueIndex, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Better Auth core (same shape as Winston — allows copy/paste SSO wiring) ---
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()).notNull(),
  role: text('role'),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  username: text('username').unique(),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    activeOrganizationId: text('active_organization_id'),
    impersonatedBy: text('impersonated_by'),
  },
  (t) => [index('session_userId_idx').on(t.userId)]
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()).notNull(),
  },
  (t) => [index('account_userId_idx').on(t.userId)]
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (t) => [index('verification_identifier_idx').on(t.identifier)]
);

export const organization = pgTable(
  'organization',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    logo: text('logo'),
    createdAt: timestamp('created_at').notNull(),
    metadata: text('metadata'),
  },
  (t) => [uniqueIndex('organization_slug_uidx').on(t.slug)]
);

export const member = pgTable(
  'member',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    role: text('role').default('member').notNull(),
    createdAt: timestamp('created_at').notNull(),
  },
  (t) => [index('member_organizationId_idx').on(t.organizationId), index('member_userId_idx').on(t.userId)]
);

export const invitation = pgTable(
  'invitation',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role'),
    status: text('status').default('pending').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    inviterId: text('inviter_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  },
  (t) => [index('invitation_organizationId_idx').on(t.organizationId)]
);

// --- Canopy domain ---

export const site = pgTable(
  'site',
  {
    id: text('id').primaryKey(), // canopy_xxx
    domain: text('domain').notNull(),
    name: text('name').notNull(),
    organizationId: text('organization_id').references(() => organization.id, { onDelete: 'cascade' }),
    createdById: text('created_by_id').references(() => user.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    public: boolean('public').default(false).notNull(),
    verificationRecord: text('verification_record').default(''),
    verified: boolean('verified').default(false).notNull(),
    verifiedAt: timestamp('verified_at'),
  },
  (t) => [uniqueIndex('site_domain_uidx').on(t.domain), index('site_org_idx').on(t.organizationId)]
);

export const event = pgTable(
  'event',
  {
    id: text('id').primaryKey(),
    siteId: text('site_id').notNull().references(() => site.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // pageview, custom
    url: text('url'),
    path: text('path'),
    referrer: text('referrer'),
    title: text('title'),
    viewportW: integer('viewport_w'),
    props: jsonb('props').$type<Record<string, unknown>>(),
    sessionId: text('session_id'),
    ipHash: text('ip_hash'),
    country: text('country'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('event_site_idx').on(t.siteId),
    index('event_site_created_idx').on(t.siteId, t.createdAt),
    index('event_name_idx').on(t.name),
  ]
);

export const siteRelations = relations(site, ({ many }) => ({ events: many(event) }));
export const eventRelations = relations(event, ({ one }) => ({
  site: one(site, { fields: [event.siteId], references: [site.id] }),
}));
