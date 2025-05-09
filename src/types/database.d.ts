import { Pool } from 'pg';

declare module '../boot/database/db_connect' {
  const pool: Pool;
  export default pool;
} 