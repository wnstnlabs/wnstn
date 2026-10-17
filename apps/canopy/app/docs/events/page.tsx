import Link from 'next/link';
import { DocsShell, PageTitle, Section, P, C, Sub, CodeWindow, Callout, CTA } from '../_components';

export default function EventsPage() {
  return (
    <DocsShell>
      <PageTitle title="Custom events">
        Pageviews and outbound clicks are tracked for you. Custom events are how you answer the questions specific
        to your product — which plans people preview, where signups come from, which features actually get used.
        An event is one call in the browser or one POST from your server, and every property you attach is stored
        as JSON in your own database.
      </PageTitle>

      <div className="mt-12 space-y-16">
        <Section n="1" title="How an event is stored">
          <P>
            Every event — pageview, outbound click, or custom — becomes one row. The tracker fills in the context
            automatically so you never have to: the current URL, path, referrer, page title, and viewport width are
            captured at send time, along with a random in-memory session ID that stitches the visit together.
            Your call only contributes two things: the event name and its properties.
          </P>
          <CodeWindow label="one event, one row" badge="jsonb props" tone="muted" code={`{
  "name": "checkout_completed",
  "path": "/checkout",
  "referrer": "https://news.ycombinator.com",
  "props": { "plan": "pro", "value": 49, "currency": "USD" },
  "session_id": "3f9c2a1e-...",
  "country": "US",
  "created_at": "2026-10-17T09:14:22.410Z"
}`} />
          <P>
            Properties are completely free-form. There is no schema to register, no event to create in a dashboard
            first — send what you need and it is queryable immediately.
          </P>
        </Section>

        <Section n="2" title="Naming events">
          <P>
            Names are plain strings, up to 64 characters. Canopy reserves three built-in names — <C>pageview</C>,{' '}
            <C>outbound</C>, and <C>identify</C> — and sends those itself; everything else is yours.
            A few conventions keep the event log pleasant to read months later:
          </P>
          <P>
            Name the action, not the UI element: <C>signup_completed</C> survives a redesign, <C>header_button_2</C>{' '}
            does not. Keep one namespace with snake_case so events group naturally in the log, and put variable
            detail in properties rather than the name — <C>checkout_completed</C> with{' '}
            <C>{`{ plan: "pro" }`}</C> gives you one event to analyze, while <C>checkout_pro_completed</C> and{' '}
            <C>checkout_team_completed</C> multiply your event list with every plan you add.
          </P>
        </Section>

        <Section n="3" title="Tracking from the browser">
          <Sub>React / Next.js</Sub>
          <P>
            In client components, the <C>useCanopyTrack</C> hook returns a stable <C>track</C> function.
            It works even if the provider has not finished initializing — calls fall through to the module-level
            queue and replay automatically:
          </P>
          <CodeWindow label="react" badge="use client" tone="muted" code={`'use client';
import { useCanopyTrack } from "@wnstn/canopy-nextjs";

export function UpgradeButton() {
  const { track } = useCanopyTrack();

  return (
    <button onClick={() => track("checkout_started", { plan: "pro", value: 49 })}>
      Upgrade
    </button>
  );
}`} />
          <Sub>Vanilla</Sub>
          <P>
            With the core package, keep the instance <C>createCanopy</C> returns and call methods on it. The
            module-level <C>track</C> function also works from anywhere — before or after initialization:
          </P>
          <CodeWindow label="vanilla" badge="@wnstn/canopy" tone="muted" code={`import { createCanopy } from "@wnstn/canopy";

const canopy = createCanopy({ siteId: "canopy_example_com" });

canopy.track("signup_started", { source: "header" });`} />
          <Sub>Script tag installs</Sub>
          <P>
            If you installed via the script tag and don't bundle your own JavaScript, the initialized tracker is
            exposed globally. Call it as a function or use the named methods:
          </P>
          <CodeWindow label="browser console or inline script" tone="muted" code={`window.canopy("checkout_started", { plan: "pro" });
window.canopy.track("checkout_started", { plan: "pro" });`} />
        </Section>

        <Section n="4" title="Default props">
          <P>
            Values you want on every event — environment, release version, A/B variant — belong in default props
            rather than repeated at every call site. Pass them once at initialization and Canopy merges them into
            each event; per-call properties win on conflicts:
          </P>
          <CodeWindow label="defaults" badge="merged into every event" tone="muted" code={`const canopy = createCanopy({
  siteId: "canopy_example_com",
  props: { app_version: "2.4.1", variant: "b" },
});

canopy.track("signup_started", { source: "header" });
// props: { app_version: "2.4.1", variant: "b", source: "header" }`} />
          <P>Defaults can also be set or extended later in the session with <C>setDefaultProps</C>:</P>
          <CodeWindow label="runtime defaults" tone="muted" code={`canopy.setDefaultProps({ experiment: "pricing_v3" });`} />
        </Section>

        <Section n="5" title="Identifying users">
          <P>
            <C>identify</C> attaches traits to the current session as a regular event with whatever properties you
            pass. Canopy does not build user profiles or store identities in a separate table — the trait object
            lands in <C>props</C> exactly like any custom event, which keeps the privacy story simple:
          </P>
          <CodeWindow label="identify" badge="after login" tone="muted" code={`canopy.identify({ userId: user.id, plan: user.plan });`} />
          <Callout label="privacy" tone="amber">
            Only send traits you are comfortable storing in your own database. Identifiers like account IDs are
            pseudonymous; emails are usually better left out. See <Link href="/docs/privacy" className="text-rose-400 underline underline-offset-2">Privacy & compliance</Link>.
          </Callout>
          <P>
            Because sessions live in memory only, a <C>reset()</C> — for example on logout — simply discards the
            current session ID and the next event starts a fresh one.
          </P>
        </Section>

        <Section n="6" title="Scrubbing properties before send">
          <P>
            The <C>beforeSend</C> hook sees every event just before it leaves the browser. Return a modified event
            to redact properties, or <C>false</C> to cancel the send entirely — useful for enforcing a house rule
            that no PII is ever collected, even by accident:
          </P>
          <CodeWindow label="hooks" badge="beforeSend" tone="muted" code={`createCanopy({
  siteId: "canopy_example_com",
  hooks: {
    beforeSend: (event) => {
      if (event.props?.email) event.props.email = "[redacted]";
      return event;
    },
  },
});`} />
          <P>
            Hooks run for automatic events too — pageviews and outbound clicks pass through the same pipeline — and
            an error thrown inside a hook is caught and logged rather than breaking tracking.
          </P>
        </Section>

        <Section n="7" title="Server-side events">
          <P>
            Anything that can POST JSON can send an event — no auth, no SDK. Server-side tracking is the right tool
            for webhooks, background jobs, and anything that happens without a browser:
          </P>
          <CodeWindow label="server-side" badge="POST /api/canopy/event" code={`curl -X POST https://canopy.your-app.com/api/canopy/event \\
  -H "Content-Type: application/json" \\
  -d '{
    "s": "canopy_example_com",
    "n": "invoice_paid",
    "props": { "amount": 49, "plan": "pro" }
  }'`} />
          <P>
            Reuse the visitor's session ID (it is included on every browser event as <C>sid</C>) when you want the
            server event to land in the same visit. The full field reference is in the{' '}
            <Link href="/docs/api#ingest" className="text-rose-400 underline underline-offset-2">HTTP API docs</Link>.
          </P>
        </Section>

        <Section n="8" title="Recipes">
          <Sub>Capture UTM parameters</Sub>
          <P>
            Store campaign parameters as default props on first load and every event in the session carries them:
          </P>
          <CodeWindow label="utm" tone="muted" code={`const params = new URLSearchParams(location.search);
const utm = Object.fromEntries(
  [...params].filter(([key]) => key.startsWith("utm_"))
);
if (Object.keys(utm).length) canopy.setDefaultProps(utm);`} />
          <Sub>Scroll depth</Sub>
          <P>
            Fire once when a reader reaches the end of an article — a better engagement signal than time on page:
          </P>
          <CodeWindow label="scroll depth" tone="muted" code={`let fired = false;
window.addEventListener("scroll", () => {
  const max = document.body.scrollHeight - window.innerHeight;
  if (!fired && max > 0 && window.scrollY / max >= 0.9) {
    fired = true;
    canopy.track("read_complete", { path: location.pathname });
  }
}, { passive: true });`} />
        </Section>

        <Section n="9" title="Viewing events">
          <P>
            The event log in the dashboard shows raw events with session IDs, countries, and properties, filterable
            by event name and time range. For programmatic access, the same data is available over HTTP — the
            events endpoint the log uses, plus CSV/JSON export — all documented in the{' '}
            <Link href="/docs/api" className="text-rose-400 underline underline-offset-2">HTTP API reference</Link>.
          </P>
        </Section>
      </div>

      <CTA title="Start tracking what matters" secondary={{ href: '/docs/sdk', label: 'SDK reference' }}>
        Two built-in events come free. Everything else is one call away.
      </CTA>
    </DocsShell>
  );
}
