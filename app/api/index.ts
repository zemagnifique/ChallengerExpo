
const express = require('express');
const cors = require('cors');
const dbRouter = require('./db.ts');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount database router
app.use('/api/db', dbRouter);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running',
    status: 'ok',
    endpoints: {
      root: '/',
      health: '/health',
      db: '/api/db'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

let server;

const startServer = (port) => {
  if (server) {
    return Promise.resolve(server);
  }

  return new Promise((resolve, reject) => {
    try {
      server = app.listen(port, '0.0.0.0', () => {
        console.log(`API server running on port ${port}`);
        resolve(server);
      });

      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.log(`Port ${port} is in use, trying ${port + 1}`);
          server = null;
          resolve(startServer(port + 1));
        } else {
          reject(error);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

if (require.main === module) {
  startServer(8082);
}

module.exports = { app, startServer };
