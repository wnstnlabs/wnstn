import Link from 'next/link';
import { DocsShell, PageTitle, Section, P, C, Sub, CodeWindow, DataTable, Callout, CTA } from '../_components';

export default function PrivacyPage() {
  return (
    <DocsShell>
      <PageTitle title="Privacy & compliance">
        Canopy's privacy story is not a policy layered on top of tracking — it is the architecture. The tracker
        stores nothing in the browser, sends nothing to third parties, and the server never persists a raw IP
        address. This page documents exactly what is collected, what is engineered out, and what that means for
        GDPR and consent banners. It is documentation, not legal advice — you own your compliance posture.
      </PageTitle>

      <div className="mt-12 space-y-16">
        <Section n="1" title="What is collected">
          <P>Every event stores exactly these fields — no more:</P>
          <DataTable
            columns={['Field', 'Purpose', 'Notes']}
            rows={[
              ['Event name', 'What happened', <><C>pageview</C>, <C>outbound</C>, <C>identify</C>, or your custom events.</>],
              ['URL, path, title', 'Which page', 'Captured from the browser at send time.'],
              ['Referrer', 'Where the visitor came from', 'Empty for direct traffic.'],
              ['Viewport width', 'Device class', 'Mobile vs desktop — no full device profile.'],
              ['Session ID', 'Grouping events into visits', 'A random in-memory UUID — see below.'],
              ['IP hash', 'Distinguishing visitors', 'Salted SHA-256, truncated to 16 hex chars.'],
              ['Country', 'Rough geography', 'From CDN headers (Vercel/Cloudflare) when present.'],
              ['Properties', 'Your custom data', 'Whatever your events attach, stored as JSONB.'],
            ]}
          />
        </Section>

        <Section n="2" title="What is engineered out">
          <DataTable
            columns={['Never collected', 'How']}
            firstColMono={false}
            rows={[
              ['Cookies', 'The tracker writes nothing to the browser — no cookies, no localStorage, no IndexedDB.'],
              ['Raw IP addresses', 'The server hashes the IP with SHA-256 and a secret salt, keeps 16 hex chars, and discards the original.'],
              ['Fingerprints', 'No canvas, audio, font, or device fingerprinting — the data to build one is never gathered.'],
              ['Cross-site tracking', 'Events post to your domain about your pages. Canopy cannot see visitors on other sites.'],
              ['Personal details by default', 'No names, emails, or accounts — unless you explicitly send them in identify or event props.'],
            ]}
          />
        </Section>

        <Section n="3" title="The session model">
          <P>
            When the first event of a visit is sent, the tracker generates a random UUID and keeps it in memory.
            Every event in that page's lifetime carries the same session ID, so SPA navigations group into one
            visit. When the tab closes, the session is gone — nothing was ever written down.
          </P>
          <CodeWindow label="session lifetime" badge="in-memory only" tone="muted" code={`page load ──► pageview ──► SPA route ──► pageview ──► tab closed
                 └──────────── same session ID ────────────┘   ✕ gone`} />
          <P>
            This is why Canopy needs no consent banner in most jurisdictions: there is no storage to consent to,
            and no identifier that outlives the page. On logout, <C>canopy.reset()</C> discards the session so the
            next activity starts fresh.
          </P>
        </Section>

        <Section n="4" title="IP hashing in detail">
          <P>
            The ingestion endpoint extracts the visitor IP from standard proxy headers (<C>x-forwarded-for</C>, then{' '}
            <C>x-real-ip</C>), combines it with your server-side salt, and stores only:
          </P>
          <CodeWindow label="hashing" tone="muted" code={`ip_hash = sha256(ip + CANOPY_IP_SALT).slice(0, 16)`} />
          <P>
            The salt (<C>CANOPY_IP_SALT</C>) never leaves your server, so the stored value is useless to anyone who
            obtains the database without the salt — a preimage attack would require guessing the entire salt. Keep
            the salt stable if you rely on returning-visitor counts: rotating it changes every hash from that point
            forward. And set a strong value in production; the built-in default exists only for local development.
          </P>
        </Section>

        <Section n="5" title="Do Not Track">
          <P>
            The tracker checks the browser's Do Not Track signal (<C>navigator.doNotTrack</C> and its legacy
            variants) on every send and drops all events when it is enabled — before any network request is made.
            This is the default and needs no configuration. Overriding it is possible but not recommended:
          </P>
          <CodeWindow label="not recommended" tone="muted" code={`<script src="/p.js" data-site-id="canopy_example_com"
  data-respect-dnt="false" async></script>`} />
        </Section>

        <Section n="6" title="What this means for compliance">
          <Sub>GDPR</Sub>
          <P>
            Canopy collects no special-category data, stores nothing on the visitor's device, and pseudonymizes the
            IP before storage — the combination most privacy regulators treat as out of scope for consent-banner
            requirements for cookieless analytics. Because all data lives in your own Postgres database, you can
            fulfill access and deletion requests directly with SQL, and the export endpoint gives visitors their
            data on request.
          </P>
          <Sub>Self-hosting</Sub>
          <P>
            Self-hosting moves data residency entirely into your hands: choose a region, choose a provider, keep
            the database in the EU if that is what your audience requires. The dashboard is the only component with
            accounts, and analytics events are never tied to them — events know a site, a session, and a hash.
          </P>
          <Callout label="good practice" tone="teal">
            Mention the analytics in your privacy policy anyway ("we collect cookieless usage statistics"), scrub
            emails and tokens from event props with a <C>beforeSend</C> hook, and keep your{' '}
            <C>CANOPY_IP_SALT</C> secret. The{' '}
            <Link href="/docs/events#6-scrubbing-properties-before-send" className="text-rose-400 underline underline-offset-2">events guide</Link> shows the hook.
          </Callout>
        </Section>
      </div>

      <CTA title="Analytics without the baggage" primary={{ href: '/docs/install', label: 'Quick start' }} secondary={{ href: '/docs/self-host', label: 'Self-host guide' }}>
        No cookies, no consent banner, no third-party requests — by construction.
      </CTA>
    </DocsShell>
  );
}
