
import { Platform } from 'react-native';

// Custom type for database interface
interface DatabasePool {
  query: (text: string, params?: any[]) => Promise<any>;
}

let pool: DatabasePool;

if (Platform.OS === 'web') {
  // For web environment, use fetch API
  pool = {
    query: async (text: string, params?: any[]) => {
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
  // For native environment, use pg with proper configuration
  const { Pool } = require('pg');
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@0.0.0.0:5432/postgres';
  
  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });
}

export default pool;
