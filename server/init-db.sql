
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  frequency VARCHAR(255),
  proof_requirements TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  user_id VARCHAR(255) REFERENCES users(id),
  coach_id VARCHAR(255) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  archived BOOLEAN DEFAULT FALSE
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER REFERENCES challenges(id),
  user_id VARCHAR(255) REFERENCES users(id),
  text TEXT,
  image_url TEXT,
  is_proof BOOLEAN DEFAULT FALSE,
  is_validated BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test users
INSERT INTO users (id, username, password) 
VALUES 
  ('1', 'user1', 'user1'),
  ('2', 'user2', 'user2'),
  ('3', 'user3', 'user3')
ON CONFLICT (username) DO NOTHING;
