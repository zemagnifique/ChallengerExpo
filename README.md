
# Challenge Coaching App

A React Native application built with Expo that facilitates coaching relationships and challenge management. The app enables users to create challenges, assign coaches, track progress, and communicate through a real-time chat system.

## Core Features

### 1. Authentication System
- User login/logout functionality
- Session management
- Secure authentication flow

### 2. Challenge Management
- Create new challenges with customizable:
  - Title and description
  - Start and end dates
  - Frequency (Daily/Weekly)
  - Proof requirements
  - Coach assignment
- View active and pending challenges
- Archive completed challenges
- Delete pending challenges
- Change coach for pending challenges

### 3. Real-time Chat System
- Instant messaging between coach and challenger
- Image sharing capabilities
- Message read status tracking
- Unread message count indicators
- Proof submission and validation:
  - Challengers can mark messages as proof
  - Coaches can validate submitted proofs
  - Visual indicators for proof status

### 4. Coach-Challenger Interaction
- Challenge acceptance/rejection by coaches
- Progress tracking
- Real-time notifications
- Status updates

### 5. User Interface
- Dark/Light theme support
- Responsive design
- Gesture support (swipe actions)
- Parallax scrolling effects
- Quick-start challenge templates

## Technical Architecture

### Frontend
- Built with React Native and Expo
- Uses Expo Router for navigation
- TypeScript for type safety
- Socket.IO client for real-time features
- Component-based architecture

### Backend
- Express.js server
- PostgreSQL database
- Socket.IO for real-time communication
- RESTful API endpoints

### Real-time Features
- WebSocket connections for instant updates
- Message delivery confirmation
- Online status tracking
- Live challenge status updates

### Data Storage
- PostgreSQL for persistent data
- AsyncStorage for local caching
- Efficient data synchronization

## API Endpoints

### Authentication
- POST `/api/login` - User authentication
- GET `/api/users` - Retrieve all users
- GET `/api/users/username` - Get username by ID

### Challenges
- GET `/api/challenges` - List user's challenges
- POST `/api/challenges` - Create new challenge
- PUT `/api/challenges/:id/status` - Update challenge status

### Messages
- GET `/api/challenges/:id/messages` - Get challenge messages
- POST `/api/challenges/:id/messages` - Send new message
- PUT `/api/challenges/:id/messages/read` - Mark messages as read
- PUT `/api/messages/:id/validate` - Validate proof message
- PUT `/api/messages/:id/set-proof` - Mark message as proof

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Initialize the database:
```bash
node server/init-db.js
```

3. Start the development server:
```bash
npm start
```

## Testing

The project includes comprehensive tests for:
- Components
- API client
- Authentication context
- Chat functionality

Run tests with:
```bash
npm test
```

## Project Structure

```
.
├── api/                  # API client and utilities
├── app/                  # Main application routes
├── components/          # Reusable React components
├── constants/          # App constants and styles
├── contexts/           # React Context providers
├── hooks/             # Custom React hooks
├── server/            # Backend server code
└── types/             # TypeScript definitions
```

## Configuration

The application uses environment variables for configuration:
- Database connection
- API endpoints
- WebSocket connections

## Deployment

The application can be deployed on Replit:
1. Database setup is handled automatically
2. WebSocket connections are configured for the deployment environment
3. Static assets are served through the Express server

