
import { DatabaseModels } from '../models/database';

async function initUsers() {
  try {
    await DatabaseModels.createUser('user1', 'user1');
    await DatabaseModels.createUser('user2', 'user2');
    console.log('Users initialized successfully');
  } catch (error) {
    console.error('Error initializing users:', error);
  }
}

initUsers();
