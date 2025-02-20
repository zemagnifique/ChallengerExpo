
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock data for initial testing
let challenges = [
  {
    id: '1',
    title: 'Daily Exercise',
    description: '30 minutes of exercise every day',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    frequency: 'Daily',
    proofRequirements: 'Photo or screenshot of workout completion',
    status: 'pending',
    userId: 'user1',
    coachId: 'user2',
    createdAt: new Date()
  }
];

// Define routes
app.get('/api/challenges', (req, res) => {
  res.json(challenges);
});

app.post('/api/challenges', (req, res) => {
  const challenge = { ...req.body, id: Date.now().toString() };
  challenges.push(challenge);
  res.status(201).json(challenge);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Server running on port ${PORT}`);
});
