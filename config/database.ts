
const { Pool } = require('pg');

interface DatabasePool {
  query: (text: string, params?: any[]) => Promise<any>;
}

const createFetchPool = (): DatabasePool => ({
  query: async (text: string, params?: any[]) => {
    const response = await fetch('http://0.0.0.0:8082/api/db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: text,
        params,
      }),
    });
    if (!response.ok) {
      throw new Error(`Database query failed: ${response.statusText}`);
    }
    return response.json();
  },
});

const pool: DatabasePool = createFetchPool();

module.exports = { default: pool };
