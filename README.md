# Challenge Coaching App

A React Native application built with Expo for managing coaching challenges and interactions between coaches and challengers. The app allows users to create challenges, assign coaches, track progress, and communicate through a real-time chat system.

## Features

- User authentication system
- Create and manage challenges
- Real-time chat functionality
- Challenge status tracking
- Progress validation system
- Coach assignment system

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Expo CLI

## Project Structure

```
.
├── api/                  # API client and storage utilities
├── app/                  # Main application directory (Expo Router)
├── components/          # Reusable React components
├── constants/          # Application constants and styles
├── contexts/           # React Context providers
├── server/            # Express.js backend server
└── types/             # TypeScript type definitions
```

## Installation

1. Clone this repository 
2. Install dependencies:
```bash
npm install
```

## Setting Up the Database

1. Make sure PostgreSQL is running
2. Set up your database connection string as an environment variable:
```
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
```
3. Initialize the database:
```bash
node server/init-db.js
```

## Running the Application

### Server Side

1. Start the Express server:
```bash
node server/index.js
```
The server will run on port 3001 and provide:
- REST API endpoints
- WebSocket connections for real-time chat
- Database interactions

### Client Side

1. Start the Expo development server:
```bash
npm start
```

This will start the development server and provide options to:
- Run on web browser
- Run on iOS simulator
- Run on Android emulator
- Run on physical device through Expo Go app

## Database Setup

1. Set up your database connection string as an environment variable:
```bash
export DATABASE_URL=postgresql://username:password@0.0.0.0:5432/dbname
```

2. Initialize the database by running:
```bash
node server/init-db.js
```

This will:
- Create required tables (users, challenges, messages)
- Set up initial test users
- Configure necessary indexes

## Testing

The project includes Jest tests for components, API, and hooks.

### Running Tests

1. Run all tests in watch mode:
```bash
npm test
```

2. Run tests for a specific file:
```bash
npm test ChallengeItem.test.tsx
```

3. Run tests with coverage:
```bash
npm test -- --coverage
```

Test files are located in:
- components/__tests__/
- api/__tests__/
- hooks/__tests__/

## Development

- The app uses Expo Router for navigation
- Styling is done through StyleSheet API
- Backend uses Express.js with PostgreSQL
- Real-time features implemented with Socket.IO
- TypeScript is used throughout the project

## Project Status

This project is currently in active development. Features are being added and refined based on user feedback and requirements.