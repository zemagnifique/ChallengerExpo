
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3001;

// Hardcoded users for initial testing
const USERS = {
  'user1': { id: 'user1', username: 'user1', password: 'user1' },
  'user2': { id: 'user2', username: 'user2', password: 'user2' },
  'user3': { id: 'user3', username: 'user3', password: 'user3' }
};

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
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS[username];

  if (user && user.password === password) {
    // Remove password before sending user data
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Server running on port ${PORT}`);
});
