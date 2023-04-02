/* eslint-disable @typescript-eslint/no-explicit-any */
import sql from "mssql";
import { Store, SessionData } from "express-session";
import { StoreOptions } from "../types/StoreOptions";

export default class MSSQLSessionStore extends Store {

  private pool: sql.ConnectionPool;
  private table: string;
  private timeToLive: number;
  private autoDelete: boolean;
  private autoDeleteInterval: number;

  constructor(config: sql.config, options: StoreOptions) {
    super();
    this.pool = new sql.ConnectionPool(config);
    this.table = options.table ?? "session";
    this.timeToLive = options.timeToLive ?? 1000 * 60 * 60 * 24;
    this.autoDelete = options.autoDelete ?? false;
    this.autoDeleteInterval = options.autoDeleteInterval ?? 1000 * 60 * 60 * 24;
  }

  /**
   * Connect to database
   */
  async connect() {
    await this.pool.connect();
    console.log("Session store connected");

    if (this.autoDelete) {
      setInterval(() => {
        this.deleteExpired();
      }, this.autoDeleteInterval);
    }
  }

  private async connectionCheck() {
    try {
      if (!this.pool.connected && !this.pool.connecting) {
        await this.connect();
      }
      if (this.pool.connected) {
        return true;
      }
      throw new Error("Not connected to session store");
    }
    catch(err) {
      throw err;
    }
  }
  
  async get(sid: string, callback: (err: any, session?: SessionData | null | undefined) => void) {
    try {
      await this.connectionCheck();

      const request = this.pool.request();
      const res = await request
        .input("sid", sql.NVarChar, sid)
        .query(`
          SELECT [session] from ${this.table} where sid = @sid and expires > GETDATE()
        `);
      callback(null, (res.recordset.length > 0 && res.recordset[0].session) ? JSON.parse(res.recordset[0].session) : null);
    }
    catch (err) {
      this.errorhandler(err, callback);
    }
  }

  async set(sid: string, session: SessionData, callback?: ((err?: any) => void) | undefined) {
    const expires = session.cookie.expires ?? new Date(Date.now() + this.timeToLive);
    const data = JSON.stringify(session);
    const userId = session.userId;

    try {
      await this.connectionCheck();

      const request = this.pool.request();
      await request
        .input("sid", sql.NVarChar, sid)
        .input("session", sql.NVarChar, data)
        .input("expires", sql.DateTime, expires)
        .input("user_id", sql.Int, userId)
        .query(`
          IF EXISTS (SELECT * FROM ${this.table} WHERE sid = @sid)
            UPDATE ${this.table} SET session = @session, expires = @expires WHERE sid = @sid
          ELSE
            INSERT INTO ${this.table} (sid, session, expires, user_id) VALUES (@sid, @session, @expires, @user_id)
        `);
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
      await this.connectionCheck();

      const request = this.pool.request();
      await request
        .input("sid", sql.NVarChar, sid)
        .input("expires", sql.DateTime, expires)
        .query(`
          UPDATE ${this.table} SET expires = @expires where sid = @sid
        `);
      if (callback) {
        callback();
      }
    }
    catch(err) {
      this.errorhandler(err, callback);
    }
  }

  async destroy(sid: string, callback?: ((err?: any) => void) | undefined) {
    console.log("destroy");
    try {
      await this.connectionCheck();

      const request = this.pool.request();
      await request
        .input("sid", sql.NVarChar, sid)
        .query(`
          DELETE FROM ${this.table} where sid = @sid
        `);
      if (callback) {
        callback();
      }
    }
    catch(err) {
      this.errorhandler(err, callback);
    }
  }

  async deleteExpired() {
    try {
      await this.connectionCheck();

      const request = this.pool.request();
      await request
        .query(`
          DELETE FROM ${this.table} WHERE expires <= GETDATE()
        `);
    }
    catch(err) {
      this.errorhandler(err);
    }
  }

  private errorhandler(err: any, callback?: (err: any) => void) {
    if (callback) {
      callback(err);
    }
  }

  /**
   * Create a MSSQLSessionStore instance and automatically connect to the database
   * @param config 
   * @param options 
   * @returns MSSQLSessionStore instance
   */
  static async init(config: sql.config, options: StoreOptions) {
    const store = new MSSQLSessionStore(config, options);
    try {
      await store.connect();
      return store;
    }
    catch(err) {
      throw err;
    }
  }
}
