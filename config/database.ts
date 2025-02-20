
import { Pool } from 'pg';
import 'dotenv/config';

import buffer from 'buffer';

// Polyfill Buffer for web environment
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = buffer.Buffer;
    if (!(this instanceof BufferPolyfill)) {
      return new BufferPolyfill(arg, encodingOrOffset, length);
    }
    
    let buffer;
    if (typeof arg === 'number') {
      buffer = new Uint8Array(arg);
    } else if (arg instanceof Uint8Array) {
      buffer = new Uint8Array(arg);
    } else if (Array.isArray(arg) || typeof arg === 'string') {
      buffer = typeof arg === 'string' 
        ? new TextEncoder().encode(arg)
        : new Uint8Array(arg);
    } else {
      buffer = new Uint8Array(0);
    }

    Object.setPrototypeOf(buffer, BufferPolyfill.prototype);
    return buffer;
  };

  Object.setPrototypeOf(BufferPolyfill.prototype, Uint8Array.prototype);

  BufferPolyfill.from = function(value, encoding) {
    if (typeof value === 'string') {
      return new TextEncoder().encode(value);
    }
    return new Uint8Array(value);
  };

  BufferPolyfill.alloc = function(size, fill) {
    const buf = new Uint8Array(size);
    if (fill !== undefined) {
      buf.fill(fill);
    }
    return buf;
  };

  BufferPolyfill.allocUnsafe = function(size) {
    return new Uint8Array(size);
  };

  BufferPolyfill.isBuffer = function(obj) {
    return obj instanceof Uint8Array;
  };

  BufferPolyfill.prototype.write = function(string, offset = 0) {
    const bytes = new TextEncoder().encode(string);
    this.set(bytes, offset);
    return bytes.length;
  };

  BufferPolyfill.prototype.toString = function(encoding, start = 0, end = this.length) {
    return new TextDecoder().decode(this.slice(start, end));
  };

  BufferPolyfill.prototype.equals = function(other) {
    if (!(other instanceof Uint8Array)) return false;
    if (this.length !== other.length) return false;
    for (let i = 0; i < this.length; i++) {
      if (this[i] !== other[i]) return false;
    }
    return true;
  };

  globalThis.Buffer = BufferPolyfill;
  window.Buffer = BufferPolyfill;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@0.0.0.0:5432/postgres',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

export default pool;
