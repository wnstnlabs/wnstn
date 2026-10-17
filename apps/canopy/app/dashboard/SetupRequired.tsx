'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import { PANEL, PanelHeader, MicroLabel } from '@/components/dashboard/parts';

type VerifyStatus = 'loading' | 'unverified' | 'verified' | 'unknown';

const POLL_MS = 4000;

export function SetupRequired({ siteId, domain }: { siteId: string; domain: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [origin, setOrigin] = useState('');
  const [record, setRecord] = useState<string | null>(null);
  const [status, setStatus] = useState<VerifyStatus>('loading');
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const snippet = `<script
  src="${origin}/p.js"
  data-site-id="${siteId}"
  async
></script>`;

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const loadVerification = useCallback(async () => {
    try {
      const res = await fetch(`/api/verify?site=${encodeURIComponent(siteId)}`, { credentials: 'include' });
      const json = await res.json();
      if (json.status === 'verified') {
        setStatus('verified');
        setRecord(json.record ?? null);
      } else if (json.status === 'pending') {
        setStatus('unverified');
        setRecord(json.record ?? null);
      } else {
        setStatus('unknown');
      }
    } catch {
      setStatus('unknown');
    }
  }, [siteId]);

  useEffect(() => {
    loadVerification();
  }, [loadVerification]);

  const checkVerification = async () => {
    setChecking(true);
    try {
      const res = await fetch(`/api/verify?site=${encodeURIComponent(siteId)}`, { method: 'POST', credentials: 'include' });
      const json = await res.json();
      if (json.status === 'verified') {
        setStatus('verified');
        toast({ title: 'Domain verified', description: `${json.domain ?? domain} is verified.` });
      } else {
        setStatus('unverified');
        toast({ title: 'Not verified yet', description: 'TXT record not found — DNS changes can take a few minutes to propagate.' });
      }
    } catch {
      toast({ title: 'Error', description: 'Verification check failed', variant: 'destructive' });
    } finally {
      setChecking(false);
    }
  };

  // Stay on setup until the site has been added and its first events arrive
  useEffect(() => {
    let cancelled = false;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/analytics/overview?siteId=${siteId}&range=7d`, { credentials: 'include' });
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (json.totalEvents > 0) router.refresh();
      } catch {}
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [siteId, router]);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="px-3 md:px-4 max-w-[1200px] w-full mx-auto py-6 space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.16em] text-rose-400 font-medium">Overview</p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-slate-100 truncate max-w-[420px]">{domain}</h1>
        </div>
        {status === 'verified' ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 mono text-[11px] font-medium text-teal-400">
            <span className="size-1.5 rounded-full bg-teal-400 animate-pulse" /> Verified — waiting for first event
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 mono text-[11px] font-medium text-rose-400">
            <span className="size-1.5 rounded-full bg-rose-400 animate-pulse" /> Waiting to verify
          </span>
        )}
      </header>

      <div className={PANEL}>
        <PanelHeader title="Site setup" />
        <div className="p-5 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 grid place-items-center text-[10px] font-semibold mono">1</span>
              <MicroLabel>Add the tracking script</MicroLabel>
            </div>
            <p className="mt-2 text-[13px] leading-6 text-slate-400 max-w-[640px]">
              Paste this into the <span className="mono text-slate-300">{`<head>`}</span> of every page on{' '}
              <span className="text-slate-300">{domain}</span>. Pageviews, outbound clicks, and SPA navigation are tracked automatically.
            </p>
            <div className="mt-3 rounded-xl overflow-hidden border border-white/[0.08] bg-[#0b0d12]">
              <div className="h-8 flex items-center justify-between px-3 border-b border-white/[0.06] bg-white/[0.02]">
                <span className="mono text-[10px] text-slate-500">HTML</span>
                <button
                  onClick={() => copy(snippet, 'snippet')}
                  className="inline-flex items-center gap-1 mono text-[10px] text-slate-400 hover:text-slate-100 transition"
                >
                  {copied === 'snippet' ? <Check className="size-3 text-teal-400" /> : <Copy className="size-3" />}
                  {copied === 'snippet' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="mono text-[12px] leading-5 p-4 text-slate-300 overflow-x-auto">{snippet}</pre>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="size-5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 grid place-items-center text-[10px] font-semibold mono">2</span>
              <MicroLabel>Verify your domain — optional</MicroLabel>
            </div>
            <p className="mt-2 text-[13px] leading-6 text-slate-400 max-w-[640px]">
              Prove ownership by adding this TXT record at your domain's apex. Verification is not required to collect data.
            </p>
            {record ? (
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                <code className="flex-1 min-w-0 rounded-lg border border-white/[0.08] bg-[#0b0d12] px-3 py-2.5 mono text-[12px] text-slate-300 truncate">{record}</code>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => copy(record, 'record')}>
                    {copied === 'record' ? <Check className="size-3.5 text-teal-400" /> : <Copy className="size-3.5" />}
                    {copied === 'record' ? 'Copied' : 'Copy record'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={checkVerification} disabled={checking || status === 'loading'}>
                    <RefreshCw className={`size-3.5 ${checking ? 'animate-spin' : ''}`} />
                    {checking ? 'Checking…' : 'Check now'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-slate-500">
                {status === 'unknown' ? 'Verification record unavailable for this site.' : 'Generating verification record…'}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5 flex items-start gap-2.5">
            <span className="mt-1 size-1.5 rounded-full bg-rose-400 animate-pulse shrink-0" />
            <p className="text-[12px] leading-5 text-slate-500">
              This page is holding your place. The moment the first event arrives from your site, your dashboard will load automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
