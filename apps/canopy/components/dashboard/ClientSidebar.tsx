'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Site {
  id: string;
  domain: string;
  name: string;
  organizationId: string | null;
  createdAt: string;
  public: boolean;
  verificationRecord: string | null;
  verified: boolean;
  verifiedAt: string | null;
}

export function ClientSidebar({
  activeId,
  initialSites
}: {
  activeId: string | null;
  initialSites: Site[];
}) {
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [adding, setAdding] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Refetch when activeId changes (workspace switch)
    fetchSites();
  }, [activeId]);

  const fetchSites = async () => {
    try {
      const res = await fetch('/api/sites');
      if (res.ok) {
        const data = await res.json();
        setSites(data);
      }
    } catch (e) {
      console.error('Failed to fetch sites:', e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newDomain.trim()) return;

    const domainRaw = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
    if (!domainRaw.includes('.')) {
      setError('Invalid domain');
      return;
    }

    setAdding(true);
    const formData = new FormData();
    formData.append('domain', domainRaw);

    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to create site');
        return;
      }
      // Optimistic update - refetch to get the new site with correct ID
      await fetchSites();
      const id = `canopy_${domainRaw.replace(/[^a-z0-9]/g, '_')}`;
      router.push(`/dashboard?site=${encodeURIComponent(id)}`);
      router.refresh();
    } catch (e) {
      setError('Failed to create site');
    } finally {
      setAdding(false);
    }
  };

  const filteredSites = activeId 
    ? sites.filter((s) => s.organizationId === activeId)
    : sites;

  return (
    <div>
      {filteredSites.length === 0 ? (
        <div className="rounded-md border border-dashed border-white/[0.08] bg-[#0d1017] px-3 py-4 text-center">
          <div className="mono text-[11px] text-slate-500">No sites yet</div>
          <div className="mono text-[10px] text-slate-700 mt-1">Add one below</div>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredSites.map((s) => (
            <Link
              key={s.id}
              href={`/dashboard?site=${encodeURIComponent(s.id)}`}
              className="group flex items-center gap-2.5 rounded-md border border-white/[0.06] bg-[#12151d] hover:border-white/[0.14] px-2 py-1.5 transition"
            >
              <span className="size-6 rounded bg-white/[0.05] border border-white/[0.06] mono text-[9px] grid place-items-center text-slate-400 group-hover:text-rose-300 transition shrink-0">{s.domain.slice(0,2).toUpperCase()}</span>
              <span className="truncate mono text-[12px] tracking-tight flex-1 text-slate-300 group-hover:text-slate-100 transition">{s.domain}</span>
              <span className="size-1.5 rounded-full shrink-0 bg-slate-700 group-hover:bg-rose-400 transition" />
            </Link>
          ))}
        </div>
      )}

      <form onSubmit={handleCreate} className="mt-2 flex gap-1.5">
        <input
          name="domain"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          placeholder="newdomain.com"
          required
          disabled={adding}
          className="flex-1 min-w-0 rounded-md bg-[#0d1017] border border-white/[0.09] px-2.5 py-1.5 text-[12px] mono text-slate-200 placeholder:text-slate-600 outline-none focus:border-rose-400/40 focus:ring-2 focus:ring-rose-500/15 transition disabled:opacity-50"
        />
        <button type="submit" disabled={adding} className="rounded-md bg-rose-500 text-white px-3 py-1.5 text-[12px] font-medium hover:bg-rose-400 transition shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] disabled:opacity-50">
          {adding ? '…' : '+'}
        </button>
      </form>
      {error && <p className="mt-2 text-[11px] text-red-400 mono">{error}</p>}
    </div>
  );
}