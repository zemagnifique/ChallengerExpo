#!/usr/bin/env node

/**
 * Start script for the Challenge Coaching API server
 * 
 * This script:
 * 1. Loads environment variables
 * 2. Ensures the uploads directory exists
 * 3. Checks if the database is initialized
 * 4. Starts the server
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { Pool } = require('pg');

// Default configuration
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const DB_CONFIG = {
  user: process.env.DB_USER || 'myappuser',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'challenges_app',
  password: process.env.DB_PASSWORD || 'mypassword',
  port: parseInt(process.env.DB_PORT || '5432'),
};

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function checkDatabaseConnection() {
  const pool = new Pool(DB_CONFIG);
  try {
    console.log('Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('Database connection successful');
    
    // Check if users table exists
    const tablesResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);
    
    if (!tablesResult.rows[0].exists) {
      console.log('Database tables not found. Running initialization script...');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    console.log('Initializing database...');
    const initProcess = spawn('node', ['init-db.js'], { 
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    initProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Database initialized successfully');
        resolve();
      } else {
        console.error(`Database initialization failed with code ${code}`);
        reject(new Error(`Database initialization failed with code ${code}`));
      }
    });
  });
}

async function startServer() {
  // Check database connection and initialize if needed
  const dbReady = await checkDatabaseConnection();
  if (!dbReady) {
    await initializeDatabase();
  }
  
  // Start the server
  console.log(`Starting server on ${HOST}:${PORT}...`);
  const serverProcess = spawn('node', ['index.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT,
      HOST
    }
  });
  
  serverProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Server exited with code ${code}`);
      process.exit(code);
    }
  });
  
  // Handle termination signals
  process.on('SIGINT', () => {
    console.log('Shutting down server...');
    serverProcess.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('Shutting down server...');
    serverProcess.kill('SIGTERM');
  });
}

// Run the server
startServer().catch(error => {
  console.error('Server startup failed:', error);
  process.exit(1);
}); 