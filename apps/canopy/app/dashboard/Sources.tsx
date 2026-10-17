'use client';

import { useState, useEffect } from 'react';
import { formatNumber } from '@/lib/utils';
import { exportAnalytics } from '@/lib/utils/export';
import { PieChartComponent, BarChartComponent } from '@/components/charts/Charts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Download, Search, Link as LinkIcon, Globe } from 'lucide-react';
import { PANEL, PanelHeader } from '@/components/dashboard/parts';

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
      <div className="px-3 md:px-4 max-w-[1200px] w-full mx-auto py-6 space-y-4">
        <div className="h-12 w-48 bg-white/[0.05] rounded" />
        <div className="grid gap-4 xl:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 rounded-xl border border-white/[0.08] bg-[#12151d] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 md:px-4 max-w-[1200px] w-full mx-auto py-6 space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.16em] text-rose-400 font-medium">Sources</p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-slate-100">Where visitors come from</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={setRange}>
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

      <div className="grid gap-4 xl:grid-cols-2">
        <div className={PANEL}>
          <PanelHeader
            title="Referrer Distribution"
            right={<span className="mono text-[10px] text-slate-600 tabular">{formatNumber(referrersData?.total || 0)}</span>}
          />
          <div className="p-4">
            <PieChartComponent data={referrers} height={280} maxSlices={8} />
          </div>
        </div>

        <div className={PANEL}>
          <PanelHeader
            title="All Referrers"
            right={
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                <Input
                  placeholder="Search referrers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-48 h-8 pl-8 text-xs"
                />
              </div>
            }
          />
          <div className="p-2 max-h-[340px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Referrer</TableHead>
                  <TableHead className="text-right w-20">Visits</TableHead>
                  <TableHead className="text-right w-20">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrers
                  .filter((r) => r.key.toLowerCase().includes(search.toLowerCase()))
                  .map((item, index) => (
                    <TableRow key={item.key}>
                      <TableCell className="mono text-[11px] text-slate-600">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-3.5 w-3.5 text-slate-600" />
                          <span className="mono text-[12.5px] truncate max-w-[260px] text-slate-100">
                            {item.key}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right mono text-[12.5px] tabular text-slate-300">
                        {formatNumber(item.count)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="mono text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-md px-1.5 py-0.5 tabular">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                {referrers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-[13px] text-slate-600">
                      No referrer data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className={PANEL}>
          <PanelHeader
            title="Geographic Distribution"
            right={<span className="mono text-[10px] text-slate-600 tabular">{formatNumber(countriesData?.total || 0)}</span>}
          />
          <div className="p-4">
            <PieChartComponent data={countries} height={280} maxSlices={10} />
          </div>
        </div>

        <div className={PANEL}>
          <PanelHeader title="All Countries" />
          <div className="p-2 max-h-[340px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right w-20">Visits</TableHead>
                  <TableHead className="text-right w-20">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries
                  .filter((c) => c.key.toLowerCase().includes(search.toLowerCase()))
                  .map((item, index) => (
                    <TableRow key={item.key}>
                      <TableCell className="mono text-[11px] text-slate-600">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5 text-slate-600" />
                          <span className="text-[13px] font-medium text-slate-100">{item.key}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right mono text-[12.5px] tabular text-slate-300">
                        {formatNumber(item.count)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="mono text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-md px-1.5 py-0.5 tabular">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                {countries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-[13px] text-slate-600">
                      No country data available
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
          title="Landing Pages · Entry Points"
          right={<span className="mono text-[10px] text-slate-600 tabular">{formatNumber(sourcesData?.total || 0)}</span>}
        />
        <div className="p-4">
          <BarChartComponent data={sources} height={300} maxBars={12} horizontal={true} />
        </div>
      </div>
    </div>
  );
}
