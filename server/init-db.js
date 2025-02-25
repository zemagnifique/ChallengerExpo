require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/challenges_app'
});

async function initDatabase() {
  try {
    const sqlFile = path.join(__dirname, 'init-db.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    await pool.query(sql);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

initDatabase();
