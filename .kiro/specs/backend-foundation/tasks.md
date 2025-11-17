# Backend Foundation - Implementation Tasks

## Overview

This task list guides the implementation of the Ghostagotchi backend foundation, including database setup, API routes, authentication, and external service integrations. Tasks are ordered to build incrementally with each step producing testable functionality.

---

## 1. Project Setup and Configuration

- [ ] 1.1 Initialize Next.js project with TypeScript
  - Create Next.js app with `npx create-next-app@latest web --typescript --tailwind --app-router=false`
  - Configure `tsconfig.json` for strict type checking
  - Install core dependencies: `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`, `prisma`, `@prisma/client`, `openai`
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 1.2 Set up environment variables
  - Create `.env.local` file with Supabase and OpenAI credentials
  - Add `.env.local` to `.gitignore`
  - Create `.env.example` template for other developers
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 1.3 Create Supabase project
  - Sign up for Supabase account and create new project
  - Note project URL and anon key
  - Generate service role key from project settings
  - Configure authentication providers (email, Google, Apple)
  - _Requirements: 3.1, 3.2_

---

## 2. Database Schema and Migrations

- [ ] 2.1 Initialize Prisma
  - Run `npx prisma init` to create Prisma directory
  - Configure `DATABASE_URL` in `.env.local` with Supabase connection string
  - Update `schema.prisma` datasource to use PostgreSQL
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2.2 Define Prisma schema models
  - Create `Profile` model with id, username, timestamps
  - Create `Pet` model with all stat fields (hunger, mood, level, experience, etc.)
  - Create `Message` model for chat history
  - Define relationships: Profile ↔ Pet (1:1), Pet ↔ Message (1:many)
  - Add `@@map` directives for snake_case table names
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2.3 Create initial migration
  - Run `npx prisma migrate dev --name init` to create tables
  - Verify tables created in Supabase dashboard
  - Run `npx prisma generate` to generate Prisma Client
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2.4 Add database constraints
  - Create migration for check constraints (hunger 0-100, mood 0-100, level >= 1)
  - Add indexes on `pets.level` and `pets.experience` for leaderboard performance
  - Verify constraints work by testing invalid data insertion
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2.5 Implement Row Level Security policies
  - Create SQL migration file for RLS policies
  - Enable RLS on profiles, pets, and messages tables
  - Create policies for SELECT, INSERT, UPDATE on each table using `auth.uid()`
  - Test policies by attempting cross-user data access
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

---

## 3. Core Utilities and Middleware

- [ ] 3.1 Create Prisma client singleton
  - Create `web/lib/prisma.ts` with singleton pattern
  - Configure logging for development
  - Prevent multiple instances in hot-reload
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3.2 Create authentication middleware
  - Create `web/lib/auth.ts` with `requireAuth` function
  - Use Supabase auth helpers to validate JWT
  - Extract and return userId from session
  - Return structured error for unauthorized requests
  - _Requirements: 3.4, 4.5, 5.4, 6.5_

- [ ] 3.3 Create OpenAI client and prompt builder
  - Create `web/lib/openai.ts` with OpenAI client initialization
  - Implement `createGhostPrompt` function with system prompt
  - Include pet name in prompt for personalization
  - Set max_tokens and temperature parameters
  - _Requirements: 6.1, 6.4_

- [ ] 3.4 Create API response helpers
  - Create `web/lib/api-helpers.ts` with error response functions
  - Implement `sendError`, `sendSuccess`, `sendUnauthorized` helpers
  - Ensure consistent error format across all endpoints
  - _Requirements: 4.5, 5.4, 5.5, 6.3, 6.5_

---

## 4. Pet Management API Endpoints

- [ ] 4.1 Implement GET /api/pet endpoint
  - Create `web/pages/api/pet/index.ts`
  - Validate authentication using `requireAuth`
  - Query pet by userId using Prisma
  - Return 404 if no pet exists, otherwise return pet data
  - Handle database errors gracefully
  - _Requirements: 4.3, 4.4, 4.5_

- [ ] 4.2 Implement POST /api/pet endpoint
  - Add POST handler to `web/pages/api/pet/index.ts`
  - Validate authentication and extract name from request body
  - Check if user already has a pet (return 409 if exists)
  - Create pet with default stats using Prisma
  - Return created pet data
  - _Requirements: 4.1, 4.2, 4.5_

- [ ] 4.3 Implement POST /api/pet/feed endpoint
  - Create `web/pages/api/pet/feed.ts`
  - Validate authentication
  - Fetch user's pet, return 404 if not found
  - Update hunger to 100, increment experience by 10
  - Calculate new level (level = 1 + floor(experience / 100))
  - Update last_fed_at timestamp
  - Return updated pet data
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [ ] 4.4 Implement POST /api/pet/play endpoint
  - Create `web/pages/api/pet/play.ts`
  - Validate authentication
  - Fetch user's pet, return 404 if not found
  - Update mood to 100, increment experience by 5
  - Calculate new level if threshold crossed
  - Update last_played_at timestamp
  - Return updated pet data
  - _Requirements: 5.3, 5.4, 5.5_

---

## 5. AI Chat Integration

- [ ] 5.1 Implement POST /api/chat endpoint
  - Create `web/pages/api/chat.ts`
  - Validate authentication and extract message from body
  - Validate message length (max 200 characters)
  - Fetch user's pet to get name for prompt personalization
  - _Requirements: 6.1, 6.4, 6.5_

- [ ] 5.2 Integrate OpenAI API call
  - Use `createGhostPrompt` to build messages array
  - Call OpenAI chat completion API with GPT-3.5-turbo or GPT-4
  - Set timeout of 10 seconds for API call
  - Extract assistant reply from response
  - _Requirements: 6.1, 6.2_

- [ ] 5.3 Handle OpenAI errors and edge cases
  - Catch API errors and return 500 with friendly message
  - Handle timeout errors specifically
  - Log errors with context for debugging
  - Return ghost's reply text to client
  - _Requirements: 6.2, 6.3_

- [ ]* 5.4 Store chat messages in database (optional)
  - Insert user message to messages table
  - Insert ghost reply to messages table
  - Handle database errors without failing the chat response
  - _Requirements: 6.1_

---

## 6. Leaderboard API

- [ ] 6.1 Implement GET /api/leaderboard endpoint
  - Create `web/pages/api/leaderboard.ts`
  - Use Prisma with service role credentials to bypass RLS
  - Query top 10 pets ordered by level DESC, experience DESC, created_at ASC
  - Include pet name, level, and owner username (join with profiles)
  - _Requirements: 7.1, 7.2, 7.4_

- [ ] 6.2 Handle public access and empty results
  - Ensure endpoint works without authentication (public)
  - Return empty array if no pets exist
  - Handle database errors gracefully
  - Format response with rank numbers (1, 2, 3...)
  - _Requirements: 7.3, 7.5_

- [ ] 6.3 Add username anonymization
  - Show username if set in profile
  - Show "Anonymous" or partial email if username not set
  - Ensure no sensitive data (full email) is exposed
  - _Requirements: 7.2_

---

## 7. Profile Management API

- [ ] 7.1 Implement POST /api/profile endpoint
  - Create `web/pages/api/profile.ts`
  - Validate authentication
  - Extract username from request body
  - Check for username uniqueness (return 409 if taken)
  - Update or create profile record
  - Return updated profile data
  - _Requirements: 3.3_

---

## 8. Testing and Validation

- [ ]* 8.1 Write unit tests for pet creation
  - Test successful pet creation with valid data
  - Test 409 error when user already has pet
  - Test 401 error without authentication
  - Mock Prisma client for isolated testing
  - _Requirements: 4.1, 4.2_

- [ ]* 8.2 Write unit tests for pet actions
  - Test feed action updates hunger and XP correctly
  - Test play action updates mood and XP correctly
  - Test level up calculation at 100 XP threshold
  - Test 404 error when pet doesn't exist
  - _Requirements: 5.1, 5.2, 5.3_

- [ ]* 8.3 Write integration tests for auth flow
  - Test JWT validation with valid token
  - Test 401 response with invalid token
  - Test 401 response with missing token
  - _Requirements: 3.4, 4.5_

- [ ]* 8.4 Write tests for RLS policies
  - Create two test users with separate pets
  - Verify user A cannot access user B's pet
  - Verify user A can only update their own pet
  - Test with direct Supabase client calls
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 8.5 Manual testing of complete flow
  - Sign up new user via Supabase Auth
  - Create pet via POST /api/pet
  - Feed pet and verify stats update
  - Chat with ghost and verify OpenAI response
  - Check leaderboard includes the pet
  - Verify real-time updates in Supabase dashboard
  - _Requirements: All_

---

## 9. Documentation and Deployment Prep

- [ ] 9.1 Document API endpoints
  - Create `docs/api.md` with endpoint descriptions
  - Include request/response examples for each endpoint
  - Document error codes and messages
  - Add authentication requirements
  - _Requirements: All API endpoints_

- [ ] 9.2 Create database seed script
  - Create `web/prisma/seed.ts` with sample data
  - Add 3-5 test pets with varying levels
  - Add sample chat messages
  - Configure seed script in `package.json`
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 9.3 Prepare for Vercel deployment
  - Create `vercel.json` configuration if needed
  - Verify all environment variables are documented
  - Test build process locally (`npm run build`)
  - Ensure Prisma generates client in build step
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 9.4 Set up environment variables in Vercel
  - Add all required environment variables to Vercel project
  - Test deployment to preview environment
  - Verify API routes work in serverless context
  - Check database connection from Vercel
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

---

## Notes

- Tasks marked with `*` are optional and can be skipped for MVP
- Each task should be tested before moving to the next
- Commit code after completing each major section (1-9)
- Use Kiro's agent hooks to automate testing and migrations
- Refer to design.md for implementation details
