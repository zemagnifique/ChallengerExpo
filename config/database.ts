const createFetchPool = () => ({
  query: async (text, params) => {
    try {
      const response = await fetch(`http://0.0.0.0:8082/api/db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, params }),
      });
      if (!response.ok) {
        throw new Error('Database connection failed');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  },
});

const pool = createFetchPool();
module.exports = pool;