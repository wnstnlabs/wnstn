'use client';

import { useState, useEffect } from 'react';
import { formatNumber, formatRelativeTime, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Separator } from '@/components/ui/Separator';
import { Users, MousePointer, Clock, Globe, Activity, TrendingUp } from 'lucide-react';

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
  const [history, setHistory] = useState<Array<{ time: string; visitors: number; pageviews: number; events: number }>>([]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/analytics/realtime?siteId=${siteId}&window=${windowSize}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setRealtimeData(data);
        
        // Update history for sparkline
        setHistory(prev => {
          const newEntry = {
            time: new Date().toLocaleTimeString(),
            visitors: data.activeVisitors,
            pageviews: data.pageviewsPerMinute,
            events: data.eventsPerMinute,
          };
          return [...prev.slice(-30), newEntry];
        });
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Realtime</h1>
          <p className="text-zinc-500 mt-1">Loading live data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 w-20 bg-white/10 rounded mb-2" />
                <div className="h-12 w-24 bg-white/10 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const data = realtimeData!;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Realtime</h1>
          <p className="text-zinc-500 mt-1">
            Live visitors right now — updates every 5 seconds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(windowSize)} onValueChange={(v) => setWindowSize(Number(v))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time window" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">1 minute</SelectItem>
              <SelectItem value="120">2 minutes</SelectItem>
              <SelectItem value="300">5 minutes</SelectItem>
            </SelectContent>
          </Select>
          <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            LIVE
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Active Visitors</p>
                <p className="mt-2 text-4xl font-semibold text-white">{data.activeVisitors}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Unique sessions in last {windowSize}s
                </p>
              </div>
              <div className="ml-4 text-emerald-400/50">
                <Users className="h-8 w-8" />
              </div>
            </div>
            {/* Mini sparkline */}
            {history.length > 1 && (
              <div className="mt-4 h-16">
                <svg viewBox="0 0 200 40" className="w-full" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={history.map((d, i) => `${(i / Math.max(history.length - 1, 1)) * 200},${40 - (d.visitors / Math.max(...history.map(h => h.visitors), 1)) * 35}`).join(' ')}
                  />
                </svg>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Pageviews/min</p>
                <p className="mt-2 text-4xl font-semibold text-white">{data.pageviewsPerMinute.toFixed(1)}</p>
                <p className="mt-1 text-xs text-zinc-500">Average over window</p>
              </div>
              <div className="ml-4 text-blue-400/50">
                <MousePointer className="h-8 w-8" />
              </div>
            </div>
            {history.length > 1 && (
              <div className="mt-4 h-16">
                <svg viewBox="0 0 200 40" className="w-full" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={history.map((d, i) => `${(i / Math.max(history.length - 1, 1)) * 200},${40 - (d.pageviews / Math.max(...history.map(h => h.pageviews), 1)) * 35}`).join(' ')}
                  />
                </svg>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Events/min</p>
                <p className="mt-2 text-4xl font-semibold text-white">{data.eventsPerMinute.toFixed(1)}</p>
                <p className="mt-1 text-xs text-zinc-500">All event types</p>
              </div>
              <div className="ml-4 text-amber-400/50">
                <Activity className="h-8 w-8" />
              </div>
            </div>
            {history.length > 1 && (
              <div className="mt-4 h-16">
                <svg viewBox="0 0 200 40" className="w-full" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={history.map((d, i) => `${(i / Math.max(history.length - 1, 1)) * 200},${40 - (d.events / Math.max(...history.map(h => h.events), 1)) * 35}`).join(' ')}
                  />
                </svg>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Active Pages */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Top Active Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topActivePages.length > 0 ? (
                data.topActivePages.map((page, index) => (
                  <div key={page.key} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 text-center text-zinc-500 font-medium text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm truncate text-white">{page.key}</p>
                      <p className="text-xs text-zinc-500">{page.count} views in window</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={page.percentage} className="w-32 h-1.5" />
                      <span className="text-xs font-mono text-zinc-400 w-12 text-right">
                        {page.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-zinc-500 py-8">No active pages</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Events Stream */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-400" />
              Live Event Stream
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.recentEvents.length > 0 ? (
                data.recentEvents.slice(0, 20).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex-shrink-0 w-20 text-right text-zinc-500 mono text-xs">
                      {formatRelativeTime(event.timestamp)}
                    </div>
                    <Badge
                      variant={event.name === 'pageview' ? 'default' : 'secondary'}
                      className="flex-shrink-0"
                    >
                      {event.name}
                    </Badge>
                    <div className="flex-1 min-w-0 font-mono text-sm truncate text-white">
                      {event.path || '/'}
                    </div>
                    {event.country && (
                      <Badge variant="secondary" className="flex-shrink-0">
                        <Globe className="h-3 w-3 mr-1" />
                        {event.country}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-zinc-500 py-8">No recent events</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}