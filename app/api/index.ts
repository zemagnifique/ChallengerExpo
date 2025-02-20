
import express from 'express';
import dbRouter from './db';

const app = express();
app.use(express.json());

app.use('/api/db', dbRouter);

app.listen(3000, '0.0.0.0', () => {
  console.log('API server running on port 3000');
});

export default app;
