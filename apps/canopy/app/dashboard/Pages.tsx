'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatNumber, formatRelativeTime } from '@/lib/utils';
import { exportAnalytics } from '@/lib/utils/export';
import { BarChartComponent } from '@/components/charts/Charts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Download, Search, ExternalLink } from 'lucide-react';
import { PANEL, PanelHeader } from '@/components/dashboard/parts';

interface TopPagesData {
  data: Array<{ key: string; count: number; percentage: number }>;
  total: number;
}

interface PaginatedEventsData {
  events: Array<{
    id: string;
    name: string;
    path: string;
    referrer: string;
    title: string;
    country: string;
    createdAt: string;
  }>;
  total: number;
  limit: number;
  offset: number;
}

export function DashboardPages({ siteId }: { siteId: string }) {
  const searchParams = useSearchParams();
  const [range, setRange] = useState(searchParams.get('range') || '7d');
  const [pagesData, setPagesData] = useState<TopPagesData | null>(null);
  const [eventsData, setEventsData] = useState<PaginatedEventsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pagesRes, eventsRes] = await Promise.all([
        fetch(`/api/analytics/top-pages?siteId=${siteId}&range=${range}&limit=50`, { credentials: "include" }),
        fetch(`/api/analytics/events?siteId=${siteId}&range=${range}&eventName=pageview&limit=50&offset=0`, { credentials: "include" }),
      ]);

      if (pagesRes.ok) {
        const pages = await pagesRes.json();
        setPagesData(pages);
      }
      if (eventsRes.ok) {
        const events = await eventsRes.json();
        setEventsData(events);
      }
    } catch (e) {
      console.error('Failed to fetch pages data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [siteId, range]);

  const data = pagesData?.data || [];
  const events = eventsData?.events || [];
  const totalEvents = eventsData?.total || 0;
  const totalPages = pagesData?.total || 0;

  if (loading && !pagesData) {
    return (
      <div className="px-3 md:px-4 max-w-[1200px] w-full mx-auto py-6 space-y-4">
        <div className="h-12 w-48 bg-white/[0.05] rounded" />
        <div className="h-80 rounded-xl border border-white/[0.08] bg-[#12151d] animate-pulse" />
        <div className="h-64 rounded-xl border border-white/[0.08] bg-[#12151d] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-3 md:px-4 max-w-[1200px] w-full mx-auto py-6 space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.16em] text-rose-400 font-medium">Pages</p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-slate-100">Top pages & events</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={(v) => setRange(v)}>
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
          <Button variant="outline" size="sm" onClick={() => exportAnalytics({ siteId, range, format: 'csv', eventName: 'pageview' })}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-5">
        <div className={`${PANEL} xl:col-span-2 flex flex-col`}>
          <PanelHeader title="Pageviews by Path" />
          <div className="p-4 flex-1">
            <BarChartComponent data={data} height={360} maxBars={12} horizontal={true} />
          </div>
        </div>

        <div className={`${PANEL} xl:col-span-3`}>
          <PanelHeader
            title={`All Pages · ${formatNumber(totalPages)}`}
            right={
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                <Input
                  placeholder="Search paths..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-56 h-8 pl-8 text-xs"
                />
              </div>
            }
          />
          <div className="p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead className="text-right w-24">Views</TableHead>
                  <TableHead className="text-right w-24">Share</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data
                  .filter((d) => d.key.toLowerCase().includes(search.toLowerCase()))
                  .map((item, index) => (
                    <TableRow key={item.key}>
                      <TableCell className="mono text-[11px] text-slate-600">{index + 1}</TableCell>
                      <TableCell className="mono text-[13px] truncate max-w-[380px] text-slate-100">
                        {item.key}
                      </TableCell>
                      <TableCell className="text-right mono text-[12.5px] tabular text-slate-300">
                        {formatNumber(item.count)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="mono text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-md px-1.5 py-0.5 tabular">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <a
                          href={item.key.startsWith('http') ? item.key : `https://${item.key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-600 hover:text-slate-200 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-[13px] text-slate-600">
                      No page data available for this period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className={PANEL}>
        <PanelHeader
          title="Recent Pageviews"
          right={<span className="mono text-[10px] text-slate-600 tabular">{formatNumber(totalEvents)} total</span>}
        />
        <div className="p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Time</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Referrer</TableHead>
                <TableHead className="w-24">Country</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events
                .filter((e) =>
                  e.path.toLowerCase().includes(search.toLowerCase()) ||
                  e.title?.toLowerCase().includes(search.toLowerCase())
                )
                .slice(0, 15)
                .map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="mono text-[11px] text-slate-500">
                      {formatRelativeTime(event.createdAt)}
                    </TableCell>
                    <TableCell className="mono text-[12.5px] truncate max-w-[220px] text-slate-100">
                      {event.path || '/'}
                    </TableCell>
                    <TableCell className="text-[12.5px] truncate max-w-[200px] text-slate-400">
                      {event.title || '—'}
                    </TableCell>
                    <TableCell className="text-[12.5px] truncate max-w-[180px] text-slate-400">
                      {event.referrer || 'Direct'}
                    </TableCell>
                    <TableCell>
                      <span className="mono text-[11px] text-slate-400 bg-white/[0.05] border border-white/[0.06] rounded-md px-1.5 py-0.5">
                        {event.country || '??'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              {events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-[13px] text-slate-600">
                    No events found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalEvents > 50 && (
          <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
            <p className="text-xs text-slate-500 mono">
              Showing {Math.min(50, totalEvents)} of {formatNumber(totalEvents)}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page * 50 >= totalEvents} onClick={() => setPage(p => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
