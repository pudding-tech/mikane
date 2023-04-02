export interface StoreOptions {
  /**
   * Table to use as session store.
   * Default: `[session]`
   */
  table?: string;

  /**
   * Determines the expiration date (if not set in session data).
   * Default: `1000 * 60 * 60 * 24` (24 hours)
   */
  timeToLive?: number;

  /**
   * Determines if expired sessions should be automatically deleted.
   * If value is `true` then a function, `deleteExpired()`,
   * will delete expired sessions on a set interval.
   * Default: `false`
   */
  autoDelete?: boolean;

  /**
   * Sets the timer interval for each call to `deleteExpired()`.
   * Default: `1000 * 60 * 60 * 24` (24 hours)
   */
  autoDeleteInterval?: number;
}
