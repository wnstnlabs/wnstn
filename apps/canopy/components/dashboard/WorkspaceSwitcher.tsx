'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

type Org = { id: string; name: string; slug: string };

export function WorkspaceSwitcher({ orgs, activeId, activeName }: { orgs: Org[]; activeId: string | null; activeName: string }) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const router = useRouter();

  const setActive = async (id: string) => {
    setOpen(false);
    try {
      await (authClient as any).organization.setActive({ organizationId: id });
    } catch {}
    // After switching workspace, redirect to dashboard without site param
    // so server picks the first site in the new workspace
    router.push('/dashboard');
    router.refresh();
  };

  const createWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res: any = await (authClient as any).organization.create({ name: newName.trim(), slug: newName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).slice(2, 6) });
      if (res?.data?.id) await (authClient as any).organization.setActive({ organizationId: res.data.id });
    } catch {}
    setCreating(false);
    setNewName('');
    setOpen(false);
    router.push('/dashboard');
    router.refresh();
  };

  if (orgs.length === 0) {
    return (
      <div className="w-full flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-2.5">
        <span className="size-8 rounded-lg bg-white text-zinc-900 grid place-items-center font-semibold text-[12px] shrink-0">{activeName.slice(0,1).toUpperCase()}</span>
        <span className="min-w-0 flex-1"><span className="block text-[13px] font-medium text-white leading-none truncate">{activeName}</span><span className="block mono text-[10px] text-zinc-500 leading-none truncate mt-1">Workspace</span></span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05] px-2.5 py-2.5 text-left transition">
        <span className="size-8 rounded-lg bg-white text-zinc-900 grid place-items-center font-semibold text-[12px] shrink-0">{activeName.slice(0,1).toUpperCase()}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-medium text-white leading-none truncate">{activeName}</span>
          <span className="block mono text-[10px] text-zinc-500 leading-none truncate mt-1">{orgs.length} workspaces • click to switch</span>
        </span>
        <span className="text-zinc-500 text-xs">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="absolute z-20 top-full mt-2 w-full rounded-xl border border-white/[0.08] bg-[#111113] shadow-[0_16px_32px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="max-h-[220px] overflow-auto p-1.5 space-y-1">
            {orgs.map((o) => (
              <button
                key={o.id}
                onClick={() => setActive(o.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition ${activeId === o.id ? 'bg-white text-zinc-900' : 'hover:bg-white/[0.06] text-zinc-300'}`}
              >
                <span className={`size-7 rounded-lg grid place-items-center text-[11px] font-semibold shrink-0 ${activeId === o.id ? 'bg-zinc-900 text-white' : 'bg-white/[0.08] text-zinc-300'}`}>{o.name.slice(0,2).toUpperCase()}</span>
                <span className="flex-1 min-w-0">
                  <span className={`block text-[13px] leading-none truncate ${activeId === o.id ? 'text-zinc-900 font-medium' : 'text-white'}`}>{o.name}</span>
                  <span className={`block mono text-[10px] truncate ${activeId === o.id ? 'text-zinc-600' : 'text-zinc-500'}`}>{o.slug}</span>
                </span>
                {activeId === o.id && <span className="size-1.5 rounded-full bg-emerald-500" />}
              </button>
            ))}
          </div>

          <form onSubmit={createWorkspace} className="p-2 border-t border-white/[0.06] flex gap-1.5">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New workspace name" className="flex-1 min-w-0 rounded-lg bg-white/[0.06] border border-white/[0.08] px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-white/20" />
            <button type="submit" disabled={creating} className="rounded-lg bg-white text-zinc-900 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 disabled:opacity-50">Create</button>
          </form>
        </div>
      )}
    </div>
  );
}
