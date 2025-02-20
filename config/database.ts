
import { Pool } from 'pg';
import 'dotenv/config';

// Polyfill Buffer for web environment
if (typeof window !== 'undefined' && !window.Buffer) {
  const BufferClass = function(arg: any, encodingOrOffset?: string | number, length?: number) {
    if (!(this instanceof BufferClass)) {
      return new BufferClass(arg, encodingOrOffset, length);
    }
    
    let buffer: Uint8Array;
    if (typeof arg === 'number') {
      buffer = new Uint8Array(arg);
    } else if (arg instanceof Uint8Array) {
      buffer = arg;
    } else if (Array.isArray(arg) || typeof arg === 'string') {
      buffer = typeof arg === 'string' 
        ? new Uint8Array(arg.split('').map(c => c.charCodeAt(0)))
        : new Uint8Array(arg);
    } else {
      buffer = new Uint8Array(0);
    }

    Object.setPrototypeOf(buffer, BufferClass.prototype);
    return buffer;
  } as any;

  Object.setPrototypeOf(BufferClass.prototype, Uint8Array.prototype);

  BufferClass.prototype.write = function(string: string, offset?: number) {
    const bytes = new Uint8Array(string.split('').map(c => c.charCodeAt(0)));
    this.set(bytes, offset || 0);
    return bytes.length;
  };

  BufferClass.prototype.toString = function(encoding?: string, start?: number, end?: number) {
    start = start || 0;
    end = end || this.length;
    return Array.from(this.slice(start, end))
      .map(byte => String.fromCharCode(byte))
      .join('');
  };

  BufferClass.from = function(value: string | Array<number> | Uint8Array, encoding?: string) {
    if (typeof value === 'string') {
      return new BufferClass(value.split('').map(c => c.charCodeAt(0)));
    }
    return new BufferClass(value);
  };

  BufferClass.alloc = function(size: number, fill?: number) {
    const buf = new BufferClass(size);
    if (fill !== undefined) {
      buf.fill(fill);
    }
    return buf;
  };

  BufferClass.allocUnsafe = function(size: number) {
    return new BufferClass(size);
  };

  BufferClass.isBuffer = function(obj: any) {
    return obj instanceof BufferClass;
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
