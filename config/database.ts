
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.REPLIT_DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;
