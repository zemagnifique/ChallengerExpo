# Challenge Coaching App

A React Native application built with Expo that facilitates coaching relationships and challenge management. The app enables users to create challenges, assign coaches, track progress, and communicate through a real-time chat system.

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- PostgreSQL database
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ChallengerExpo.git
cd ChallengerExpo
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment:
```bash
# Copy the environment template
cp .env.example .env
# Edit .env to match your configuration
```

4. Start the server:
```bash
# Using the automated startup script (recommended)
cd server
node start.js

# Or manually
cd server
node init-db.js # Only needed first time
node index.js
```

5. Start the Expo development server (in a new terminal):
```bash
npm start
# or
yarn start
```

6. Scan the QR code with Expo Go app or use an emulator/simulator

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

## Image Upload Feature

The application supports image uploads in messages. Users can:

1. Click the photo icon in the message input area to select an image from their device
2. Send the image as part of a message
3. View images in the chat history

### Implementation Details

- Images are stored in a `/uploads` directory on the server
- Each image is given a unique filename to prevent conflicts
- The server supports common image formats (jpg, jpeg, png, gif)
- Image uploads are limited to 10MB in size
- The database stores the path to the image in the `image_url` field of the messages table

### Technical Notes

- Uses `expo-image-picker` for selecting images on mobile devices
- Uses `multer` on the server for handling file uploads
- Images are served as static files through the Express server

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

### Files
- POST `/api/upload` - Upload an image file

## Troubleshooting

### Common Issues

1. **Server connection issues**:
   - Ensure the server is running (`node server/index.js`)
   - Check that the API URL in `api/client.ts` is correctly configured for your environment
   - For Android emulators, try using `10.0.2.2` instead of `localhost`

2. **Image upload problems**:
   - Ensure the `/uploads` directory exists and has proper permissions
   - Check that the form field name is 'image' in the FormData object
   - Verify image size is under 10MB
   - Check the server console for detailed error messages

3. **Socket connection issues**:
   - Ensure the WebSocket server is running
   - Check for any network restrictions or firewall issues
   - Verify the socket connection URL matches your environment

4. **Database errors**:
   - Ensure PostgreSQL is running
   - Check that the database credentials in `server/index.js` are correct
   - Verify that the required tables exist

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

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

