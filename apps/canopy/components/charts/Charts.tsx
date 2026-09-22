'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

interface TimeSeriesChartProps {
  data: Array<{ timestamp: string; value: number; label: string }>;
  className?: string;
  height?: number;
  color?: string;
  showArea?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  xKey?: string;
  yKey?: string;
  labelKey?: string;
}

export function TimeSeriesChart({
  data,
  className,
  height = 200,
  color = COLORS[0],
  showArea = true,
  showGrid = true,
  showTooltip = true,
  xKey = 'timestamp',
  yKey = 'value',
  labelKey = 'label',
}: TimeSeriesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn('h-full flex items-center justify-center', className)}>
        <div className="text-center text-zinc-500">
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  const formattedData: Array<Record<string, string | number>> = data.map((d, i) => {
    const row = d as unknown as Record<string, string | number>;
    return {
      ...d,
      [labelKey]: row[labelKey] || row[xKey],
      [yKey]: typeof row[yKey] === 'number' ? row[yKey] : parseFloat(String(row[yKey])) || 0,
      index: i,
    };
  });

  const ChartComponent = showArea ? AreaChart : LineChart;
  const SeriesComponent = showArea ? Area : Line;

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={formattedData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />}
          <XAxis
            dataKey={labelKey}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0a0c',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
              labelStyle={{ color: '#fff', fontSize: 11 }}
              formatter={((value: any) => [Number(value).toLocaleString(), '']) as any}
            />
          )}
          <SeriesComponent
            type="monotone"
            dataKey={yKey}
            stroke={color}
            fill={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 2 }}
            fillOpacity={showArea ? 0.15 : 0}
          />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}

interface BarChartProps {
  data: Array<{ key: string; count: number; percentage: number }>;
  className?: string;
  height?: number;
  maxBars?: number;
  horizontal?: boolean;
  showPercentage?: boolean;
}

export function BarChartComponent({
  data,
  className,
  height = 250,
  maxBars = 10,
  horizontal = true,
  showPercentage = true,
}: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn('h-full flex items-center justify-center', className)}>
        <div className="text-center text-zinc-500">
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  const displayData = data.slice(0, maxBars).map((d, i) => ({
    ...d,
    color: COLORS[i % COLORS.length],
    label: d.key.length > 30 ? d.key.slice(0, 27) + '...' : d.key,
  }));

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        {horizontal ? (
          <BarChart data={displayData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} vertical={false} />
            <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="label"
              width={horizontal ? 200 : 80}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0a0c',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              }}
              formatter={((value: any) => [Number(value).toLocaleString(), '']) as any}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {displayData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <BarChart data={displayData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0a0c',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              }}
              formatter={((value: any) => [Number(value).toLocaleString(), '']) as any}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {displayData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

interface PieChartProps {
  data: Array<{ key: string; count: number; percentage: number }>;
  className?: string;
  height?: number;
  maxSlices?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export function PieChartComponent({
  data,
  className,
  height = 250,
  maxSlices = 8,
  innerRadius = 60,
  outerRadius = 100,
}: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn('h-full flex items-center justify-center', className)}>
        <div className="text-center text-zinc-500">
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  const displayData = data.slice(0, maxSlices).map((d, i) => ({
    ...d,
    color: COLORS[i % COLORS.length],
    label: d.key.length > 20 ? d.key.slice(0, 17) + '...' : d.key,
  }));

  const otherCount = data.slice(maxSlices).reduce((sum, d) => sum + d.count, 0);
  if (otherCount > 0) {
    displayData.push({
      key: 'Other',
      count: otherCount,
      percentage: data.slice(maxSlices).reduce((sum, d) => sum + d.percentage, 0),
      color: '#52525b',
      label: 'Other',
    });
  }

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={displayData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="count"
            nameKey="key"
            label={((props: any) => `${props.key ?? props.name} ${props.percentage ?? ''}%`) as any}
            labelLine={false}
          >
            {displayData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0a0c',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            }}
            formatter={((value: any) => [Number(value).toLocaleString(), '']) as any}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricCard({ title, value, change, changeLabel, icon, className, trend = 'neutral' }: MetricCardProps) {
  return (
    <div className={cn('rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:border-white/20', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-white truncate">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className={cn(
                'text-xs font-medium',
                trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-zinc-500'
              )}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {Math.abs(change).toFixed(1)}%
              </span>
              {changeLabel && <span className="text-xs text-zinc-500">{changeLabel}</span>}
            </div>
          )}
        </div>
        {icon && <div className="ml-4 text-zinc-500/50">{icon}</div>}
      </div>
    </div>
  );
}

interface StatGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}

export function StatGrid({ children, className, columns = 4 }: StatGridProps) {
  return (
    <div className={cn(`grid gap-4`, `grid-cols-${columns}`, 'sm:grid-cols-2 lg:grid-cols-4', className)}>
      {children}
    </div>
  );
}