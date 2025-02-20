import pool from '../config/database';

export const DatabaseModels = {
  async createUser(username: string, password: string) {
    try {
      const result = await pool.query(
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
        [username, password]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },

  async getUser(username: string) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async createChallenge(challenge: any) {
    try {
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
    } catch (error) {
      console.error('Error creating challenge:', error);
      return null;
    }
  },

  async getChallenges(userId: string) {
    try {
      const result = await pool.query(
        'SELECT * FROM challenges WHERE user_id = $1 OR coach_id = $1',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting challenges:', error);
      return [];
    }
  },

  async updateChallenge(id: string, challenge: any) {
    try {
      const result = await pool.query(
        `UPDATE challenges 
         SET title = $1, description = $2, status = $3, archived = $4
         WHERE id = $5 
         RETURNING *`,
        [challenge.title, challenge.description, challenge.status, challenge.archived, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating challenge:', error);
      return null;
    }
  },

  async createMessage(message: any) {
    try {
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
    } catch (error) {
      console.error('Error creating message:', error);
      return null;
    }
  },

  async getMessages(challengeId: string) {
    try {
      const result = await pool.query(
        'SELECT * FROM messages WHERE challenge_id = $1 ORDER BY created_at ASC',
        [challengeId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }
};