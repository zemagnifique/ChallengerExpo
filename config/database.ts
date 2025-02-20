const { Buffer } = require('buffer');
global.Buffer = Buffer;

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