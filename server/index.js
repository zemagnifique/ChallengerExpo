
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3001;

// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT id, username FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all challenges
app.get('/api/challenges', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM challenges ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new challenge
app.post('/api/challenges', async (req, res) => {
  const { title, description, startDate, endDate, frequency, proofRequirements, userId, coachId } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO challenges (title, description, start_date, end_date, frequency, proof_requirements, status, user_id, coach_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [title, description, startDate, endDate, frequency, proofRequirements, 'pending', userId, coachId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages for a challenge
app.get('/api/challenges/:challengeId/messages', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM messages WHERE challenge_id = $1 ORDER BY created_at ASC',
      [req.params.challengeId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a message to a challenge
app.post('/api/challenges/:challengeId/messages', async (req, res) => {
  const { userId, text, imageUrl, isProof } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO messages (challenge_id, user_id, text, image_url, is_proof, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [req.params.challengeId, userId, text, imageUrl, isProof]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update message validation status
app.put('/api/messages/:messageId/validate', async (req, res) => {
  const { isValidated } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE messages SET is_validated = $1 WHERE id = $2 RETURNING *',
      [isValidated, req.params.messageId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Server running on port ${PORT}`);
});
