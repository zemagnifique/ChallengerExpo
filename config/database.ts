
import { Pool } from 'pg';
import 'dotenv/config';

// Polyfill Buffer for web environment
if (typeof window !== 'undefined' && !window.Buffer) {
  const BufferClass = function(arg: any, encodingOrOffset?: string | number, length?: number): Uint8Array {
    if (arg instanceof Uint8Array) return arg;
    if (typeof arg === 'number') return new Uint8Array(arg);
    return Uint8Array.from(typeof arg === 'string' ? arg.split('').map(c => c.charCodeAt(0)) : arg);
  } as any;

  BufferClass.prototype = Uint8Array.prototype;
  
  BufferClass.from = function(value: string | Array<number> | Uint8Array, encoding?: string): Uint8Array {
    if (typeof value === 'string') {
      return new Uint8Array(value.split('').map(c => c.charCodeAt(0)));
    }
    return new Uint8Array(value);
  };
  
  BufferClass.alloc = function(size: number, fill?: string | number, encoding?: string): Uint8Array {
    const buffer = new Uint8Array(size);
    if (fill !== undefined) {
      buffer.fill(typeof fill === 'string' ? fill.charCodeAt(0) : fill);
    }
    return buffer;
  };
  
  BufferClass.allocUnsafe = function(size: number): Uint8Array {
    return new Uint8Array(size);
  };
  
  BufferClass.isBuffer = function(obj: any): boolean {
    return obj instanceof Uint8Array;
  };
  
  BufferClass.prototype.write = function(string: string, offset?: number): number {
    const bytes = Uint8Array.from(string.split('').map(c => c.charCodeAt(0)));
    this.set(bytes, offset || 0);
    return bytes.length;
  };
  
  BufferClass.prototype.toString = function(encoding?: string, start?: number, end?: number): string {
    start = start || 0;
    end = end || this.length;
    return String.fromCharCode.apply(null, Array.from(this.slice(start, end)));
  };

  // @ts-ignore
  globalThis.Buffer = BufferClass;
  window.Buffer = BufferClass;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@0.0.0.0:5432/postgres',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

export default pool;
