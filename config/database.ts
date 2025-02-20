const createFetchPool = () => ({
  query: async (text, params) => {
    console.log('Database: Executing query:', text);
    try {
      console.log('Database: Sending request to API');
      const response = await fetch(`http://0.0.0.0:8082/api/db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, params }),
      });
      console.log('Database: Response status:', response.status);
      if (!response.ok) {
        throw new Error(`Database connection failed: ${response.status}`);
      }
      const result = await response.json();
      console.log('Database: Query result:', result);
      return result;
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  },
});

const pool = createFetchPool();
module.exports = pool;