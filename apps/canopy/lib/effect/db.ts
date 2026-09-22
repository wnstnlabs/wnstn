import { Context, Layer } from 'effect';
import { db as drizzleDb } from '@/lib/db';

export class Db extends Context.Tag('Db')<Db, typeof drizzleDb>() {}
export const DbLive = Layer.succeed(Db, drizzleDb);
