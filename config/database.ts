
const { Platform } = require('react-native');
const { Buffer: BufferPolyfill } = require('buffer');

const globalBuffer = global.Buffer || BufferPolyfill;
if (typeof global !== 'undefined' && Platform.OS === 'web') {
  global.Buffer = globalBuffer;
}

const createFetchPool = () => ({
  query: async (text, params) => {
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
