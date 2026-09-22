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
  orgs, 
  activeName,
  initialSites 
}: { 
  activeId: string | null;
  orgs: { id: string; name: string; slug: string }[];
  activeName: string;
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
    <aside className="flex-1 overflow-y-auto px-3 pt-5 space-y-6">
      <div>
        <div className="flex items-center justify-between px-2.5">
          <span className="mono text-[11px] tracking-[0.14em] text-zinc-500 uppercase font-medium">Sites</span>
          <span className="mono text-[11px] text-zinc-600 tabular">{sites.length}</span>
        </div>
        <div className="mt-2.5 space-y-1">
          {filteredSites.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.07] bg-white/[0.02] px-3 py-4 text-center">
              <div className="mono text-[12px] text-zinc-400">No sites yet</div>
              <div className="mono text-[11px] text-zinc-600 mt-1">Add one below</div>
            </div>
          ) : (
            filteredSites.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard?site=${encodeURIComponent(s.id)}`}
                className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] border text-zinc-400 border-transparent hover:bg-white/[0.05] hover:text-white hover:border-white/[0.06] transition"
              >
                <span className="size-7 rounded-lg grid place-items-center text-[11px] font-semibold mono shrink-0 border bg-white/[0.07] border-white/[0.08] text-zinc-300">{s.domain.slice(0,2).toUpperCase()}</span>
                <span className="truncate mono text-[13px] tracking-tight flex-1">{s.domain}</span>
                <span className="size-2 rounded-full shrink-0 bg-transparent group-hover:bg-white/20" />
              </Link>
            ))
          )}
        </div>

        <form onSubmit={handleCreate} className="mt-3 flex gap-1.5">
          <input
            name="domain"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="newdomain.com"
            required
            disabled={adding}
            className="flex-1 min-w-0 rounded-xl bg-[#111113] border border-white/[0.07] px-3 py-2.5 text-[13px] mono text-white placeholder:text-zinc-600 outline-none focus:border-white/15 focus:bg-[#161618] transition disabled:opacity-50"
          />
          <button type="submit" disabled={adding} className="rounded-xl bg-white text-zinc-900 px-4 py-2 text-[13px] font-semibold hover:bg-zinc-100 transition shadow-sm disabled:opacity-50">
            {adding ? 'Adding…' : 'Add'}
          </button>
        </form>
        {error && <p className="mt-2 text-xs text-red-400 mono">{error}</p>}
      </div>
    </aside>
  );
}