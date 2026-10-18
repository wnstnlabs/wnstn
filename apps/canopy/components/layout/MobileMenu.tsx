'use client';

import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/DropdownMenu';

export function MobileMenu() {
  const router = useRouter();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Open menu"
            className="size-9 grid place-items-center rounded-xl border border-white/[0.08] bg-white/[0.06] text-white"
          >
            ☰
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={10} className="min-w-[200px] rounded-xl border-white/[0.08] bg-[#12151d] p-1.5">
          <DropdownMenuItem onSelect={() => scrollTo('features')} className="cursor-pointer rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-slate-100 focus:bg-white/[0.06] focus:text-slate-100">
            Features
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => scrollTo('install')} className="cursor-pointer rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-slate-100 focus:bg-white/[0.06] focus:text-slate-100">
            Install
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => scrollTo('privacy')} className="cursor-pointer rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-slate-100 focus:bg-white/[0.06] focus:text-slate-100">
            Privacy
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1.5 bg-white/[0.08]" />
          <DropdownMenuItem onSelect={() => router.push('/dashboard')} className="cursor-pointer rounded-xl bg-rose-500 px-3 py-3 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-rose-400 focus:bg-rose-500">
            Dashboard →
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push('/login')} className="mt-1 cursor-pointer justify-center rounded-xl border border-white/[0.08] px-3 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-slate-100 focus:bg-white/[0.06] focus:text-slate-100">
            Log in
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
