import { Pool, PoolConfig, types } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import logger from '../../middleware/winston';
import mongoose from 'mongoose';

const envFile = `.env.${process.env.NODE_ENV || 'dev'}`;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

interface DatabaseConfig extends PoolConfig {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
  max: number;
}

const db_config: DatabaseConfig = {
  user: process.env.DB_USER || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  password: process.env.DB_PASSWORD || '',
  port: 5432,
  max: 10,
};

let db_connection: Pool;

function startConnection(): void {
  // type parsers here
  types.setTypeParser(1082, (stringValue: string) => {
    return stringValue; // 1082 is for date type
  });

  db_connection = new Pool(db_config);

  db_connection.connect((_err: Error | null, _client: any) => {
    if (!_err) {
      logger.info('PostgreSQL Connected');
    } else {
      logger.error('PostgreSQL Connection Failed');
    }
  });

  db_connection.on('error', (_err: Error) => {
    logger.error('Unexpected error on idle client');
    startConnection();
  });
}

startConnection();

export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movies');
    logger.info('Connected to MongoDB');
  } catch (_err) {
    // Error parameter is required by try/catch but we only need to log a generic message
    logger.error('Error connecting to MongoDB');
    process.exit(1);
  }
};

export const connectToPostgres = async (): Promise<void> => {
  try {
    const _client = await db_connection.connect();
    logger.info('Connected to PostgreSQL');
  } catch (_err) {
    // Error parameter is required by try/catch but we only need to log a generic message
    logger.error('Error connecting to PostgreSQL');
    process.exit(1);
  }
};

export default db_connection; 