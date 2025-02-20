
const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');

router.post('/', async (req, res) => {
  const { text, params } = req.body;
  try {
    const result = await pool.query(text, params);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
