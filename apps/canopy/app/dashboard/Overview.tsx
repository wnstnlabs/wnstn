'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatNumber, formatRelativeTime, formatDuration, cn } from '@/lib/utils';
import { exportAnalytics } from '@/lib/utils/export';
import {
  TimeSeriesChart,
  BarChartComponent,
  PieChartComponent,
  MetricCard,
  StatGrid,
} from '@/components/charts/Charts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  MousePointer,
  Clock,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

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

export function DashboardOverview({ siteId }: { siteId: string }) {
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
    fetchData();
  }, [siteId, range]);

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
    const params = new URLSearchParams(searchParams);
    params.set('range', newRange);
    router.push(`/dashboard?site=${siteId}&${params.toString()}`);
  };

  const formatMetric = (num: number) => formatNumber(num, { compact: true });
  const formatDurationMs = (ms: number) => formatDuration(ms);

  if (loading && !overviewData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Overview</h1>
            <p className="text-zinc-500 mt-1">Loading analytics...</p>
          </div>
        </div>
        <StatGrid columns={4}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 animate-pulse">
              <div className="h-4 w-20 bg-white/10 rounded mb-2" />
              <div className="h-8 w-32 bg-white/10 rounded" />
            </div>
          ))}
        </StatGrid>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
            <Button onClick={fetchData} variant="outline" size="sm">Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = overviewData!;
  const tsData = timeSeriesData!;

  return (
    <div className="space-y-6">
      {/* Header with range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Overview</h1>
          <p className="text-zinc-500 mt-1">
            {siteId} • {range === '1h' ? 'Last hour' : range === '24h' ? 'Last 24 hours' : range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={handleRangeChange}>
            <SelectTrigger className="w-[180px]">
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
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <StatGrid columns={4}>
        <MetricCard
          title="Total Events"
          value={formatMetric(data.totalEvents)}
          icon={<MousePointer className="h-6 w-6" />}
          trend="up"
        />
        <MetricCard
          title="Pageviews"
          value={formatMetric(data.totalPageviews)}
          icon={<ArrowUpRight className="h-6 w-6" />}
          trend="up"
        />
        <MetricCard
          title="Unique Visitors"
          value={formatMetric(data.uniqueVisitors)}
          icon={<Users className="h-6 w-6" />}
          trend="up"
        />
        <MetricCard
          title="Bounce Rate"
          value={`${data.bounceRate.toFixed(1)}%`}
          icon={<ArrowDownRight className="h-6 w-6" />}
          trend={data.bounceRate > 50 ? 'down' : 'up'}
        />
        <MetricCard
          title="Avg Session"
          value={formatDurationMs(data.avgSessionDuration)}
          icon={<Clock className="h-6 w-6" />}
        />
        <MetricCard
          title="Events/Visitor"
          value={data.uniqueVisitors > 0 ? (data.totalEvents / data.uniqueVisitors).toFixed(1) : '0'}
          icon={<Share2 className="h-6 w-6" />}
        />
      </StatGrid>

      {/* Time Series Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Traffic Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeSeriesChart
            data={tsData}
            height={300}
            color="#3b82f6"
            showArea={true}
          />
        </CardContent>
      </Card>

      {/* Breakdown Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={data.topPages}
              height={300}
              maxBars={10}
              horizontal={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartComponent
              data={data.topReferrers}
              height={300}
              maxSlices={6}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={data.topCountries}
              height={300}
              maxBars={10}
              horizontal={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Events Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartComponent
              data={[
                { key: 'Pageviews', count: data.totalPageviews, percentage: 0 },
                { key: 'Other Events', count: data.totalEvents - data.totalPageviews, percentage: 0 },
              ]}
              height={300}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}