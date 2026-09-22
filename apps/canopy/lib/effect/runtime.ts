import { ManagedRuntime } from 'effect';
import { DbLive } from './db';

export const CanopyRuntime = ManagedRuntime.make(DbLive);
