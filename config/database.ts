
import { Platform } from 'react-native';

let pool;

if (Platform.OS === 'web') {
  // For web environment, use a connection string approach
  const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@0.0.0.0:5432/postgres';
  
  // Use fetch API for web requests
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
  // For native environment, use regular pg
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@0.0.0.0:5432/postgres',
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });
}

export default pool;
