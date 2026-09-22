import { resolveSites } from '@/lib/resolve-sites';
import { DashboardEvents } from '../Events';

export const dynamic = 'force-dynamic';

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ site?: string }> }) {
  const { site: siteIdParam } = await searchParams;
  const resolved = await resolveSites(siteIdParam);
  if (!resolved) {
    return <div className="p-8 text-sm text-zinc-500">Session required. <a href="/login" className="underline">Sign in</a></div>;
  }
  const { sites, current } = resolved;

  if (sites.length === 0) {
    return <div className="px-7 py-8 text-sm text-zinc-500">No sites yet — create one from the dashboard.</div>;
  }
  if (!current) {
    return <div className="p-7 text-sm text-zinc-500">Select a site.</div>;
  }

  return <DashboardEvents siteId={current.id} />;
}