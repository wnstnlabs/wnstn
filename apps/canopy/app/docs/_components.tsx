import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Shared building blocks for the /docs pages.
 * Server components only — no state, no event handlers.
 */

export function DocsShell({
  headerRight,
  children,
}: {
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050507] text-slate-200">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 dark-grid opacity-[0.12]" />
        <div className="absolute inset-0 radial-vignette" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#050507]/70 backdrop-blur-xl">
        <div className="mx-auto max-w-[1160px] px-6 h-[56px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="size-7 rounded-md bg-rose-500 text-white grid place-items-center text-[12px] font-semibold shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_8px_rgba(251,113,133,0.35)]">◈</span>
            <span className="font-semibold tracking-tight text-sm text-slate-100">canopy</span>
          </Link>
          <div className="flex items-center gap-3">
            {headerRight ?? (
              <>
                <Link href="/docs" className="mono text-[12px] text-slate-400 hover:text-slate-100">← Docs</Link>
                <Link href="/dashboard" className="rounded-md bg-rose-500 text-white px-4 py-[7px] text-[12px] font-medium hover:bg-rose-400 transition shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]">Dashboard</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-6 py-16">{children}</main>
    </div>
  );
}

export function PageTitle({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em] leading-[1] text-slate-100">{title}</h1>
      <p className="mt-4 text-[15px] leading-7 text-slate-400 max-w-[640px]">{children}</p>
    </div>
  );
}

export function Section({ n, id, title, children }: { n?: string; id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id}>
      <h2 className="text-[20px] font-semibold tracking-tight text-slate-100 flex items-center gap-2">
        {n != null && (
          <span className="size-7 rounded-md bg-rose-500 text-white grid place-items-center text-[14px] font-semibold shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]">{n}</span>
        )}
        {title}
      </h2>
      {children}
    </section>
  );
}

export function P({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`mt-3 text-[14px] leading-6 text-slate-400 ${className}`}>{children}</p>;
}

export function C({ children }: { children: ReactNode }) {
  return <code className="bg-white/[0.06] border border-white/[0.06] px-1.5 py-0.5 rounded text-slate-300">{children}</code>;
}

export function Sub({ id, children }: { id?: string; children: ReactNode }) {
  return <h3 id={id} className="mt-4 mono text-[11px] tracking-widest text-slate-500 uppercase">{children}</h3>;
}

export function CodeWindow({
  label,
  badge,
  tone = 'teal',
  code,
  className = '',
}: {
  label?: string;
  badge?: string;
  tone?: 'teal' | 'muted';
  code: string;
  className?: string;
}) {
  return (
    <div className={`mt-4 rounded-xl overflow-hidden border border-white/[0.08] bg-[#0d1017] shadow-[0_1px_2px_rgba(0,0,0,0.45)] ${className}`}>
      {(label || badge) && (
        <div className="h-8 flex items-center justify-between px-3 border-b border-white/[0.06] bg-white/[0.02]">
          <span className="mono text-[10px] text-slate-500">{label}</span>
          {badge && <span className={`mono text-[10px] ${tone === 'teal' ? 'text-teal-400' : 'text-slate-600'}`}>{badge}</span>}
        </div>
      )}
      <pre className="mono text-[12px] leading-5 p-4 text-slate-300 overflow-x-auto">{code}</pre>
    </div>
  );
}

export function DataTable({
  columns,
  rows,
  firstColMono = true,
}: {
  columns: string[];
  rows: ReactNode[][];
  firstColMono?: boolean;
}) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-white/[0.08] text-slate-500">
            {columns.map((c) => (
              <th key={c} className="p-3 mono">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className={`p-3 align-top${j === 0 && firstColMono ? ' mono' : ''}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Callout({
  label,
  tone = 'slate',
  children,
}: {
  label: string;
  tone?: 'slate' | 'teal' | 'amber';
  children: ReactNode;
}) {
  const toneClass = tone === 'teal' ? 'text-teal-400' : tone === 'amber' ? 'text-amber-400' : 'text-slate-500';
  return (
    <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#12151d] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
      <div className={`mono text-[11px] tracking-widest uppercase ${toneClass}`}>{label}</div>
      <div className="mt-2 text-[14px] leading-6 text-slate-400">{children}</div>
    </div>
  );
}

export function CTA({
  title,
  children,
  primary = { href: '/onboarding', label: 'Create your site' },
  secondary,
}: {
  title: string;
  children: ReactNode;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <div className="mt-16 rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#171b25] to-[#0d1017] p-8 md:p-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
      <h2 className="text-[22px] md:text-[26px] font-semibold tracking-[-0.02em] text-slate-100">{title}</h2>
      <div className="mt-2 text-[14px] text-slate-400">{children}</div>
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href={primary.href} className="rounded-md bg-rose-500 text-white px-6 py-3 text-sm font-medium hover:bg-rose-400 transition shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]">{primary.label}</Link>
        {secondary && (
          <Link href={secondary.href} className="rounded-md border border-white/[0.12] px-6 py-3 text-sm mono text-slate-300 hover:bg-white/[0.06]">{secondary.label}</Link>
        )}
      </div>
    </div>
  );
}
