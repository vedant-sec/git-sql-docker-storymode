import sqlJsFactory, { Database } from 'sql.js';
import { QueryResult, TableSchema } from '../../types/sql';
import { SCHEMA_SQL, SEED_SQL } from './seedData';

export class SqlEngine {
  private db: Database | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private initError: string | null = null;

  isReady(): boolean {
    return this.isInitialized && this.db !== null;
  }

  async init(): Promise<void> {
    if (this.isInitialized && this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const initFn: any =
          typeof sqlJsFactory === 'function'
            ? sqlJsFactory
            : (sqlJsFactory as any)?.default || (window as any)?.initSqlJs;

        if (!initFn) {
          throw new Error('sql.js initialization function could not be resolved.');
        }

        const SQL = await initFn({
          locateFile: (file: string) => {
            if (typeof window !== 'undefined') {
              const base = (typeof import.meta !== 'undefined' && (import.meta as any).env?.BASE_URL) || '/';
              const cleanBase = base.endsWith('/') ? base : `${base}/`;
              return `${cleanBase}${file}`;
            }
            return `./public/${file}`;
          }
        });

        const dbInstance = new SQL.Database();
        dbInstance.run(SCHEMA_SQL);
        dbInstance.run(SEED_SQL);
        this.db = dbInstance;
        this.isInitialized = true;
        this.initError = null;
      } catch (err: any) {
        this.initPromise = null;
        this.initError = err?.message || String(err);
        console.error('Failed to initialize sql.js:', err);
        throw new Error(`Failed to initialize SQLite engine: ${err.message}`);
      }
    })();

    return this.initPromise;
  }

  async reset(): Promise<void> {
    this.isInitialized = false;
    this.initPromise = null;
    this.initError = null;
    if (this.db) {
      try {
        this.db.close();
      } catch (e) {
        console.warn('Error closing database during reset:', e);
      }
      this.db = null;
    }
    await this.init();
  }

  executeQuery(query: string): QueryResult {
    if (!this.db) {
      return {
        columns: [],
        values: [],
        error: this.initError
          ? `Database engine failed to initialize: ${this.initError}`
          : 'Database engine not initialized. Please wait...',
        rowCount: 0
      };
    }

    const trimmed = query.trim().replace(/;+$/, '');
    if (!trimmed) {
      return {
        columns: [],
        values: [],
        rowCount: 0
      };
    }

    const startTime = performance.now();
    try {
      const res = this.db.exec(trimmed);
      const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

      if (!res || res.length === 0) {
        return {
          columns: [],
          values: [],
          rowCount: 0,
          executionTimeMs
        };
      }

      const firstRes = res[0];
      return {
        columns: firstRes.columns,
        values: firstRes.values,
        rowCount: firstRes.values.length,
        executionTimeMs
      };
    } catch (err: any) {
      return {
        columns: [],
        values: [],
        error: err.message || 'SQL execution error',
        rowCount: 0
      };
    }
  }

  getSchema(): TableSchema[] {
    if (!this.db) return [];

    const tables: TableSchema[] = [];
    const tableNamesRes = this.executeQuery(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    );

    for (const row of tableNamesRes.values) {
      const tableName = String(row[0]);
      const colInfoRes = this.executeQuery(`PRAGMA table_info(${tableName});`);
      const countRes = this.executeQuery(`SELECT COUNT(*) FROM ${tableName};`);

      const columns = colInfoRes.values.map(col => ({
        name: String(col[1]),
        type: String(col[2]),
        primaryKey: Boolean(col[5])
      }));

      const sampleCount = countRes.values.length > 0 ? Number(countRes.values[0][0]) : 0;

      tables.push({
        name: tableName,
        columns,
        sampleCount
      });
    }

    return tables;
  }
}

export const globalSqlEngine = new SqlEngine();
