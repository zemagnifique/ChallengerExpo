import { Pool } from 'pg';
import 'dotenv/config';
import buffer from 'buffer';

// Polyfill Buffer for web environment
if (typeof window !== 'undefined' && !window.Buffer) {
  class BufferPolyfill extends Uint8Array {
    constructor(arg, encodingOrOffset, length) {
      if (typeof arg === 'number') {
        super(arg);
      } else if (arg instanceof Uint8Array) {
        super(arg);
      } else if (Array.isArray(arg) || typeof arg === 'string') {
        super(typeof arg === 'string' ? new TextEncoder().encode(arg) : arg);
      } else {
        super(0);
      }
    }

    static from(value, encoding) {
      return new TextEncoder().encode(value);
    }

    static alloc(size, fill) {
      const buf = new Uint8Array(size);
      if (fill !== undefined) {
        buf.fill(fill);
      }
      return buf;
    }

    static allocUnsafe(size) {
      return new Uint8Array(size);
    }

    static isBuffer(obj) {
      return obj instanceof Uint8Array;
    }

    write(string, offset = 0) {
      const bytes = new TextEncoder().encode(string);
      this.set(bytes, offset);
      return bytes.length;
    }

    toString(encoding, start = 0, end = this.length) {
      return new TextDecoder().decode(this.slice(start, end));
    }

    equals(other) {
      if (!(other instanceof Uint8Array)) return false;
      return this.length === other.length && this.every((byte, i) => byte === other[i]);
    }
  }

  window.Buffer = BufferPolyfill;
  globalThis.Buffer = BufferPolyfill;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@0.0.0.0:5432/postgres',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

export default pool;