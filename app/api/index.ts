const express = require('express');
const cors = require('cors');
const dbRouter = require('./db.ts');

const app = express();

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
};

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the API',
    status: 'running',
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

app.use('/api/db', dbRouter);

const startServer = (port) => {
  try {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`API server running on port ${port}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying ${port + 1}`);
        startServer(port + 1);
      }
    });

    process.on('SIGTERM', () => {
      server.close();
    });
  } catch (error) {
    console.error('Server error:', error);
  }
};

startServer(8082);

process.on('SIGTERM', () => {
  server.close();
});

module.exports = app;