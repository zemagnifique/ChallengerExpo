
import { Router } from 'express';
import pool from '../../config/database';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { query, params } = req.body;
    const result = await pool.query(query, params);
    res.json(result);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

export default router;
