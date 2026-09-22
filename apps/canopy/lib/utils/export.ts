'use client';

export function exportAnalytics(opts: {
  siteId: string;
  range: string;
  format?: 'csv' | 'json';
  eventName?: string;
}) {
  const params = new URLSearchParams({
    siteId: opts.siteId,
    range: opts.range,
    format: opts.format ?? 'csv',
  });
  if (opts.eventName) params.set('eventName', opts.eventName);
  window.open(`/api/analytics/export?${params.toString()}`, '_blank');
}