'use client';

import { useState } from 'react';
import Link from 'next/link';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="size-9 grid place-items-center rounded-xl border border-white/[0.08] bg-white/[0.06] text-white"
      >
        ☰
      </button>
      {open && (
        <div className="fixed inset-0 z-40">
          <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Close" />
          <div className="absolute right-0 top-0 h-full w-[82%] max-w-[320px] bg-[#0d1017] border-l border-white/[0.08] p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold text-white"><span className="size-7 rounded-md bg-rose-500 text-white grid place-items-center text-[12px] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_8px_rgba(251,113,133,0.35)]">◈</span> canopy</span>
              <button onClick={() => setOpen(false)} className="size-8 grid place-items-center rounded-lg border border-white/[0.08] text-slate-400">✕</button>
            </div>
            <nav className="mt-8 space-y-1">
              <Link href="#features" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-slate-100">Features</Link>
              <Link href="#install" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-slate-100">Install</Link>
              <Link href="#privacy" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-slate-100">Privacy</Link>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="block rounded-xl bg-rose-500 text-white px-3 py-3 text-sm font-medium shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]">Dashboard →</Link>
              <Link href="/login" onClick={() => setOpen(false)} className="block rounded-xl border border-white/[0.08] px-3 py-3 text-sm text-slate-300 text-center">Log in</Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
