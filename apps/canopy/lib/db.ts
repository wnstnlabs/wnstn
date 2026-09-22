import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schema';

const connectionString = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/canopy';

// Lazy pool — won't throw at import time if env missing (build)
const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
});

export const db = drizzle(pool, { schema });
