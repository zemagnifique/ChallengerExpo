require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'myappuser',
  host: 'localhost',
  database: 'challenges_app',
  password: 'mypassword',
  port: 5432,
});

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(uploadDir, { recursive: true });
}

// SQL queries to create tables
const createTablesQueries = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Challenges table
  `CREATE TABLE IF NOT EXISTS challenges (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    weekday VARCHAR(10), 
    proof_requirements TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    user_id INTEGER REFERENCES users(id),
    coach_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived BOOLEAN DEFAULT FALSE
  )`,

  // Messages table
  `CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER REFERENCES challenges(id),
    user_id INTEGER REFERENCES users(id),
    text TEXT,
    image_url TEXT,
    is_proof BOOLEAN DEFAULT FALSE,
    is_validated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
  )`,

  // Notifications table
  `CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  
  // Reminders table
  `CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER REFERENCES challenges(id),
    user_id INTEGER REFERENCES users(id),
    reminder_type VARCHAR(20) NOT NULL,
    next_reminder TIMESTAMP NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`
];

// Sample data for demonstration
const sampleDataQueries = [
  // Sample users (using plaintext passwords for demo only - in production use hashing)
  `INSERT INTO users (username, password) 
   VALUES 
   ('coach', 'password'),
   ('user', 'password')
   ON CONFLICT (username) DO NOTHING`,

  // Sample challenge
  `INSERT INTO challenges 
   (title, description, start_date, end_date, frequency, proof_requirements, status, user_id, coach_id)
   SELECT 
     'Daily Exercise Challenge', 
     'Exercise for at least 30 minutes every day', 
     CURRENT_DATE, 
     CURRENT_DATE + INTERVAL '30 days', 
     'Daily', 
     'Upload a photo or screenshot of your exercise tracker', 
     'active', 
     (SELECT id FROM users WHERE username = 'user'), 
     (SELECT id FROM users WHERE username = 'coach')
   WHERE EXISTS (SELECT 1 FROM users WHERE username = 'user')
     AND EXISTS (SELECT 1 FROM users WHERE username = 'coach')
   AND NOT EXISTS (
     SELECT 1 FROM challenges 
     WHERE title = 'Daily Exercise Challenge' 
       AND user_id = (SELECT id FROM users WHERE username = 'user')
   )`,
];

// Initialize database
async function initializeDatabase() {
  console.log('Starting database initialization...');

  try {
    // Create tables
    for (const query of createTablesQueries) {
      await pool.query(query);
      console.log('Table created or already exists.');
    }

    // Insert sample data
    for (const query of sampleDataQueries) {
      await pool.query(query);
      console.log('Sample data inserted or already exists.');
    }

    console.log('Database initialization complete!');
    console.log('You can now login with:');
    console.log('- Username: coach / Password: password (as a coach)');
    console.log('- Username: user / Password: password (as a challenger)');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close connection
    await pool.end();
  }
}

// Run initialization
initializeDatabase();
