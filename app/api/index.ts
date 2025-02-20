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

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/db', dbRouter);

const server = app.listen(8082, '0.0.0.0', () => {
  console.log('API server running on port 8082');
});

process.on('SIGTERM', () => {
  server.close();
});

module.exports = app;