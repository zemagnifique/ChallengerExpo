import { Platform } from 'react-native';

// Custom type for database interface
interface DatabasePool {
  query: (text: string, params?: any[]) => Promise<any>;
}

let pool: DatabasePool;

// For mobile environment or web, use fetch API
const createFetchPool = () => ({
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
});

pool = createFetchPool();

export default pool;