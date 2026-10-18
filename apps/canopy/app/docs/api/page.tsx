import Link from 'next/link';
import { DocsShell, PageTitle, Section, P, C, Sub, CodeWindow, DataTable, Callout, CTA } from '../_components';

export default function APIPage() {
  return (
    <DocsShell>
      <PageTitle title="HTTP API">
        Canopy is two small APIs. The ingestion endpoint accepts events from the browser tracker, your server, or
        anything that can POST JSON — no auth, first-party by design. The analytics endpoints are what the dashboard
        itself calls: session-authenticated reads scoped to your workspace, so anything you can see in the dashboard
        you can also query programmatically.
      </PageTitle>

      <div className="mt-12 space-y-16">
        <Section n="1" id="ingest" title="Ingest events">
          <P>
            <C>POST /api/canopy/event</C> accepts a single event per request. There are no API keys — the endpoint
            is meant to be called from your own site or your own backend, and the server enriches every event
            (session handling, IP hashing, country) before storing it.
          </P>
          <CodeWindow code={`POST /api/canopy/event
Content-Type: application/json

{
  "s": "canopy_example_com",
  "n": "pageview",
  "u": "https://example.com/pricing",
  "p": "/pricing",
  "r": "https://google.com",
  "t": "Pricing — Example",
  "w": 1440,
  "props": { "utm_source": "newsletter" },
  "sid": "3f9c2a1e-...",
  "v": "0.1.0",
  "ts": 1739755562410
}`} />
          <Sub>Fields</Sub>
          <DataTable
            columns={['Field', 'Required', 'Limits', 'Description']}
            rows={[
              ['s', <span className="text-teal-400">yes</span>, '—', <>Site ID, e.g. <C>canopy_example_com</C>.</>],
              ['n', <span className="text-teal-400">yes</span>, 'max 64 chars', <>Event name: <C>pageview</C>, <C>outbound</C>, or custom.</>],
              ['u', 'no', 'max 2048 chars', 'Full page URL.'],
              ['p', 'no', 'max 2048 chars', <>Path including query, e.g. <C>/pricing?plan=pro</C>.</>],
              ['r', 'no', 'max 2048 chars', 'Referrer URL.'],
              ['t', 'no', 'max 512 chars', 'Page title.'],
              ['w', 'no', 'number', 'Viewport width in pixels.'],
              ['props', 'no', 'any JSON', 'Custom properties, stored as JSONB.'],
              ['sid', 'no', 'max 64 chars', 'Session ID. Generated server-side if omitted.'],
              ['v', 'no', '—', 'Tracker version. Validated, not stored.'],
              ['ts', 'no', 'number', 'Client timestamp in ms. Validated, not stored.'],
            ]}
          />
          <Sub>Responses</Sub>
          <DataTable
            columns={['Status', 'Body', 'When']}
            firstColMono
            rows={[
              ['202', <span className="text-slate-500">(empty)</span>, 'Event accepted and stored.'],
              ['400', <C>{'{ "error": "invalid json" }'}</C>, 'Body is not parseable JSON.'],
              ['400', <C>{'{ "error": "invalid payload", "issues": … }'}</C>, 'A field failed validation — issues lists what.'],
              ['403', <C>{'{ "error": "origin not allowed" }'}</C>, 'Request origin does not match the site’s registered domain (production only).'],
              ['403', <C>{'{ "error": "site not verified" }'}</C>, 'Production ingestion requires a verified domain — add the TXT record and verify in Settings (production only).'],
              ['404', <C>{'{ "error": "unknown site" }'}</C>, 'Site ID does not exist (production only — see note below).'],
              ['500', <C>{'{ "error": "store failed" }'}</C>, 'Database insert failed.'],
            ]}
          />
          <Callout label="development shortcut">
            Outside production, events for unknown site IDs auto-create the site so you can test before signing up.
            In production, register the site first or ingestion returns <C>404</C>.
          </Callout>
          <Sub>CORS</Sub>
          <P>
            Cross-origin POSTs are only allowed from the site’s registered domain (including subdomains), validated
            server-side against the request’s <C>Origin</C> or <C>Referer</C> header, and mirrored back in{' '}
            <C>Access-Control-Allow-Origin</C> with 24-hour preflight caching. That is what lets the tracker live on
            one host while events post to another — still your infrastructure, no third party involved. Events from
            any other origin are rejected with <C>403</C>.
          </P>
          <Sub>Abuse protections</Sub>
          <P>
            Production ingestion requires the site's domain to be verified, and events are rate-limited per site and
            per visitor IP. Events that exceed the limits are dropped silently — the endpoint still answers{' '}
            <C>202</C> — and the dashboard shows a verification prompt for unverified sites.
          </P>
          <Sub>Server-side enrichment</Sub>
          <P>
            Before an event is stored, the server hashes the visitor IP with SHA-256 and a server-side salt — only
            the first 16 hex characters are kept, and the raw IP is never written. Country is derived from CDN
            headers when present (<C>x-vercel-ip-country</C> on Vercel, <C>cf-ipcountry</C> on Cloudflare). The full
            privacy model is documented in <Link href="/docs/privacy" className="text-rose-400 underline underline-offset-2">Privacy & compliance</Link>.
          </P>
        </Section>

        <Section n="2" id="analytics" title="Analytics API">
          <P>
            All analytics endpoints live under <C>/api/analytics/*</C>, require a signed-in dashboard session
            (cookie auth), and are scoped to sites in your workspace — requesting a site you don't belong to is
            rejected. Missing parameters return <C>400</C>; no session returns <C>401</C>.
          </P>
          <Sub>Shared parameters</Sub>
          <DataTable
            columns={['Param', 'Values', 'Description']}
            rows={[
              ['siteId', <span className="text-teal-400">required</span>, 'Site to query.'],
              ['range', <><C>1h</C> <C>24h</C> <C>7d</C> <C>30d</C> <C>90d</C></>, <>Time window. Default <C>7d</C>. The time series bucket size follows the range: minute for <C>1h</C>, hour for <C>24h</C>/<C>7d</C>, day for <C>30d</C>/<C>90d</C>.</>],
              ['eventName', 'string', 'Filter by exact event name where supported.'],
              ['limit / offset', 'number', 'Pagination on list-style endpoints.'],
            ]}
          />

          <Sub id="overview">Overview — GET /api/analytics/overview</Sub>
          <P>
            The numbers behind the dashboard overview: totals, bounce rate, session duration, top lists, and a
            time series in one call. Accepts extra filters — <C>eventName</C>, <C>path</C> (substring match),{' '}
            <C>referrer</C> (substring match), <C>country</C> (exact).
          </P>
          <CodeWindow label="request" tone="muted" code={`GET /api/analytics/overview?siteId=canopy_example_com&range=7d`} />
          <CodeWindow label="200 OK" tone="muted" code={`{
  "totalEvents": 1284,
  "totalPageviews": 1102,
  "uniqueVisitors": 389,
  "bounceRate": 42.1,
  "avgSessionDuration": 94500,
  "topPages":     [{ "key": "/", "count": 512, "percentage": 46.5 }],
  "topReferrers": [{ "key": "news.ycombinator.com", "count": 210, "percentage": 16.4 }],
  "topCountries": [{ "key": "US", "count": 402, "percentage": 31.3 }],
  "timeSeries":   [{ "timestamp": "…", "value": 42, "label": "Sep 28, 22:00" }]
}`} />
          <P>
            <C>bounceRate</C> is the percentage of sessions with exactly one pageview, and{' '}
            <C>avgSessionDuration</C> is in milliseconds.
          </P>

          <Sub>Time series — GET /api/analytics/timeseries</Sub>
          <P>Chart-ready buckets with an explicit interval override:</P>
          <CodeWindow label="request + response" tone="muted" code={`GET /api/analytics/timeseries?siteId=canopy_example_com&range=7d&interval=hour

{ "data": [{ "timestamp": "…", "value": 42, "label": "Sep 28, 22:00" }] }`} />
          <P>
            <C>interval</C> accepts <C>minute</C>, <C>hour</C>, or <C>day</C> (default <C>hour</C>). Pass{' '}
            <C>eventName</C> to chart a custom event instead of pageviews.
          </P>

          <Sub>Top lists</Sub>
          <P>
            Three endpoints share the same shape — pages, referrers, and countries, ordered by count with
            percentage of total:
          </P>
          <CodeWindow label="requests" tone="muted" code={`GET /api/analytics/top-pages?siteId=…&range=7d&limit=20&eventName=pageview
GET /api/analytics/top-referrers?siteId=…&range=7d
GET /api/analytics/top-countries?siteId=…&range=7d

{ "data": [{ "key": "/pricing", "count": 512, "percentage": 46.5 }], "total": 1102 }`} />
          <P>
            <C>limit</C> defaults to 20 rows. On top-pages, <C>eventName</C> defaults to <C>pageview</C> — change it
            to rank any custom event by path. Referrer and country lists exclude empty values.
          </P>

          <Sub>Realtime — GET /api/analytics/realtime</Sub>
          <P>Live visitor activity over a rolling window, in seconds:</P>
          <CodeWindow label="request + response" tone="muted" code={`GET /api/analytics/realtime?siteId=canopy_example_com&window=60

{
  "activeVisitors": 7,
  "pageviewsPerMinute": 3.5,
  "eventsPerMinute": 5.2,
  "topActivePages": [{ "key": "/", "count": 4 }],
  "recentEvents": [{ "id": "evt_…", "name": "pageview", "path": "/", "country": "US", "timestamp": "…" }]
}`} />
          <P>
            <C>window</C> defaults to 60 seconds. <C>recentEvents</C> returns the 20 most recent events with
            country attached.
          </P>

          <Sub>Event log — GET /api/analytics/events</Sub>
          <P>Paginated raw events for the range:</P>
          <CodeWindow label="request + response" tone="muted" code={`GET /api/analytics/events?siteId=…&range=7d&eventName=signup&limit=100&offset=0

{
  "events": [{ "id": "evt_…", "name": "signup", "url": "…", "path": "/", "referrer": "…",
               "title": "…", "viewportW": 1440, "props": { … }, "sessionId": "…",
               "country": "US", "createdAt": "2026-10-17T09:14:22.410Z" }],
  "total": 240, "limit": 100, "offset": 0
}`} />

          <Sub>Export — GET /api/analytics/export</Sub>
          <P>Download the same data as CSV or JSON, streamed as a file attachment:</P>
          <CodeWindow label="request" tone="muted" code={`GET /api/analytics/export?siteId=canopy_example_com&range=7d&format=csv`} />
          <P>
            <C>format</C> is <C>csv</C> (default) or <C>json</C>. <C>limit</C> defaults to 10,000 rows and is
            capped at 50,000. Files are named <C>{'canopy_<siteId>_<range>.csv'}</C>. Because the export
            contains session IDs and property payloads, treat exported files with the same care as your database.
          </P>
        </Section>

        <Section n="3" id="sites" title="Manage sites">
          <P>
            Sites belong to workspaces. <C>GET /api/sites</C> returns the sites you can access (up to 50, newest
            first) as a JSON array. To create one, POST the domain as form data — Canopy normalizes it, derives the
            site ID, and attaches it to your active workspace:
          </P>
          <CodeWindow label="create site" tone="muted" code={`POST /api/sites
Content-Type: application/x-www-form-urlencoded

domain=example.com

→ 200 { "id": "canopy_example_com", "domain": "example.com" }`} />
          <P>
            Domains must contain a dot; protocols, <C>www.</C>, and paths are stripped before the site ID is
            derived. Invalid domains return <C>400</C>.
          </P>
        </Section>

        <Section n="4" id="verify" title="Verify domain ownership">
          <P>
            Verification proves you control a domain via a DNS TXT record. Request a record, publish it, then ask
            Canopy to check — verification happens through DNS-over-HTTPS, so no propagation-wait guessing games.
          </P>
          <CodeWindow label="get record" tone="muted" code={`GET /api/verify?site=canopy_example_com

{ "status": "pending", "record": "canopy-site=9f2c…", "domain": "example.com" }`} />
          <P>
            Add a TXT record at your domain's apex with the returned <C>record</C> value, then trigger the check:
          </P>
          <CodeWindow label="check" tone="muted" code={`POST /api/verify?site=canopy_example_com

→ { "status": "verified", "domain": "example.com" }
→ { "status": "pending",  "record": "canopy-site=9f2c…", "domain": "example.com" }`} />
          <P>
            Once verified, the checkmark appears on the site in your dashboard. Requests for sites you don't have
            access to return <C>404</C>, and unknown sites return a <C>not_found</C> status.
          </P>
        </Section>

        <Section n="5" id="errors" title="Errors">
          <P>Error responses are JSON with an <C>error</C> key. The codes you can encounter:</P>
          <DataTable
            columns={['Status', 'Meaning']}
            firstColMono
            rows={[
              ['400', <>Malformed request — invalid JSON, failed validation, or missing <C>siteId</C>.</>],
              ['401', 'No dashboard session on an analytics, sites, or verify route.'],
              ['404', 'Unknown site ID on ingestion (production), or a site you have no access to.'],
              ['500', 'Storage or query failure — check server logs.'],
            ]}
          />
        </Section>
      </div>

      <CTA title="Start sending events" secondary={{ href: '/docs/events', label: 'Custom events guide' }}>
        No API keys for ingestion. Just POST to your own endpoint.
      </CTA>
    </DocsShell>
  );
}
