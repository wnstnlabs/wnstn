'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/DropdownMenu';

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
      <div className="w-full flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-[#0d1017] px-2.5 py-2">
        <span className="size-8 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/20 grid place-items-center font-semibold text-[12px] shrink-0">{activeName.slice(0,1).toUpperCase()}</span>
        <span className="min-w-0 flex-1"><span className="block text-[13px] font-medium text-slate-200 leading-none truncate">{activeName}</span><span className="block mono text-[10px] text-slate-600 leading-none truncate mt-1">Workspace</span></span>
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button type="button" className="w-full flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-[#0d1017] hover:bg-[#12151d] hover:border-white/[0.14] px-2.5 py-2 text-left transition outline-none">
          <span className="size-8 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/20 grid place-items-center font-semibold text-[12px] shrink-0">{activeName.slice(0,1).toUpperCase()}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-slate-200 leading-none truncate">{activeName}</span>
            <span className="block mono text-[10px] text-slate-600 leading-none truncate mt-1">{orgs.length} workspaces • click to switch</span>
          </span>
          <span className="text-slate-600 text-xs">{open ? '▴' : '▾'}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-[var(--radix-dropdown-menu-trigger-width,232px)] rounded-lg border-white/[0.09] bg-[#12151d] p-0 shadow-[0_8px_32px_rgba(0,0,0,0.55)]"
      >
        <div className="max-h-[220px] overflow-y-auto p-1.5 space-y-0.5">
          {orgs.map((o) => (
            <DropdownMenuItem
              key={o.id}
              onSelect={() => setActive(o.id)}
              className={`w-full items-center gap-2.5 px-2.5 py-2 text-left ${activeId === o.id ? 'bg-rose-500/10 text-rose-200' : 'text-slate-300 hover:bg-white/[0.05]'}`}
            >
              <span className={`size-7 rounded-md grid place-items-center text-[10px] font-semibold mono shrink-0 ${activeId === o.id ? 'bg-rose-500/20 text-rose-200 border border-rose-500/25' : 'bg-white/[0.06] text-slate-400 border border-white/[0.06]'}`}>{o.name.slice(0,2).toUpperCase()}</span>
              <span className="flex-1 min-w-0">
                <span className={`block text-[13px] leading-none truncate ${activeId === o.id ? 'text-rose-200 font-medium' : 'text-slate-200'}`}>{o.name}</span>
                <span className={`block mono text-[10px] truncate mt-0.5 ${activeId === o.id ? 'text-rose-400/60' : 'text-slate-600'}`}>{o.slug}</span>
              </span>
              {activeId === o.id && <span className="size-1.5 rounded-full bg-rose-400" />}
            </DropdownMenuItem>
          ))}
        </div>

        <form onSubmit={createWorkspace} className="p-2 border-t border-white/[0.06] flex gap-1.5">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New workspace name" className="flex-1 min-w-0 rounded-md bg-[#0d1017] border border-white/[0.09] px-2.5 py-1.5 text-[12px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-rose-400/40" />
          <button type="submit" disabled={creating} className="rounded-md bg-rose-500 text-white px-3 py-1.5 text-[12px] font-medium hover:bg-rose-400 disabled:opacity-50">Create</button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
