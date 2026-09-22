'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Check, ExternalLink, Copy } from 'lucide-react';

export function OnboardingContent({
  siteId,
  displayDomain,
  snippet,
  npmSnippet,
}: {
  siteId: string;
  displayDomain: string;
  snippet: string;
  npmSnippet: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <h1 className="mt-4 text-[22px] md:text-[24px] font-semibold tracking-[-0.03em] text-white">
        Set up Canopy for <span className="text-[#ff4d00]">{displayDomain}</span>
      </h1>
      <p className="mt-2 text-[13px] leading-6 text-zinc-400">
        Paste one line — no cookies, under 2kb, SPA-aware. Events are first-party, IP hashed, you own the Postgres.
      </p>

      <Tabs defaultValue="script" className="mt-7">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="script">1 Script Tag</TabsTrigger>
          <TabsTrigger value="nextjs">2 Next.js</TabsTrigger>
          <TabsTrigger value="custom">3 Custom Domain</TabsTrigger>
        </TabsList>

        <TabsContent value="script" className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mono text-[11px] tracking-widest text-zinc-500 uppercase">
              <span className="size-5 rounded-full bg-white text-zinc-900 grid place-items-center text-[10px] font-medium">1</span>
              Script Tag — Any Site
            </div>
            <div className="mt-3 rounded-xl overflow-hidden border border-[var(--border)] bg-[#08080a] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="h-8 flex items-center justify-between px-3 border-b border-white/[0.06] bg-white/[0.02]">
                <span className="mono text-[10px] text-zinc-500">p.js • first-party</span>
                <span className="mono text-[10px] text-zinc-600">async • 1.5kb gz</span>
              </div>
              <pre className="mono text-[12px] leading-5 p-4 overflow-x-auto text-zinc-300">{snippet}</pre>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(snippet, 'script')}>
                {copied === 'script' ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <p className="mono text-[11px] text-zinc-500">
                Add before <code className="bg-white/[0.06] border border-white/[0.06] px-1 py-0.5 rounded text-zinc-300">{'</head>'}</code> on {displayDomain}
              </p>
            </div>
          </div>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="size-5 rounded-full bg-amber-500/20 text-amber-400 grid place-items-center text-[10px] font-medium">⚡</span>
                Real-time Verification
              </CardTitle>
              <CardDescription>
                Open your site and watch the Realtime dashboard — first event fires on load
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={`/dashboard?site=${encodeURIComponent(siteId)}`}
                className="inline-flex items-center gap-2 rounded-full bg-white text-zinc-900 px-5 py-2.5 text-[13px] font-medium hover:bg-zinc-100 transition"
              >
                <ExternalLink className="h-4 w-4" />
                Open Realtime Dashboard
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nextjs" className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mono text-[11px] tracking-widest text-zinc-500 uppercase">
              <span className="size-5 rounded-full bg-white text-zinc-900 grid place-items-center text-[10px] font-medium">2</span>
              Next.js — <code className="bg-white/[0.06] border border-white/[0.06] px-1 py-0.5 rounded text-zinc-300">@wnstn/canopy/nextjs</code>
            </div>
            <div className="mt-3 rounded-xl border border-[var(--border)] bg-white/[0.02] p-4 overflow-x-auto">
              <pre className="mono text-[12px] leading-5 text-zinc-300">{npmSnippet}</pre>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(npmSnippet, 'nextjs')}>
                {copied === 'nextjs' ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <p className="mono text-[11px] text-zinc-500">
                Install: <code className="bg-white/[0.06] border border-white/[0.06] px-1 py-0.5 rounded text-zinc-300">pnpm add @wnstn/canopy</code>
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 grid place-items-center text-[10px] font-medium">🎯</span>
                Advanced Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <p className="font-medium text-white">Debug Mode</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Add <code className="bg-white/10 px-1 rounded text-zinc-300">debug: true</code> to see all events in console
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <p className="font-medium text-white">Hooks</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Use <code className="bg-white/10 px-1 rounded text-zinc-300">useCanopyTrack()</code>, <code className="bg-white/10 px-1 rounded text-zinc-300">useCanopyIdentify()</code>
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <p className="font-medium text-white">Before Send Hook</p>
                  <p className="text-sm text-zinc-500 mt-1">Filter or enrich events before they're sent</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <p className="font-medium text-white">Sample Rate</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    <code className="bg-white/10 px-1 rounded text-zinc-300">sampleRate: 0.1</code> for high-traffic sites
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="size-5 rounded-full bg-amber-500/20 text-amber-400 grid place-items-center text-[10px] font-medium">🌐</span>
                Custom Domain
              </CardTitle>
              <CardDescription>
                Use your own subdomain (e.g., analytics.yourdomain.com) for tracking and dashboards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-zinc-400">
                Add a CNAME record to your DNS provider to enable custom domain tracking and SSL.
              </p>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <span className="mono text-[10px] text-zinc-500">Record Type</span>
                    <code className="mono text-sm bg-black/30 rounded px-3 py-2 block break-all">CNAME</code>
                  </div>
                  <div className="space-y-1">
                    <span className="mono text-[10px] text-zinc-500">Host</span>
                    <code className="mono text-sm bg-black/30 rounded px-3 py-2 block break-all">analytics</code>
                  </div>
                  <div className="space-y-1">
                    <span className="mono text-[10px] text-zinc-500">Target</span>
                    <code className="mono text-sm bg-black/30 rounded px-3 py-2 block break-all">cname.canopy.wnstn.io</code>
                  </div>
                  <div className="space-y-1">
                    <span className="mono text-[10px] text-zinc-500">TTL</span>
                    <code className="mono text-sm bg-black/30 rounded px-3 py-2 block">300</code>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <p className="text-sm text-zinc-400 mb-3">After DNS propagates (up to 48h), verify your domain:</p>
                <Button variant="outline">Verify Domain</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 grid place-items-center text-[10px] font-medium">🔒</span>
                SSL & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Automatic SSL via Let's Encrypt</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Automatic certificate renewal</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>HSTS and secure headers</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>First-party cookies only (if enabled)</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-2 pt-1">
        <Link href={`/dashboard?site=${encodeURIComponent(siteId)}`} className="rounded-full bg-white text-zinc-900 px-5 py-2.5 text-[13px] font-medium hover:bg-zinc-100 transition">
          View Dashboard →
        </Link>
        <Link href="/docs" className="rounded-full border border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.08] px-5 py-2.5 text-[13px] mono text-white transition">
          Read Docs
        </Link>
      </div>
    </>
  );
}