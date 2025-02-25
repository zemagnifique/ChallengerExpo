const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

// Ensure uploads directory exists with proper permissions
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log(`Creating uploads directory at: ${uploadsDir}`);
  try {
    fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
    console.log('Uploads directory created successfully');
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
} else {
  console.log(`Uploads directory already exists at: ${uploadsDir}`);
  // Ensure directory has correct permissions
  try {
    fs.chmodSync(uploadsDir, 0o755);
    console.log('Uploads directory permissions updated');
  } catch (error) {
    console.error('Error setting uploads directory permissions:', error);
  }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    // Get the extension from the original filename or default to .jpg
    let ext = path.extname(file.originalname);
    if (!ext) {
      console.log("No extension found in filename, defaulting to .jpg");
      ext = '.jpg';
    }
    
    const filename = uniqueSuffix + ext;
    console.log(`Generated filename: ${filename}`);
    cb(null, filename);
  }
});

// Configure multer with less strict validation for React Native
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    console.log("Received file:", file);
    
    // Accept images with either extension or mimetype check
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    
    if (validMimeTypes.includes(file.mimetype) || 
        file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      console.log("File accepted:", file.originalname);
      return cb(null, true);
    }
    
    console.log("File rejected:", file.originalname, file.mimetype);
    return cb(new Error('Only image files are allowed!'), false);
  }
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
  user: 'myappuser',
  host: 'localhost',
  database: 'challenges_app',
  password: 'mypassword',  // Change to your actual password
  port: 5432,
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

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  // Set proper MIME types
  setHeaders: (res, path) => {
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    }
    // Enable caching for images
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

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

// File upload endpoint
app.post("/api/upload", (req, res) => {
  console.log("📸 Upload request received");
  console.log("Headers:", JSON.stringify(req.headers));
  
  // Log incoming content-type for debugging
  console.log("Content-Type:", req.headers['content-type']);
  
  // Check if we have a multipart form
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    console.error("⚠️ Warning: Not a multipart/form-data request");
  }
  
  // We need to manually inspect the request before multer processes it
  // This helps us better understand what's coming from the client
  console.log("Processing upload request");
  
  // Use multer middleware with specific error handling
  console.log("Calling multer middleware...");
  const uploadMiddleware = upload.single('image');
  
  uploadMiddleware(req, res, function(err) {
    if (err) {
      console.error("❌ Multer error:", err);
      return res.status(400).json({ 
        error: err.message,
        type: err.name,
        code: err.code || 'UNKNOWN_ERROR' 
      });
    }
    
    // Debug the request after multer processing
    console.log("Request body after multer:", req.body);
    
    if (req.file) {
      console.log("Request file details:", {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
        size: req.file.size,
        destination: req.file.destination,
        filename: req.file.filename,
        path: req.file.path
      });
    } else {
      console.error("❌ No file in request - verify form field name is 'image'");
      
      // Log more detail about what was received
      console.log("Form fields received:", Object.keys(req.body || {}));
      if (req.body && req.body.image) {
        console.log("Image field content type:", typeof req.body.image);
        console.log("Image field value:", req.body.image);
        
        // If we received an object as a string, try to parse it
        if (typeof req.body.image === 'string' && req.body.image.startsWith('{')) {
          try {
            const parsedImage = JSON.parse(req.body.image);
            console.log("Parsed image field:", parsedImage);
            
            // If we have a uri property, we might be able to salvage this
            if (parsedImage.uri) {
              console.log("Found URI in parsed image object:", parsedImage.uri);
              // Here we could potentially fetch the file from the URI
              // but that's a more complex implementation
            }
          } catch (e) {
            console.log("Failed to parse image field as JSON");
          }
        }
      }
      
      return res.status(400).json({ 
        error: "No file uploaded",
        receivedFields: Object.keys(req.body || {}),
        contentType: req.headers['content-type'],
        help: "Ensure you're using 'image' as the field name and properly formatting the file object"
      });
    }
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      console.log("Creating uploads directory that doesn't exist");
      fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
    }
    
    // Ensure the file was saved correctly
    const filePath = `/uploads/${req.file.filename}`;
    const fullPath = path.join(__dirname, 'uploads', req.file.filename);
    
    console.log("✅ File saved to:", fullPath);
    
    if (!fs.existsSync(fullPath)) {
      console.error("❌ File was not saved correctly to disk");
      return res.status(500).json({ error: "File was not saved to disk" });
    }
    
    // Get file stats for debugging
    try {
      const stats = fs.statSync(fullPath);
      console.log("📊 File stats:", {
        size: stats.size,
        created: stats.birthtime,
        permissions: stats.mode.toString(8)
      });
    } catch (error) {
      console.error("Error reading file stats:", error);
    }
    
    // Return successful response with file info
    console.log("✅ Upload successful, returning response");
    res.status(200).json({ 
      success: true, 
      imageUrl: filePath,
      fileInfo: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: filePath
      }
    });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`API Server running on port ${PORT}`);
});