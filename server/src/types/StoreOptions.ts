import { Pool } from "pg";
import { DBConfig } from "./types.ts";

export interface StoreOptions {
  /**
   * Database connection pool to use (recommended connection type)
   */
  pool?: Pool;

  /**
   * Database connection config (alternative connection type)
   */
  dbConfig?: DBConfig;

  /**
   * Table to use as session store.
   * Default: `session`
   */
  table?: string;

  /**
   * Determines the expiration date (if not set in session data).
   * Default: `1000 * 60 * 60 * 24` (24 hours)
   */
  timeToLive?: number;

  /**
   * Determines if expired sessions should be automatically destroyed.
   * If value is `true` then a function, `destroyExpired()`,
   * will destroy expired sessions on a set interval.
   * Default: `false`
   */
  autoDestroy?: boolean;

  /**
   * Sets the timer interval for each call to `destroyExpired()`.
   * Default: `1000 * 60 * 60 * 24` (24 hours)
   */
  autoDestroyInterval?: number;
}
