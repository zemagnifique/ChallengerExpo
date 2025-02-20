
import { DatabaseModels } from '../models/database';

async function initChallengesAndMessages() {
  try {
    // Create challenges for user1 with user2 as coach
    const challenge1 = await DatabaseModels.createChallenge({
      title: "30 Days Workout Challenge",
      description: "Complete daily workout routines for 30 days",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      frequency: "daily",
      proofRequirements: "Photo or video of workout completion",
      status: "active",
      userId: "1", // user1
      coachId: "2"  // user2
    });

    const challenge2 = await DatabaseModels.createChallenge({
      title: "Healthy Eating Challenge",
      description: "Eat clean and track all meals",
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      frequency: "daily",
      proofRequirements: "Photos of prepared meals",
      status: "active",
      userId: "1", // user1
      coachId: "2"  // user2
    });

    // Add messages and proofs to the workout challenge
    await DatabaseModels.createMessage({
      challengeId: challenge1.id,
      userId: "1",
      text: "Started my first workout today!",
      image: "https://example.com/workout1.jpg",
      isProof: true,
      isValidated: true
    });

    await DatabaseModels.createMessage({
      challengeId: challenge1.id,
      userId: "2",
      text: "Great form! Keep it up!",
      isProof: false,
      isValidated: false
    });

    // Add messages and proofs to the eating challenge
    await DatabaseModels.createMessage({
      challengeId: challenge2.id,
      userId: "1",
      text: "My healthy lunch for today",
      image: "https://example.com/meal1.jpg",
      isProof: true,
      isValidated: false
    });

    await DatabaseModels.createMessage({
      challengeId: challenge2.id,
      userId: "2",
      text: "Remember to include more protein in your meals",
      isProof: false,
      isValidated: false
    });

    console.log('Challenges and messages initialized successfully');
  } catch (error) {
    console.error('Error initializing challenges and messages:', error);
  }
}

initChallengesAndMessages();
