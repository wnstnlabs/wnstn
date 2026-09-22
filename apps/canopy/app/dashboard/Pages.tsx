'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatNumber, formatRelativeTime, cn } from '@/lib/utils';
import { exportAnalytics } from '@/lib/utils/export';
import { BarChartComponent } from '@/components/charts/Charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Download, Search, ExternalLink } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'events'>('overview');
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Pages</h1>
          <p className="text-zinc-500 mt-1">Loading page analytics...</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="h-64 animate-pulse bg-white/[0.02] rounded-xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Pages</h1>
          <p className="text-zinc-500 mt-1">
            Top pages and detailed event breakdown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={(v) => setRange(v)}>
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
          <Button variant="outline" size="sm" onClick={() => exportAnalytics({ siteId, range, format: 'csv', eventName: 'pageview' })}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Top Pages ({data.length})</TabsTrigger>
          <TabsTrigger value="events">All Events ({formatNumber(totalEvents)})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            {/* Chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Pageviews by Path</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={data}
                  height={350}
                  maxBars={15}
                  horizontal={true}
                />
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">All Pages</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search paths..."
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
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Path</TableHead>
                        <TableHead className="text-right w-32">Views</TableHead>
                        <TableHead className="text-right w-32">Share</TableHead>
                        <TableHead className="w-32"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data
                        .filter((d) => d.key.toLowerCase().includes(search.toLowerCase()))
                        .map((item, index) => (
                          <TableRow key={item.key}>
                            <TableCell className="text-zinc-500 mono text-sm">{index + 1}</TableCell>
                            <TableCell className="font-mono text-sm truncate max-w-[400px]">
                              <span className="text-white">{item.key}</span>
                            </TableCell>
                            <TableCell className="text-right font-mono mono text-sm">
                              {formatNumber(item.count)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary">{item.percentage.toFixed(1)}%</Badge>
                            </TableCell>
                            <TableCell>
                              <a
                                href={item.key.startsWith('http') ? item.key : `https://${item.key}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-zinc-500 hover:text-white transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </TableCell>
                          </TableRow>
                        ))}
                      {data.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                            No page data available for this period
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Pageview Events</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search..."
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
                      <TableHead>Path</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Referrer</TableHead>
                      <TableHead className="w-32">Country</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events
                      .filter((e) =>
                        e.path.toLowerCase().includes(search.toLowerCase()) ||
                        e.title?.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="text-zinc-500 mono text-xs">
                            {formatRelativeTime(event.createdAt)}
                          </TableCell>
                          <TableCell className="font-mono text-sm truncate max-w-[250px]">
                            {event.path || '/'}
                          </TableCell>
                          <TableCell className="truncate max-w-[200px] text-zinc-400">
                            {event.title || '—'}
                          </TableCell>
                          <TableCell className="truncate max-w-[200px] text-zinc-400">
                            {event.referrer || 'Direct'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{event.country || 'Unknown'}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    {events.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                          No events found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalEvents > 50 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-zinc-500">
                    Showing {Math.min(50, totalEvents)} of {formatNumber(totalEvents)} events
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}