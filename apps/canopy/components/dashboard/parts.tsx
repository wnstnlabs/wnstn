'use client';

import * as React from 'react';
import { formatNumber } from '@/lib/utils';

export const PANEL =
  'rounded-xl border border-white/[0.08] bg-[#12151d] shadow-[0_1px_2px_rgba(0,0,0,0.45)]';

export function MicroLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`mono text-[10px] font-medium text-slate-500 uppercase tracking-[0.14em] ${className ?? ''}`}>
      {children}
    </p>
  );
}

export function PanelHeader({
  title,
  right,
  className,
}: {
  title: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-4 py-3 border-b border-white/[0.06] flex items-center justify-between gap-3 ${className ?? ''}`}>
      <MicroLabel>{title}</MicroLabel>
      {right}
    </div>
  );
}

export function StatCell({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="px-4 py-4">
      <MicroLabel>{label}</MicroLabel>
      <p className="mt-1.5 text-xl font-semibold tabular tracking-tight text-slate-100">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-slate-600">{sub}</p>}
    </div>
  );
}

export function ListPanel({
  title,
  items,
  accent,
  limit = 8,
}: {
  title: string;
  items: Array<{ key: string; count: number; percentage: number }>;
  accent: string;
  limit?: number;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className={PANEL}>
      <PanelHeader
        title={title}
        right={<span className="mono text-[10px] text-slate-600 tabular">{items.length}</span>}
      />
      <div className="p-2 space-y-0.5">
        {items.length === 0 ? (
          <p className="text-center text-[13px] text-slate-600 py-8">No data</p>
        ) : (
          items.slice(0, limit).map((item, i) => (
            <div key={item.key} className="px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition">
              <div className="flex items-center gap-2 text-[12.5px]">
                <span className="mono text-[10px] text-slate-600 w-4 tabular">{i + 1}</span>
                <span className="flex-1 min-w-0 truncate mono text-slate-300">{item.key}</span>
                <span className="mono text-[11px] tabular text-slate-400">{formatNumber(item.count)}</span>
              </div>
              <div className="mt-1 ml-6 h-[3px] rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(item.count / max) * 100}%`, background: accent }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function Sparkline({
  data,
  color = '#fb7185',
  className,
}: {
  data: Array<{ value: number }>;
  color?: string;
  className?: string;
}) {
  if (!data || data.length < 2) return <div className={className} />;
  const max = Math.max(...data.map((d) => d.value), 1);
  const points = data
    .map((d, i) => `${(i / (data.length - 1)) * 100},${28 - (d.value / max) * 24}`)
    .join(' ');
  return (
    <div className={className}>
      <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          points={points}
        />
      </svg>
    </div>
  );
}
