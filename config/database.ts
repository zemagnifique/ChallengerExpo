import { Pool } from 'pg';
import 'dotenv/config';
import buffer from 'buffer';

// Polyfill Buffer for web environment
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = buffer.Buffer;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@0.0.0.0:5432/postgres',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

export default pool;