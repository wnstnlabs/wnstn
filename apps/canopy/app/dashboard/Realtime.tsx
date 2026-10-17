'use client';

import { useState, useEffect } from 'react';
import { formatRelativeTime } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Globe, Activity } from 'lucide-react';
import { PANEL, PanelHeader, Sparkline } from '@/components/dashboard/parts';

interface RealtimeData {
  activeVisitors: number;
  pageviewsPerMinute: number;
  eventsPerMinute: number;
  topActivePages: Array<{ key: string; count: number; percentage: number }>;
  recentEvents: Array<{
    id: string;
    name: string;
    path: string;
    country?: string;
    timestamp: string;
  }>;
}

export function DashboardRealtime({ siteId }: { siteId: string }) {
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [windowSize, setWindowSize] = useState(60);
  const [history, setHistory] = useState<Array<{ value: number }>>([]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/analytics/realtime?siteId=${siteId}&window=${windowSize}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setRealtimeData(data);
        setHistory(prev => [...prev.slice(-40), { value: data.activeVisitors }]);
      }
    } catch (e) {
      console.error('Failed to fetch realtime data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [siteId, windowSize]);

  if (loading && !realtimeData) {
    return (
      <div className="px-3 md:px-4 max-w-[1200px] w-full mx-auto py-6 space-y-4">
        <div className="h-12 w-48 bg-white/[0.05] rounded" />
        <div className="h-[112px] rounded-xl border border-white/[0.08] bg-[#12151d] animate-pulse" />
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-80 rounded-xl border border-white/[0.08] bg-[#12151d] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const data = realtimeData!;

  return (
    <div className="px-3 md:px-4 max-w-[1200px] w-full mx-auto py-6 space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.16em] text-rose-400 font-medium">Realtime</p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-slate-100">Live visitors right now</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-500/10 border border-teal-500/20 px-2 py-1 mono text-[11px] font-medium text-teal-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            LIVE
          </span>
          <Select value={String(windowSize)} onValueChange={(v) => setWindowSize(Number(v))}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Time window" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">1 minute</SelectItem>
              <SelectItem value="120">2 minutes</SelectItem>
              <SelectItem value="300">5 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className={`${PANEL} p-5 flex flex-col md:flex-row md:items-center gap-5`}>
        <div className="shrink-0">
          <p className="mono text-[10px] font-medium text-slate-500 uppercase tracking-[0.14em]">Active now · {windowSize}s window</p>
          <p className="mt-1 text-5xl font-semibold tabular tracking-tight text-slate-100 leading-none">{data.activeVisitors}</p>
          <p className="mt-2 text-xs text-slate-500">
            <span className="text-rose-400 mono">{data.pageviewsPerMinute.toFixed(1)}</span> pageviews/min ·{' '}
            <span className="text-amber-400 mono">{data.eventsPerMinute.toFixed(1)}</span> events/min
          </p>
        </div>
        <Sparkline data={history} color="#2dd4bf" className="flex-1 min-w-0 h-[72px]" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={PANEL}>
          <PanelHeader
            title="Top Active Pages"
            right={<span className="mono text-[10px] text-slate-600 tabular">{data.topActivePages.length}</span>}
          />
          <div className="p-3 space-y-1.5">
            {data.topActivePages.length > 0 ? (
              data.topActivePages.map((page, index) => (
                <div key={page.key} className="px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition">
                  <div className="flex items-center gap-2.5">
                    <span className="mono text-[10px] text-slate-600 w-4 tabular">{index + 1}</span>
                    <p className="flex-1 min-w-0 mono text-[12.5px] truncate text-slate-100">{page.key}</p>
                    <span className="mono text-[11px] tabular text-slate-400">{page.count}</span>
                  </div>
                  <div className="mt-1 ml-6 h-[3px] rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-400"
                      style={{ width: `${Math.min(page.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-[13px] text-slate-600 py-10">No active pages</p>
            )}
          </div>
        </div>

        <div className={PANEL}>
          <PanelHeader
            title="Live Event Stream"
            right={
              <span className="flex items-center gap-1.5 mono text-[10px] text-teal-400">
                <Activity className="h-3 w-3" /> streaming
              </span>
            }
          />
          <div className="p-2 space-y-0.5 max-h-[380px] overflow-y-auto">
            {data.recentEvents.length > 0 ? (
              data.recentEvents.slice(0, 25).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <span className="shrink-0 w-16 text-right mono text-[10px] text-slate-600">
                    {formatRelativeTime(event.timestamp)}
                  </span>
                  <span className={`shrink-0 mono text-[10px] rounded-md px-1.5 py-0.5 border ${
                    event.name === 'pageview'
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                      : 'bg-white/[0.05] text-slate-400 border-white/[0.06]'
                  }`}>
                    {event.name}
                  </span>
                  <span className="flex-1 min-w-0 mono text-[12.5px] truncate text-slate-100">
                    {event.path || '/'}
                  </span>
                  {event.country && (
                    <span className="shrink-0 mono text-[10px] text-slate-400 bg-white/[0.05] border border-white/[0.06] rounded-md px-1.5 py-0.5 flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {event.country}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-[13px] text-slate-600 py-10">No recent events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
