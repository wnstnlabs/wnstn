'use client';

import { useState, useEffect } from 'react';
import { formatNumber, formatRelativeTime, cn } from '@/lib/utils';
import { exportAnalytics } from '@/lib/utils/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { BarChartComponent, PieChartComponent } from '@/components/charts/Charts';
import { Globe, MousePointer, Link, Search, Download } from 'lucide-react';

interface TopReferrersData {
  data: Array<{ key: string; count: number; percentage: number }>;
  total: number;
}

interface TopCountriesData {
  data: Array<{ key: string; count: number; percentage: number }>;
  total: number;
}

interface TopSourcesData {
  data: Array<{ key: string; count: number; percentage: number }>;
  total: number;
}

export function DashboardSources({ siteId }: { siteId: string }) {
  const [range, setRange] = useState('7d');
  const [referrersData, setReferrersData] = useState<TopReferrersData | null>(null);
  const [countriesData, setCountriesData] = useState<TopCountriesData | null>(null);
  const [sourcesData, setSourcesData] = useState<TopSourcesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'referrers' | 'countries' | 'sources'>('referrers');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [refRes, cntRes, srcRes] = await Promise.all([
        fetch(`/api/analytics/top-referrers?siteId=${siteId}&range=${range}&limit=50`, { credentials: "include" }),
        fetch(`/api/analytics/top-countries?siteId=${siteId}&range=${range}&limit=50`, { credentials: "include" }),
        fetch(`/api/analytics/top-pages?siteId=${siteId}&range=${range}&limit=50&eventName=pageview`, { credentials: "include" }),
      ]);

      if (refRes.ok) setReferrersData(await refRes.json());
      if (cntRes.ok) setCountriesData(await cntRes.json());
      if (srcRes.ok) setSourcesData(await srcRes.json());
    } catch (e) {
      console.error('Failed to fetch sources data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [siteId, range]);

  const referrers = referrersData?.data || [];
  const countries = countriesData?.data || [];
  const sources = sourcesData?.data || [];

  if (loading && !referrersData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Sources</h1>
          <p className="text-zinc-500 mt-1">Loading traffic sources...</p>
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
          <h1 className="text-2xl font-semibold text-white">Sources</h1>
          <p className="text-zinc-500 mt-1">
            Where your visitors come from
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button variant="outline" size="sm" onClick={() => exportAnalytics({ siteId, range, format: 'csv' })}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="referrers">
            <Link className="h-4 w-4 mr-2" />
            Referrers ({formatNumber(referrersData?.total || 0)})
          </TabsTrigger>
          <TabsTrigger value="countries">
            <Globe className="h-4 w-4 mr-2" />
            Countries ({formatNumber(countriesData?.total || 0)})
          </TabsTrigger>
          <TabsTrigger value="sources">
            <MousePointer className="h-4 w-4 mr-2" />
            Pages ({formatNumber(sourcesData?.total || 0)})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="referrers">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Referrer Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartComponent
                  data={referrers}
                  height={300}
                  maxSlices={8}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">All Referrers</CardTitle>
                <Input
                  placeholder="Search referrers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64"
                />
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Referrer</TableHead>
                        <TableHead className="text-right w-32">Visits</TableHead>
                        <TableHead className="text-right w-32">Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrers
                        .filter((r) => r.key.toLowerCase().includes(search.toLowerCase()))
                        .map((item, index) => (
                          <TableRow key={item.key}>
                            <TableCell className="text-zinc-500 mono text-sm">{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Link className="h-4 w-4 text-zinc-500" />
                                <span className="font-mono text-sm truncate max-w-[300px] text-white">
                                  {item.key === 'Direct' ? 'Direct' : item.key}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono mono text-sm">
                              {formatNumber(item.count)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary">{item.percentage.toFixed(1)}%</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      {referrers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                            No referrer data available
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

        <TabsContent value="countries">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartComponent
                  data={countries}
                  height={300}
                  maxSlices={10}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">All Countries</CardTitle>
                <Input
                  placeholder="Search countries..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64"
                />
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead className="text-right w-32">Visits</TableHead>
                        <TableHead className="text-right w-32">Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {countries
                        .filter((c) => c.key.toLowerCase().includes(search.toLowerCase()))
                        .map((item, index) => (
                          <TableRow key={item.key}>
                            <TableCell className="text-zinc-500 mono text-sm">{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-zinc-500" />
                                <span className="font-medium text-white">{item.key}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono mono text-sm">
                              {formatNumber(item.count)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary">{item.percentage.toFixed(1)}%</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      {countries.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                            No country data available
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

        <TabsContent value="sources">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Landing Pages as Entry Points</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={sources}
                height={350}
                maxBars={15}
                horizontal={true}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">All Entry Pages</CardTitle>
              <Input
                placeholder="Search pages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Entry Page</TableHead>
                      <TableHead className="text-right w-32">Entrances</TableHead>
                      <TableHead className="text-right w-32">Share</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sources
                      .filter((s) => s.key.toLowerCase().includes(search.toLowerCase()))
                      .map((item, index) => (
                        <TableRow key={item.key}>
                          <TableCell className="text-zinc-500 mono text-sm">{index + 1}</TableCell>
                          <TableCell className="font-mono text-sm truncate max-w-[400px] text-white">
                            {item.key}
                          </TableCell>
                          <TableCell className="text-right font-mono mono text-sm">
                            {formatNumber(item.count)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">{item.percentage.toFixed(1)}%</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    {sources.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                          No landing page data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}