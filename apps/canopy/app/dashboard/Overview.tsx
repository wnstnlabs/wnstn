'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatNumber, formatDuration } from '@/lib/utils';
import { exportAnalytics } from '@/lib/utils/export';
import { TimeSeriesChart } from '@/components/charts/Charts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';
import { PANEL, PanelHeader, StatCell, ListPanel, Sparkline } from '@/components/dashboard/parts';
import { SetupRequired } from './SetupRequired';

interface OverviewData {
  totalEvents: number;
  totalPageviews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ key: string; count: number; percentage: number }>;
  topReferrers: Array<{ key: string; count: number; percentage: number }>;
  topCountries: Array<{ key: string; count: number; percentage: number }>;
  timeSeries: Array<{ timestamp: string; value: number; label: string }>;
}

interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  label: string;
}

export function DashboardOverview({ siteId, domain, hasData }: { siteId: string; domain: string; hasData: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [range, setRange] = useState(searchParams.get('range') || '7d');
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, tsRes] = await Promise.all([
        fetch(`/api/analytics/overview?siteId=${siteId}&range=${range}`, { credentials: 'include' }),
        fetch(`/api/analytics/timeseries?siteId=${siteId}&range=${range}`, { credentials: 'include' }),
      ]);

      if (!overviewRes.ok) throw new Error('Failed to fetch overview');
      if (!tsRes.ok) throw new Error('Failed to fetch time series');

      const overview = await overviewRes.json();
      const ts = await tsRes.json();

      setOverviewData(overview);
      setTimeSeriesData(ts.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasData) return;
    fetchData();
  }, [siteId, range, hasData]);

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
    const params = new URLSearchParams(searchParams);
    params.set('range', newRange);
    router.push(`/dashboard?site=${siteId}&${params.toString()}`);
  };

  const rangeLabel =
    range === '1h' ? 'Last hour' : range === '24h' ? 'Last 24 hours' : range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days';

  // No domain connected yet — hold on setup instructions until the site is added
  if (!hasData) {
    return <SetupRequired siteId={siteId} domain={domain} />;
  }

  if (loading && !overviewData) {
    return (
      <div className="px-3 md:px-4 max-w-[1200px] w-full mx-auto py-6 space-y-4">
        <div className="h-12 w-56 bg-white/[0.05] rounded" />
        <div className="h-[104px] rounded-xl border border-white/[0.08] bg-[#12151d] animate-pulse" />
        <div className="h-[68px] rounded-xl border border-white/[0.08] bg-[#12151d] animate-pulse" />
        <div className="h-[280px] rounded-xl border border-white/[0.08] bg-[#12151d] animate-pulse" />
        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl border border-white/[0.08] bg-[#12151d] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 md:px-4 max-w-[1200px] w-full mx-auto py-6">
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4 flex items-center gap-3">
          <p className="text-sm text-red-400 flex-1">{error}</p>
          <Button onClick={fetchData} variant="outline" size="sm">Retry</Button>
        </div>
      </div>
    );
  }

  const data = overviewData!;
  const ts = timeSeriesData!;

  return (
    <div className="px-3 md:px-4 max-w-[1200px] w-full mx-auto py-6 space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.16em] text-rose-400 font-medium">Overview</p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-slate-100 truncate max-w-[420px]">{siteId}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={handleRangeChange}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last hour</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => exportAnalytics({ siteId, range, format: 'csv' })}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </header>

      <div className={`${PANEL} p-5 flex flex-col md:flex-row md:items-center gap-5`}>
        <div className="shrink-0">
          <p className="mono text-[10px] font-medium text-slate-500 uppercase tracking-[0.14em]">Pageviews · {rangeLabel}</p>
          <p className="mt-1 text-5xl font-semibold tabular tracking-tight text-slate-100 leading-none">{formatNumber(data.totalPageviews)}</p>
          <p className="mt-2 text-xs text-slate-500">
            {formatNumber(data.uniqueVisitors)} unique visitors · {data.bounceRate.toFixed(1)}% bounce
          </p>
        </div>
        <Sparkline data={ts} color="#fb7185" className="flex-1 min-w-0 h-[64px]" />
      </div>

      <div className={`${PANEL} grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]`}>
        <StatCell label="Total Events" value={formatNumber(data.totalEvents)} />
        <StatCell label="Unique Visitors" value={formatNumber(data.uniqueVisitors)} />
        <StatCell label="Bounce Rate" value={`${data.bounceRate.toFixed(1)}%`} />
        <StatCell label="Avg Session" value={formatDuration(data.avgSessionDuration)} />
      </div>

      <div className={PANEL}>
        <PanelHeader title={`Traffic · ${rangeLabel}`} />
        <div className="p-4">
          <TimeSeriesChart data={ts} height={280} color="#fb7185" showArea={true} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ListPanel title="Top Pages" items={data.topPages} accent="#fb7185" />
        <ListPanel title="Top Referrers" items={data.topReferrers} accent="#fb7185" />
        <ListPanel title="Top Countries" items={data.topCountries} accent="#2dd4bf" />
      </div>
    </div>
  );
}
