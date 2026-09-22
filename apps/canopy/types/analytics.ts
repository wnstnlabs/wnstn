import { z } from 'zod';

// Query params for analytics endpoints
export const AnalyticsQuerySchema = z.object({
  siteId: z.string().min(1),
  range: z.enum(['1h', '24h', '7d', '30d', '90d']).default('7d'),
  interval: z.enum(['minute', 'hour', 'day']).optional(),
  eventName: z.string().optional(),
  path: z.string().optional(),
  referrer: z.string().optional(),
  country: z.string().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0),
});

export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;

export const TimeSeriesQuerySchema = z.object({
  siteId: z.string().min(1),
  range: z.enum(['1h', '24h', '7d', '30d', '90d']).default('7d'),
  interval: z.enum(['minute', 'hour', 'day']).default('hour'),
  eventName: z.string().optional(),
});

export type TimeSeriesQuery = z.infer<typeof TimeSeriesQuerySchema>;

export const TopPagesQuerySchema = z.object({
  siteId: z.string().min(1),
  range: z.enum(['1h', '24h', '7d', '30d', '90d']).default('7d'),
  limit: z.coerce.number().min(1).max(100).default(20),
  eventName: z.enum(['pageview', 'custom']).default('pageview'),
});

export type TopPagesQuery = z.infer<typeof TopPagesQuerySchema>;

export const TopReferrersQuerySchema = z.object({
  siteId: z.string().min(1),
  range: z.enum(['1h', '24h', '7d', '30d', '90d']).default('7d'),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type TopReferrersQuery = z.infer<typeof TopReferrersQuerySchema>;

export const TopCountriesQuerySchema = z.object({
  siteId: z.string().min(1),
  range: z.enum(['1h', '24h', '7d', '30d', '90d']).default('7d'),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type TopCountriesQuery = z.infer<typeof TopCountriesQuerySchema>;

export const RealtimeQuerySchema = z.object({
  siteId: z.string().min(1),
  window: z.coerce.number().min(30).max(300).default(60), // seconds
});

export type RealtimeQuery = z.infer<typeof RealtimeQuerySchema>;

export const EventsQuerySchema = z.object({
  siteId: z.string().min(1),
  range: z.enum(['1h', '24h', '7d', '30d', '90d']).default('7d'),
  eventName: z.string().optional(),
  limit: z.coerce.number().min(1).max(500).default(100),
  offset: z.coerce.number().min(0).default(0),
});

export type EventsQuery = z.infer<typeof EventsQuerySchema>;

// Response types
export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  label: string;
}

export interface TopItem {
  key: string;
  count: number;
  percentage: number;
}

export interface AnalyticsOverview {
  totalEvents: number;
  totalPageviews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: TopItem[];
  topReferrers: TopItem[];
  topCountries: TopItem[];
  timeSeries: TimeSeriesPoint[];
}

export interface RealtimeData {
  activeVisitors: number;
  pageviewsPerMinute: number;
  eventsPerMinute: number;
  topActivePages: TopItem[];
  recentEvents: Array<{
    id: string;
    name: string;
    path: string;
    timestamp: string;
    country?: string;
  }>;
}

export interface PaginatedEvents {
  events: Array<{
    id: string;
    name: string;
    url: string;
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