'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatNumber, formatRelativeTime } from '@/lib/utils';
import { exportAnalytics } from '@/lib/utils/export';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Download, Search } from 'lucide-react';
import { PANEL, PanelHeader, StatCell } from '@/components/dashboard/parts';

interface PaginatedEventsData {
  events: Array<{
    id: string;
    name: string;
    path: string;
    referrer: string;
    title: string;
    viewportW: number;
    props: Record<string, unknown>;
    sessionId: string;
    country: string;
    createdAt: string;
  }>;
  total: number;
  limit: number;
  offset: number;
}

export function DashboardEvents({ siteId }: { siteId: string }) {
  const searchParams = useSearchParams();
  const [range, setRange] = useState(searchParams.get('range') || '7d');
  const [eventName, setEventName] = useState(searchParams.get('eventName') || '');
  const [eventsData, setEventsData] = useState<PaginatedEventsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        siteId,
        range,
        limit: '100',
        offset: String((page - 1) * 100),
      });
      if (eventName) params.set('eventName', eventName);

      const res = await fetch(`/api/analytics/events?${params.toString()}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setEventsData(data);
      }
    } catch (e) {
      console.error('Failed to fetch events:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [siteId, range, eventName, page]);

  const events = eventsData?.events || [];
  const total = eventsData?.total || 0;
  const pageviews = events.filter((e) => e.name === 'pageview').length;

  if (loading && !eventsData) {
    return (
      <div className="px-3 md:px-4 max-w-[1200px] w-full mx-auto py-6 space-y-4">
        <div className="h-12 w-48 bg-white/[0.05] rounded" />
        <div className="h-[68px] rounded-xl border border-white/[0.08] bg-[#12151d] animate-pulse" />
        <div className="h-[420px] rounded-xl border border-white/[0.08] bg-[#12151d] animate-pulse" />
      </div>
    );
  }

  const uniqueEvents = [...new Set(events.map((e) => e.name))].sort();

  return (
    <div className="px-3 md:px-4 max-w-[1200px] w-full mx-auto py-6 space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.16em] text-rose-400 font-medium">Events</p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-slate-100">Browse & filter</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[140px] h-9">
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
          <Select value={eventName} onValueChange={setEventName}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Filter by event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All events</SelectItem>
              {uniqueEvents.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => exportAnalytics({ siteId, range, format: 'csv', eventName: eventName || undefined })}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </header>

      <div className={`${PANEL} grid grid-cols-3 divide-x divide-white/[0.06]`}>
        <StatCell label="Total Events" value={formatNumber(total)} />
        <StatCell label="Pageviews (loaded)" value={formatNumber(pageviews)} />
        <StatCell label="Other Types (loaded)" value={formatNumber(Math.max(events.length - pageviews, 0))} />
      </div>

      <div className={PANEL}>
        <PanelHeader
          title={`Event Log · ${formatNumber(total)}`}
          right={
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
              <Input
                placeholder="Search events..."
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
                <TableHead className="w-24">Time</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Session</TableHead>
                <TableHead className="w-24">Country</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events
                .filter((e) =>
                  e.name.toLowerCase().includes(search.toLowerCase()) ||
                  e.path.toLowerCase().includes(search.toLowerCase()) ||
                  e.title?.toLowerCase().includes(search.toLowerCase()) ||
                  e.sessionId.toLowerCase().includes(search.toLowerCase())
                )
                .map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="mono text-[11px] text-slate-500">
                      {formatRelativeTime(event.createdAt)}
                    </TableCell>
                    <TableCell>
                      <span className={`mono text-[11px] rounded-md px-1.5 py-0.5 border ${
                        event.name === 'pageview'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                          : 'bg-white/[0.05] text-slate-400 border-white/[0.06]'
                      }`}>
                        {event.name}
                      </span>
                    </TableCell>
                    <TableCell className="mono text-[12.5px] truncate max-w-[220px] text-slate-100">
                      {event.path || '/'}
                    </TableCell>
                    <TableCell className="text-[12.5px] truncate max-w-[180px] text-slate-400">
                      {event.title || '—'}
                    </TableCell>
                    <TableCell className="mono text-[11px] text-slate-600">
                      {event.sessionId.slice(0, 10)}…
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
                  <TableCell colSpan={6} className="text-center py-10 text-[13px] text-slate-600">
                    No events found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {total > 100 && (
          <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
            <p className="text-xs text-slate-500 mono">
              Showing {Math.min(page * 100, total)} of {formatNumber(total)}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page * 100 >= total} onClick={() => setPage(p => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
