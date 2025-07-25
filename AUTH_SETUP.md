# Authentication Setup Guide

This app now uses Better Auth with Google OAuth for authentication. Here's how to set it up:

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here-make-it-long-and-random"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Set the authorized redirect URI to: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local` file

## Better Auth Secret

Generate a secure random string for `BETTER_AUTH_SECRET`. You can use this command:

```bash
openssl rand -base64 32
```

## Database Migration

The authentication tables have been added to your database. If you need to run the migration manually:

```bash
npm run db:migrate
```

## Features

- ✅ Google OAuth sign-in
- ✅ Session management
- ✅ User profile display
- ✅ Sign out functionality
- ✅ Protected routes (content only shows when signed in)
- ✅ Integration with your existing tRPC setup

## Usage

1. Users can sign in with their Google account
2. Once signed in, they can access the full app functionality
3. User information is stored in the database
4. Sessions are managed securely with Better Auth

## API Routes

- `/api/auth/[...better-auth]` - Handles all authentication requests
- `/api/auth/callback/google` - Google OAuth callback

## Components

- `SignInButton` - Google sign-in button
- `UserProfile` - Displays user info and sign-out button
- `useAuth` hook - Get current user and loading state 