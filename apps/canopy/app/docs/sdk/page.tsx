import Link from 'next/link';
import { DocsShell, PageTitle, Section, P, C, Sub, CodeWindow, DataTable, Callout, CTA } from '../_components';

export default function SDKPage() {
  return (
    <DocsShell>
      <PageTitle title="SDK reference">
        The tracker ships as two packages: <C>@wnstn/canopy</C> is the vanilla core — under 2kb, no framework
        required — and <C>@wnstn/canopy-nextjs</C> wraps it for React with a provider and hooks. Both are
        tree-shakeable, type-safe, and send events to your own domain with no cookies and no browser storage.
      </PageTitle>

      <div className="mt-12 space-y-16">
        <Section n="1" title="Installation">
          <CodeWindow label="terminal" tone="muted" code={`npm i @wnstn/canopy          # vanilla core
npm i @wnstn/canopy-nextjs   # React / Next.js wrapper (includes the core)`} />
          <P>
            Using the script tag instead of bundling? Skip this page's install sections — the{' '}
            <Link href="/docs/install#2-html-script-any-site" className="text-rose-400 underline underline-offset-2">quick start</Link>{' '}
            covers the tag attributes, and everything below about options and hooks still applies via{' '}
            <C>window.Canopy.init(options)</C>.
          </P>
        </Section>

        <Section n="2" title="Initializing">
          <P>
            <C>createCanopy</C> (a factory — no <C>new</C>, no side effects at import time) validates your options,
            starts the tracker, and returns an instance:
          </P>
          <CodeWindow label="init" tone="muted" code={`import { createCanopy } from "@wnstn/canopy";

const canopy = createCanopy({
  siteId: "canopy_example_com",
  debug: process.env.NODE_ENV === "development",
});`} />
          <P>
            Initialization is idempotent: calling it twice updates the existing instance's options instead of
            creating a second tracker. If <C>siteId</C> is missing, initialization throws a <C>CanopyError</C>{' '}
            (see <Link href="#errors" className="text-rose-400 underline underline-offset-2">error handling</Link>).
          </P>
          <Sub>Options</Sub>
          <DataTable
            columns={['Option', 'Type', 'Default', 'Description']}
            rows={[
              ['siteId', 'string', <span className="text-teal-400">required</span>, 'Your site ID, e.g. canopy_example_com.'],
              ['endpoint', 'string', <C>/api/canopy/event</C>, 'Where events are POSTed. Set a full URL for cross-origin installs.'],
              ['env', 'string', '—', 'Label attached to every event, e.g. production or staging.'],
              ['manualPageview', 'boolean', 'false', 'Suppress the automatic pageview on load.'],
              ['disableOutbound', 'boolean', 'false', 'Disable automatic outbound click tracking.'],
              ['respectDnt', 'boolean', 'true', 'Drop all events when the browser sends Do Not Track.'],
              ['sampleRate', 'number', '1', 'Send only a fraction of events, 0–1. Useful for very high-traffic sites.'],
              ['props', 'object', '—', 'Default properties merged into every event.'],
              ['debug', 'boolean', 'false', 'Log every send to the console.'],
              ['hooks', 'object', '—', 'beforeSend / afterSend / onError interceptors.'],
            ]}
          />
        </Section>

        <Section n="3" title="Instance methods">
          <DataTable
            columns={['Method', 'Description']}
            rows={[
              ['track(name, props?)', 'Send a custom event with optional properties.'],
              ['pageview(props?)', <>Send a pageview for the current URL. Automatic unless <C>manualPageview</C> is set.</>],
              ['identify(props?)', <>Send an <C>identify</C> event with user traits stored in props.</>],
              ['reset()', 'Discard the current session ID — the next event starts a new session.'],
              ['setDefaultProps(props)', 'Merge properties into the defaults attached to every event.'],
              ['getSessionId()', 'Return the current in-memory session ID.'],
              ['options', <>Read the current configuration (also assignable to update it).</>],
            ]}
          />
          <P>Typical lifecycle for a logged-in app:</P>
          <CodeWindow label="lifecycle" tone="muted" code={`canopy.identify({ userId: user.id, plan: user.plan });  // after login
canopy.track("feature_used", { name: "export" });        // anywhere
canopy.reset();                                          // on logout`} />
        </Section>

        <Section n="4" title="Module-level functions">
          <P>
            The package also exports standalone functions that work before initialization by queueing internally.
            Once <C>createCanopy</C> runs, the queue replays in order — so import order and init order never
            matter:
          </P>
          <CodeWindow label="pre-init queue" badge="just works" code={`import { track, pageview, identify } from "@wnstn/canopy";

track("signup_started");        // queued
pageview({ path: "/landing" }); // queued
identify({ userId: "123" });    // queued
createCanopy({ siteId: "canopy_example_com" }); // queue replays here`} />
          <DataTable
            columns={['Function', 'Description']}
            rows={[
              ['track(name, props?)', 'Queue or send a custom event.'],
              ['pageview(props?)', 'Queue or send a pageview.'],
              ['identify(props?)', 'Queue or send an identify event.'],
              ['createCanopy(options)', 'Initialize the tracker (alias: initCanopy).'],
              ['setDefaultProps(props)', 'Set defaults on the initialized instance.'],
              ['getSessionId()', 'Current session ID.'],
              ['flushQueue()', 'Force-replay queued calls (mainly for tests).'],
              ['isInitialized()', 'Whether the tracker has started.'],
              ['getOptions()', 'Current options of the initialized instance.'],
              ['getCanopy()', 'The live instance, or null before init.'],
              ['CanopyError', 'The error class used for config, network, and validation failures.'],
            ]}
          />
        </Section>

        <Section n="5" title="Hooks">
          <P>
            Hooks intercept every send — including automatic pageviews and outbound clicks — which makes them the
            place for redaction, filtering, and logging. All three can be async, and an error thrown inside a hook
            is caught and logged so it never breaks tracking:
          </P>
          <DataTable
            columns={['Hook', 'Signature', 'Use']}
            rows={[
              ['beforeSend', <>{'(event) => event | false'}</>, 'Modify the event, or return false to cancel the send.'],
              ['afterSend', <>{'(event, response) => void'}</>, 'Runs after a successful send; response may be null.'],
              ['onError', <>{'(event, error) => void'}</>, 'Runs when a send failed.'],
            ]}
          />
          <CodeWindow label="hooks in practice" tone="muted" code={`createCanopy({
  siteId: "canopy_example_com",
  hooks: {
    beforeSend: (event) => {
      if (event.n === "outbound") return false;      // skip outbound clicks
      if (event.props?.email) event.props.email = "[redacted]";
      return event;                                   // or a modified event
    },
    afterSend: (event) => console.debug("sent", event.n),
    onError: (event, error) => reportToSentry(error),
  },
});`} />
        </Section>

        <Section n="6" title="Automatic behavior">
          <P>
            After initialization the tracker quietly does the work you would otherwise wire up by hand:
          </P>
          <DataTable
            columns={['Behavior', 'Details']}
            firstColMono={false}
            rows={[
              ['Pageviews', <>One on load, then again on every SPA navigation — <C>pushState</C>, <C>replaceState</C>, <C>popstate</C>, and <C>hashchange</C> are all observed.</>],
              ['Outbound clicks', <>A capture-phase click listener emits an <C>outbound</C> event with the link's <C>href</C> and text (up to 80 chars) whenever the target origin differs from yours.</>],
              ['Do Not Track', <>When the browser signal is on, every event is dropped. Opt out of respecting it with <C>respectDnt: false</C> — not recommended.</>],
              ['Bots', 'Requests from user agents matching common bot patterns are dropped.'],
              ['Local files', 'Pages loaded from file: are never tracked.'],
              ['Sampling', <><C>sampleRate: 0.5</C> sends roughly half of all events, chosen per event.</>],
            ]}
          />
          <Sub>Transport</Sub>
          <P>
            Events are sent with <C>navigator.sendBeacon</C> when available so they survive page unload, falling
            back to <C>fetch</C> with <C>keepalive</C>. Requests are made with <C>credentials: "omit"</C> — nothing
            identifying rides along, and no response handling delays navigation.
          </P>
          <Sub>Sessions</Sub>
          <P>
            A session is a random UUID generated in memory when the first event needs it — never written to a
            cookie, localStorage, or anywhere else. It survives SPA navigations (the page never reloaded) and
            disappears when the tab closes, which is why Canopy needs neither a consent banner nor a privacy policy
            exception. <C>reset()</C> discards it on demand, e.g. on logout.
          </P>
          <Sub>Debugging</Sub>
          <P>
            Set <C>debug: true</C> to log each send to the console, and check the network tab for a{' '}
            <C>202</C> response from your endpoint.
          </P>
        </Section>

        <Section n="7" title="Error handling">
          <P>
            Failures surface as <C>CanopyError</C> — a standard <C>Error</C> with a machine-readable{' '}
            <C>code</C> and typed helpers, so callers can branch on the kind of failure without string matching:
          </P>
          <CodeWindow label="CanopyError" tone="muted" code={`try {
  createCanopy({}); // missing siteId
} catch (e) {
  if (e instanceof CanopyError && e.isConfigError()) {
    // code: "CONFIG_ERROR"
  }
}`} />
          <DataTable
            columns={['Code', 'Helper', 'Raised when']}
            rows={[
              ['CONFIG_ERROR', 'isConfigError()', 'Invalid options — e.g. missing siteId.'],
              ['NETWORK_ERROR', 'isNetworkError()', 'A send could not reach the endpoint.'],
              ['VALIDATION_ERROR', 'isValidationError()', 'An event failed validation before sending.'],
              ['SEND_CANCELLED', 'isCancelledError()', 'A beforeSend hook cancelled the send.'],
            ]}
          />
        </Section>

        <Section n="8" title="Next.js wrapper">
          <P>
            <C>@wnstn/canopy-nextjs</C> re-exports the entire core API and adds a provider and hooks. Mount{' '}
            <C>CanopyProvider</C> once in your root layout — it initializes the tracker synchronously on the client
            and keeps options fresh across renders:
          </P>
          <CodeWindow label="app/layout.tsx" badge="app router" tone="muted" code={`import { CanopyProvider } from "@wnstn/canopy-nextjs";

export default function RootLayout({ children }) {
  return (
    <CanopyProvider siteId={process.env.NEXT_PUBLIC_CANOPY_SITE_ID!}>
      {children}
    </CanopyProvider>
  );
}`} />
          <P>
            The provider accepts every core option plus <C>scriptSrc</C>: set it to a URL to additionally render a{' '}
            <C>next/script</C> tag, or <C>false</C> to suppress the script entirely (the default — the provider
            initializes the bundled tracker itself, so a script tag is usually unnecessary).{' '}
            <C>CanopyScript</C> is also exported standalone if you want just the tag.
          </P>
          <Sub>Hooks</Sub>
          <DataTable
            columns={['Hook', 'Returns', 'Notes']}
            rows={[
              ['useCanopyTrack()', <><C>track(name, props?)</C></>, 'Stable function; falls back to the queue outside a provider.'],
              ['useCanopyPageview()', <><C>pageview(props?)</C></>, 'Manual pageview, e.g. for custom routers.'],
              ['useCanopyIdentify()', <><C>identify(props)</C></>, 'Attach traits after login.'],
              ['useCanopyReset()', <><C>reset()</C></>, 'Start a fresh session, e.g. on logout.'],
              ['useCanopyInstance()', 'all methods + options', 'Full instance access in one hook.'],
              ['useCanopy()', 'instance | null', 'Raw instance, or null before initialization.'],
              ['useCanopyInitialized()', 'boolean', 'Whether the tracker is live.'],
              ['useCanopyOptions()', 'options | null', 'Current configuration.'],
              ['useCanopyFlush()', <><C>{'() => void'}</C></>, 'Flush queued pre-init calls.'],
            ]}
          />
          <Callout label="server components">
            The tracker exists only in the browser, so hooks belong in client components. Server components render
            untouched — wrap only the interactive parts, or drop a <C>'use client'</C> boundary where you track.
          </Callout>
        </Section>

        <Section n="9" title="Event payload">
          <P>
            For reference — and for building your own ingestion clients — this is exactly what the tracker POSTs.
            Field meanings and server-side limits are documented in the{' '}
            <Link href="/docs/api#ingest" className="text-rose-400 underline underline-offset-2">HTTP API reference</Link>:
          </P>
          <CodeWindow label="POST body" badge="application/json" tone="muted" code={`{
  "v": "0.1.0",                          // SDK version
  "s": "canopy_example_com",             // site ID
  "sid": "3f9c2a1e-...",                 // in-memory session ID
  "n": "pageview",                       // event name
  "u": "https://example.com/pricing",    // full URL
  "r": "https://google.com",             // referrer
  "p": "/pricing",                       // path + query
  "t": "Pricing — Example",              // page title
  "w": 1440,                             // viewport width
  "props": { "utm_source": "newsletter" },
  "env": "production",
  "ts": 1739755562410
}`} />
        </Section>
      </div>

      <CTA title="Everything else is automatic" secondary={{ href: '/docs/events', label: 'Custom events guide' }}>
        Init once, get pageviews, SPA navigation, and outbound clicks for free.
      </CTA>
    </DocsShell>
  );
}
