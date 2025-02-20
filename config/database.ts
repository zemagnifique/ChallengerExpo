
import { Platform } from 'react-native';
import { Buffer as BufferPolyfill } from 'buffer';

const globalBuffer = global.Buffer || BufferPolyfill;
if (typeof global !== 'undefined' && Platform.OS === 'web') {
  (global as any).Buffer = globalBuffer;
}

const createFetchPool = () => ({
  query: async (text: string, params?: any[]) => {
    const response = await fetch(`http://${window.location.hostname}:8082/api/db`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, params }),
    });
    const result = await response.json();
    return result;
  },
});

const pool = createFetchPool();
module.exports = pool;
