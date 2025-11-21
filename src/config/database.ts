import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { config } from './index';
import logger from '../utils/logger';

class Database {
  private pool: Pool;

  constructor() {
    // Use DATABASE_URL if available (for production), otherwise use individual config
    const poolConfig = config.database.url
      ? {
          connectionString: config.database.url,
          max: config.database.max,
          idleTimeoutMillis: config.database.idleTimeoutMillis,
          connectionTimeoutMillis: config.database.connectionTimeoutMillis,
        }
      : {
          host: config.database.host,
          port: config.database.port,
          database: config.database.name,
          user: config.database.user,
          password: config.database.password,
          max: config.database.max,
          idleTimeoutMillis: config.database.idleTimeoutMillis,
          connectionTimeoutMillis: config.database.connectionTimeoutMillis,
        };
    
    this.pool = new Pool(poolConfig);

    // Test connection on initialization
    this.pool.on('connect', () => {
      logger.info('Database connection established');
    });

    this.pool.on('error', (err: Error) => {
      logger.error('Unexpected database error:', err);
    });
  }

  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      logger.debug('Executed query', { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      logger.error('Database query error:', { text, error });
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
    logger.info('Database connection pool closed');
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW()');
      logger.info('Database connection test successful:', result.rows[0]);
      return true;
    } catch (error) {
      logger.error('Database connection test failed:', error);
      return false;
    }
  }
}

export const db = new Database();
export default db;
