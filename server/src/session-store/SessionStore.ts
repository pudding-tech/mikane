import { Pool } from "pg";
import { Store, SessionData } from "express-session";
import { StoreOptions } from "../types/StoreOptions.ts";
import logger from "../utils/logger.ts";

export default class SessionStore extends Store {

  private pool: Pool;
  private table: string;
  private timeToLive: number;
  private autoDestroy: boolean;
  private autoDestroyInterval: number;

  constructor(options: StoreOptions) {
    super();
    this.pool = options.pool ?? new Pool(options.dbConfig);
    this.table = options?.table ?? "session";
    this.timeToLive = options?.timeToLive ?? 1000 * 60 * 60 * 24;
    this.autoDestroy = options?.autoDestroy ?? false;
    this.autoDestroyInterval = options?.autoDestroyInterval ?? 1000 * 60 * 60 * 24;
  }

  /**
   * Check if database is connected
   */
  async checkConnection() {
    try {
      const client = await this.pool.connect();
      logger.info("Session store connected");
      client.release();

      if (this.autoDestroy) {
        setInterval(() => {
          this.destroyExpired();
        }, this.autoDestroyInterval);
      }
    }
    catch (err) {
      logger.error("Something went wrong connecting to session store");
    }
  }
  
  async get(sid: string, callback: (err: any, session?: SessionData | null | undefined) => void) {
    try {
      const query = {
        text: `
          SELECT "session" from ${this.table} where sid = $1 and expires > CURRENT_TIMESTAMP;
        `,
        values: [sid]
      };
      const res = await this.pool.query(query);
      callback(null, (res.rows.length > 0 && res.rows[0].session) ? res.rows[0].session : null);
    }
    catch (err) {
      this.errorhandler(err, callback);
    }
  }

  async set(sid: string, session: SessionData, callback?: ((err?: any) => void) | undefined) {
    const expires = session.cookie.expires ?? new Date(Date.now() + this.timeToLive);
    const userId = session.userId;

    try {
      const query = {
        text: `
          INSERT INTO
            ${this.table} (sid, session, expires, user_id)
          SELECT
            $1, $2, $3, $4
          ON CONFLICT (sid)
            DO UPDATE SET session = $2, expires = $3
          RETURNING sid;
        `,
        values: [sid, session, expires, userId]
      };
      await this.pool.query(query);

      if (callback) {
        callback();
      }
    }
    catch (err) {
      this.errorhandler(err, callback);
    }
  }

  async touch(sid: string, session: SessionData, callback?: (() => void) | undefined) {
    const expires = session.cookie.expires ?? new Date(Date.now() + this.timeToLive);

    try {
      const query = {
        text: `
          UPDATE ${this.table} SET expires = $2 where sid = $1;
        `,
        values: [sid, expires]
      };
      await this.pool.query(query);

      if (callback) {
        callback();
      }
    }
    catch (err) {
      this.errorhandler(err, callback);
    }
  }

  async destroy(sid: string, callback?: ((err?: any) => void) | undefined) {
    try {
      const query = {
        text: `
          DELETE FROM ${this.table} where sid = $1;
        `,
        values: [sid]
      };
      await this.pool.query(query);
      
      if (callback) {
        callback();
      }
    }
    catch (err) {
      this.errorhandler(err, callback);
    }
  }

  /**
   * Destroy all sessions for the signed in user
   * @param userId 
   */
  async destroyAll(userId: string, callback?: ((err?: any) => void)) {
    try {
      const query = {
        text: `
          DELETE FROM ${this.table} where user_id = $1;
        `,
        values: [userId]
      };
      await this.pool.query(query);

      if (callback) {
        callback();
      }
    }
    catch (err) {
      this.errorhandler(err, callback);
    }
  }

  /**
   * Destroy all expired sessions from the database
   */
  async destroyExpired() {
    try {
      const query = `
        DELETE FROM ${this.table} WHERE expires <= CURRENT_TIMESTAMP()
      `;
      await this.pool.query(query);
    }
    catch (err) {
      this.errorhandler(err);
    }
  }

  /**
   * Handle errors
   * @param err 
   * @param callback
   */
  private errorhandler(err: any, callback?: (err: any) => void) {
    if (callback) {
      return callback(err);
    }
    logger.error(err);
  }
}
