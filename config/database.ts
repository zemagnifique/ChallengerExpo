
import { Pool } from 'pg';
import 'dotenv/config';

// Polyfill Buffer for web environment
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = {
    from: (arr: string | Uint8Array) => {
      if (typeof arr === 'string') {
        return Uint8Array.from(arr, c => c.charCodeAt(0));
      }
      return arr;
    },
    isBuffer: (obj: any) => obj instanceof Uint8Array,
    alloc: (size: number) => new Uint8Array(size)
  };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@0.0.0.0:5432/postgres',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

export default pool;
