'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatNumber, formatRelativeTime, cn } from '@/lib/utils';
import { exportAnalytics } from '@/lib/utils/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Download, Search, Filter } from 'lucide-react';

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

  if (loading && !eventsData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Events</h1>
          <p className="text-zinc-500 mt-1">Loading events...</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="h-64 animate-pulse bg-white/[0.02] rounded-xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get unique event names for filter
  const uniqueEvents = [...new Set(events.map(e => e.name))].sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Events</h1>
          <p className="text-zinc-500 mt-1">
            Browse and filter all tracked events
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[160px]">
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
            <SelectTrigger className="w-[200px]">
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
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            Event Log ({formatNumber(total)})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead className="w-32">Country</TableHead>
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
                      <TableCell className="text-zinc-500 mono text-xs">
                        {formatRelativeTime(event.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={event.name === 'pageview' ? 'default' : 'secondary'}>
                          {event.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm truncate max-w-[250px]">
                        {event.path || '/'}
                      </TableCell>
                      <TableCell className="truncate max-w-[200px] text-zinc-400">
                        {event.title || '—'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-500">
                        {event.sessionId.slice(0, 12)}…
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{event.country || 'Unknown'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                {events.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                      No events found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {total > 100 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                Showing {Math.min(page * 100, total)} of {formatNumber(total)} events
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
        </CardContent>
      </Card>
    </div>
  );
}