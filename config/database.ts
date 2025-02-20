
const { Pool } = require('pg');

const createFetchPool = () => ({
  query: async (text, params) => {
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

const pool = createFetchPool();

module.exports = pool;
