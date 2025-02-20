
import { Platform } from 'react-native';
import 'react-native-polyfill-globals/auto';
import { Buffer } from 'buffer';

if (typeof global !== 'undefined' && !global.Buffer) {
  global.Buffer = Buffer;
}

let pool;

if (Platform.OS === 'web') {
  // For web environment, use a fetch-based approach
  pool = {
    query: async (text, params) => {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: text,
          params,
        }),
      });
      return response.json();
    },
  };
} else {
  // For native environment, use regular pg with proper configuration
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@0.0.0.0:5432/postgres',
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });
}

export default pool;
