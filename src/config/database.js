import pkg from 'pg';
import config from './environment.js';
import logger from '../utils/logger.js';

const { Pool } = pkg;

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  max: 20,
  // idleTimeoutMillis: 30000,
  // connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false, // accept self-signed certs
  },
  
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', { error: err.message });
});

pool.on('connect', () => {
  logger.debug('New database connection');
});

export const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn('Slow query detected', { duration, query: text.substring(0, 50) });
    }
    return result;
  } catch (error) {
    logger.error('Database query error', { error: error.message });
    throw error;
  }
};

export default pool;