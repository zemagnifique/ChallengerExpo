
import pool from '../config/database';

export const DatabaseModels = {
  async createUser(username: string, password: string) {
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
      [username, password]
    );
    return result.rows[0];
  },

  async getUser(username: string) {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  },

  async createChallenge(challenge: any) {
    const result = await pool.query(
      `INSERT INTO challenges 
       (title, description, start_date, end_date, frequency, proof_requirements, status, user_id, coach_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        challenge.title,
        challenge.description,
        challenge.startDate,
        challenge.endDate,
        challenge.frequency,
        challenge.proofRequirements,
        challenge.status,
        challenge.userId,
        challenge.coachId
      ]
    );
    return result.rows[0];
  },

  async getChallenges(userId: string) {
    const result = await pool.query(
      'SELECT * FROM challenges WHERE user_id = $1 OR coach_id = $1',
      [userId]
    );
    return result.rows;
  },

  async updateChallenge(id: string, challenge: any) {
    const result = await pool.query(
      `UPDATE challenges 
       SET title = $1, description = $2, status = $3, archived = $4
       WHERE id = $5 
       RETURNING *`,
      [challenge.title, challenge.description, challenge.status, challenge.archived, id]
    );
    return result.rows[0];
  },

  async createMessage(message: any) {
    const result = await pool.query(
      `INSERT INTO messages 
       (challenge_id, user_id, text, image_url, is_proof, is_validated) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        message.challengeId,
        message.userId,
        message.text,
        message.image,
        message.isProof,
        message.isValidated
      ]
    );
    return result.rows[0];
  },

  async getMessages(challengeId: string) {
    const result = await pool.query(
      'SELECT * FROM messages WHERE challenge_id = $1 ORDER BY created_at ASC',
      [challengeId]
    );
    return result.rows;
  }
};
