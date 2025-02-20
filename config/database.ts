
import { Pool } from 'pg';
import 'dotenv/config';

// Polyfill Buffer for web environment
if (typeof window !== 'undefined' && !window.Buffer) {
  const BufferPolyfill = function(arg: any) {
    if (arg instanceof Uint8Array) return arg;
    if (typeof arg === 'number') return new Uint8Array(arg);
    return Uint8Array.from(arg);
  } as any;

  BufferPolyfill.prototype = Uint8Array.prototype;
  BufferPolyfill.from = function(value: string | Array<number> | Uint8Array, encoding?: string): Uint8Array {
    if (typeof value === 'string') {
      return new Uint8Array(Array.from(value).map(ch => ch.charCodeAt(0)));
    }
    return new Uint8Array(value);
  };
  BufferPolyfill.alloc = function(size: number): Uint8Array {
    return new Uint8Array(size);
  };
  BufferPolyfill.allocUnsafe = BufferPolyfill.alloc;
  BufferPolyfill.isBuffer = function(obj: any): boolean {
    return obj instanceof Uint8Array;
  };
  BufferPolyfill.prototype.write = function(string: string, offset?: number): number {
    const bytes = Uint8Array.from(string, c => c.charCodeAt(0));
    this.set(bytes, offset || 0);
    return bytes.length;
  };

  window.Buffer = BufferPolyfill;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@0.0.0.0:5432/postgres',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

export default pool;
