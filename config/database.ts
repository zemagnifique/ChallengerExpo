
import { Platform } from 'react-native';

// Custom type for database interface
interface DatabasePool {
  query: (text: string, params?: any[]) => Promise<any>;
}

// For mobile environment or web, use fetch API
const createFetchPool = (): DatabasePool => ({
  query: async (text: string, params?: any[]) => {
    const response = await fetch('http://0.0.0.0:3000/api/db', {
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

export default pool;
