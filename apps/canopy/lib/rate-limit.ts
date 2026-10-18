const WINDOW_MS = 60_000;

const SITE_LIMIT = toNumber(process.env.CANOPY_RATE_LIMIT_SITE, 3000);
const IP_LIMIT = toNumber(process.env.CANOPY_RATE_LIMIT_IP, 150);

const MAX_BUCKETS = 100_000;
const SWEEP_THRESHOLD = 50_000;

const buckets = new Map<string, { count: number; resetAt: number }>();
let lastSweep = 0;

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sweep(now: number) {
  if (buckets.size < SWEEP_THRESHOLD || now - lastSweep < WINDOW_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function take(key: string, limit: number): boolean {
  if (limit <= 0) return true;
  const now = Date.now();
  sweep(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) return true;
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

export function rateLimitSite(siteId: string): boolean {
  return take(`site:${siteId}`, SITE_LIMIT);
}

export function rateLimitIp(ipHash: string): boolean {
  return take(`ip:${ipHash}`, IP_LIMIT);
}
