
import { Pool } from 'pg';
import 'dotenv/config';

// Polyfill Buffer for web environment
if (typeof window !== 'undefined' && !window.Buffer) {
  const buffer = new Uint8Array(0);
  buffer.constructor.from = (value: string | Array<number> | Uint8Array, encoding?: string) => {
    if (typeof value === 'string') {
      return Uint8Array.from(value, c => c.charCodeAt(0));
    }
    return new Uint8Array(value);
  };
  buffer.constructor.alloc = (size: number) => new Uint8Array(size);
  buffer.constructor.allocUnsafe = (size: number) => new Uint8Array(size);
  buffer.constructor.isBuffer = (obj: any) => obj instanceof Uint8Array;
  buffer.constructor.prototype.toString = function(encoding?: string, start?: number, end?: number) {
    return Array.from(this).map(b => String.fromCharCode(b)).join('');
  };
  buffer.constructor.prototype.write = function(string: string, offset?: number) {
    const bytes = Uint8Array.from(string, c => c.charCodeAt(0));
    this.set(bytes, offset || 0);
    return bytes.length;
  };
  window.Buffer = buffer.constructor as any;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@0.0.0.0:5432/postgres',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

export default pool;
