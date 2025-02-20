
const express = require('express');
const cors = require('cors');
const dbRouter = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/db', dbRouter);

const server = app.listen(8082, '0.0.0.0', () => {
  console.log('API server running on port 8082');
});

process.on('SIGTERM', () => {
  server.close();
});

module.exports = app;
