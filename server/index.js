const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 3001;
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("Client connected with ID:", socket.id);

  socket.on("joinRoom", (challenge_id) => {
    socket.join(`challenge_${challenge_id}`);
    console.log(`Client ${socket.id} joined room: challenge_${challenge_id}`);
  });

  socket.on("leaveRoom", (challenge_id) => {
    socket.leave(`challenge_${challenge_id}`);
    console.log(`Client ${socket.id} left room: challenge_${challenge_id}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Client ${socket.id} disconnected. Reason: ${reason}`);
  });
});

// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configure CORS
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.json());

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT id, username FROM users WHERE username = $1 AND password = $2",
      [username, password],
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username FROM users ORDER BY username ASC",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all challenges
app.get("/api/challenges", async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const result = await pool.query(
      "SELECT * FROM challenges WHERE user_id = $1 OR coach_id = $1 ORDER BY created_at DESC",
      [user_id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new challenge
app.post("/api/challenges", async (req, res) => {
  const {
    title,
    description,
    startDate,
    endDate,
    frequency,
    proofRequirements,
    user_id,
    coachId,
  } = req.body;

  // Validate required fields
  if (
    !title ||
    !description ||
    !startDate ||
    !endDate ||
    !frequency ||
    !proofRequirements ||
    !user_id ||
    !coachId
  ) {
    return res.status(400).json({
      error: "Missing required fields",
      required: [
        "title",
        "description",
        "startDate",
        "endDate",
        "frequency",
        "proofRequirements",
        "user_id",
        "coachId",
      ],
    });
  }

  try {
    // Validate users exist
    const userCheck = await pool.query(
      "SELECT id FROM users WHERE id = $1 OR id = $2",
      [user_id, coachId],
    );
    if (userCheck.rows.length < 2) {
      return res.status(400).json({ error: "Invalid user or coach ID" });
    }

    const result = await pool.query(
      `INSERT INTO challenges (title, description, start_date, end_date, frequency, proof_requirements, status, user_id, coach_id, created_at, archived)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), false)
       RETURNING *`,
      [
        title,
        description,
        startDate,
        endDate,
        frequency,
        proofRequirements,
        "pending",
        user_id,
        coachId,
      ],
    );

    if (result.rows.length === 0) {
      throw new Error("No rows returned after insert");
    }

    const challenge = {
      ...result.rows[0],
      id: result.rows[0].id.toString(),
      user_id: result.rows[0].user_id,
      coachId: result.rows[0].coach_id,
      startDate: result.rows[0].start_date,
      endDate: result.rows[0].end_date,
      createdAt: result.rows[0].created_at,
    };

    res.status(201).json(challenge);
  } catch (error) {
    console.error("Error creating challenge:", error);
    const errorMessage =
      error.code === "23505"
        ? "Duplicate challenge"
        : error.code === "23503"
          ? "Referenced user not found"
          : "Internal server error";
    res.status(500).json({ error: errorMessage, details: error.message });
  }
});

// Get messages for a challenge
// Get username by id
app.get("/api/users/username", async (req, res) => {
  try {
    const userId = parseInt(req.query.user_id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const result = await pool.query(
      "SELECT username FROM users WHERE id = $1",
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/challenges/:challenge_id/messages", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, challenge_id, user_id, text, image_url, is_proof, is_validated, created_at, is_read FROM messages WHERE challenge_id = $1 ORDER BY created_at ASC",
      [req.params.challenge_id],
    );

    const messages = result.rows.map((msg) => ({
      id: msg.id,
      text: msg.text,
      user_id: msg.user_id,
      imageUrl: msg.image_url,
      isProof: msg.is_proof,
      isValidated: msg.is_validated,
      timestamp: msg.created_at,
      is_read: msg.is_read,
    }));

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update challenge status
app.put("/api/challenges/:challenge_id/status", async (req, res) => {
  const { status } = req.body;

  try {
    const result = await pool.query(
      "UPDATE challenges SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.challenge_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    // Emit status update to all clients in the challenge room
    io.to(`challenge_${req.params.challenge_id}`).emit(
      "challengeStatusUpdated",
      {
        challenge_id: req.params.challenge_id,
        status,
      },
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating challenge status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a message to a challenge
app.post("/api/challenges/:challenge_id/messages", async (req, res) => {
  const { user_id, text, imageUrl, isProof } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO messages (challenge_id, user_id, text, image_url, is_proof, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [req.params.challenge_id, user_id, text, imageUrl, isProof],
    );

    // Get all messages after inserting new one
    const messagesResult = await pool.query(
      "SELECT * FROM messages WHERE challenge_id = $1 ORDER BY created_at ASC",
      [req.params.challenge_id],
    );

    const messages = messagesResult.rows.map((msg) => ({
      ...msg,
      timestamp: msg.created_at,
      success: true,
    }));

    // Emit all messages to clients in the challenge room
    io.to(`challenge_${req.params.challenge_id}`).emit(
      "updateMessages",
      messages,
    );

    res.status(201).json({ success: true, message: result.rows[0] });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update message validation status
app.put("/api/messages/:messageId/validate", async (req, res) => {
  const { isValidated } = req.body;

  try {
    const result = await pool.query(
      "UPDATE messages SET is_validated = $1, is_read = false WHERE id = $2 RETURNING *",
      [isValidated, req.params.messageId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/challenges/:challenge_id/messages/read", async (req, res) => {
  const { user_id } = req.body;

  try {
    const result = await pool.query(
      "UPDATE messages SET is_read = true WHERE challenge_id = $1 AND user_id != $2 RETURNING *",
      [req.params.challenge_id, user_id],
    );

    // Emit socket event when messages are marked as read
    io.to(`challenge_${req.params.challenge_id}`).emit("messagesRead", {
      challenge_id: req.params.challenge_id,
      user_id: user_id,
    });

    res.json(result.rows);
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Set message as proof
app.put("/api/messages/:messageId/set-proof", async (req, res) => {
  const { isProof } = req.body;
  console.log(`Attempting to set proof status for message ${req.params.messageId} to ${isProof}`);

  try {
    console.log("Running update query with params:", [isProof, parseInt(req.params.messageId)]);
    // Update the message proof status and mark as unread
    const messageResult = await pool.query(
      "UPDATE messages SET is_proof = $1, is_read = false WHERE id = $2 RETURNING *",
      [isProof, parseInt(req.params.messageId)]
    );

    if (messageResult.rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Get the challenge_id from the message
    const challengeId = messageResult.rows[0].challenge_id;

    // Get all messages for this challenge
    const messagesResult = await pool.query(
      "SELECT * FROM messages WHERE challenge_id = $1 ORDER BY created_at ASC",
      [challengeId]
    );

    const messages = messagesResult.rows.map(msg => ({
      ...msg,
      timestamp: msg.created_at,
      success: true
    }));

    console.log(`Broadcasting updated messages to room challenge_${challengeId}`);
    console.log("Updated message data:", messageResult.rows[0]);
    
    // Emit updated messages to all clients in the challenge room
    io.to(`challenge_${challengeId}`).emit('updateMessages', messages);

    console.log("WebSocket broadcast complete");
    res.json(messageResult.rows[0]);
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`API Server running on port ${PORT}`);
});