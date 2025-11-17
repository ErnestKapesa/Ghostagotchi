# Backend Foundation - Requirements Document

## Introduction

This spec covers the foundational backend infrastructure for Ghostagotchi, including the database schema, authentication system, and core API endpoints. This is Phase 2 of development and must be completed before iOS and web client development can proceed effectively.

## Glossary

- **System**: The Ghostagotchi backend services (Supabase + Next.js API)
- **User**: An authenticated person who owns a ghost pet
- **Pet**: A virtual ghost with stats (hunger, mood, level, experience)
- **RLS**: Row Level Security - Postgres security policies
- **JWT**: JSON Web Token used for authentication
- **Prisma**: TypeScript ORM for type-safe database access
- **Supabase**: Backend-as-a-Service providing Postgres, Auth, and Realtime

## Requirements

### Requirement 1: Database Schema Setup

**User Story:** As a developer, I want a properly structured database schema so that all pet data, user profiles, and chat messages can be stored reliably with appropriate relationships and constraints.

#### Acceptance Criteria

1. WHEN the Prisma schema is defined, THE System SHALL create a profiles table with fields: id (UUID), username (Text, unique, nullable), created_at (Timestamp), updated_at (Timestamp)

2. WHEN the Prisma schema is defined, THE System SHALL create a pets table with fields: id (UUID), user_id (UUID, unique), name (Text), level (Integer, default 1), experience (Integer, default 0), hunger (Integer, default 100), mood (Integer, default 100), last_fed_at (Timestamp, nullable), last_played_at (Timestamp, nullable), ghost_persona (Text, nullable), created_at (Timestamp), updated_at (Timestamp)

3. WHEN the Prisma schema is defined, THE System SHALL create a messages table with fields: id (Serial), pet_id (UUID), sender (Text), message (Text), created_at (Timestamp)

4. WHEN the pets table is created, THE System SHALL enforce a unique constraint on user_id to ensure one pet per user

5. WHEN the database schema is migrated, THE System SHALL create appropriate foreign key relationships between profiles.id and auth.users.id, and between pets.user_id and profiles.id

### Requirement 2: Row Level Security Policies

**User Story:** As a security-conscious developer, I want Row Level Security policies enforced so that users can only access and modify their own data, preventing unauthorized access.

#### Acceptance Criteria

1. WHEN RLS is enabled on the pets table, THE System SHALL allow users to SELECT only rows where user_id equals auth.uid()

2. WHEN RLS is enabled on the pets table, THE System SHALL allow users to UPDATE only rows where user_id equals auth.uid()

3. WHEN RLS is enabled on the pets table, THE System SHALL allow users to INSERT only rows where user_id equals auth.uid()

4. WHEN RLS is enabled on the messages table, THE System SHALL allow users to SELECT only messages where pet_id belongs to their pet

5. WHEN RLS is enabled on the profiles table, THE System SHALL allow users to SELECT and UPDATE only their own profile row

### Requirement 3: Authentication Integration

**User Story:** As a user, I want to create an account and log in securely so that I can access my ghost pet from any device.

#### Acceptance Criteria

1. WHEN Supabase Auth is configured, THE System SHALL support email and password authentication

2. WHEN Supabase Auth is configured, THE System SHALL support OAuth providers (Sign in with Apple, Google)

3. WHEN a user signs up, THE System SHALL create a corresponding profile record with the same user ID

4. WHEN a user authenticates, THE System SHALL return a JWT token valid for API access

5. WHEN an API endpoint receives a request, THE System SHALL validate the JWT token and extract the user ID

### Requirement 4: Pet Management API

**User Story:** As a client application, I want API endpoints to create and retrieve pet data so that users can adopt and view their ghost.

#### Acceptance Criteria

1. WHEN a POST request is sent to /api/pet with a name, THE System SHALL create a new pet record with default stats (level 1, experience 0, hunger 100, mood 100) for the authenticated user

2. WHEN a POST request is sent to /api/pet and the user already has a pet, THE System SHALL return a 409 Conflict error

3. WHEN a GET request is sent to /api/pet, THE System SHALL return the authenticated user's pet data including all fields

4. WHEN a GET request is sent to /api/pet and no pet exists, THE System SHALL return a 404 Not Found error

5. WHEN an unauthenticated request is sent to /api/pet, THE System SHALL return a 401 Unauthorized error

### Requirement 5: Pet Action Endpoints

**User Story:** As a client application, I want API endpoints to perform pet actions (feed, play) so that users can interact with their ghost and update its stats.

#### Acceptance Criteria

1. WHEN a POST request is sent to /api/pet/feed, THE System SHALL set the pet's hunger to 100, increment experience by 10, update last_fed_at to current timestamp, and return the updated pet data

2. WHEN a POST request is sent to /api/pet/feed and experience crosses a level threshold (every 100 XP), THE System SHALL increment the pet's level

3. WHEN a POST request is sent to /api/pet/play, THE System SHALL set the pet's mood to 100, increment experience by 5, update last_played_at to current timestamp, and return the updated pet data

4. WHEN a POST request is sent to /api/pet/feed or /api/pet/play without authentication, THE System SHALL return a 401 Unauthorized error

5. WHEN a POST request is sent to /api/pet/feed or /api/pet/play and the user has no pet, THE System SHALL return a 404 Not Found error

### Requirement 6: AI Chat Integration

**User Story:** As a user, I want to chat with my ghost using natural language so that it feels like a real companion with personality.

#### Acceptance Criteria

1. WHEN a POST request is sent to /api/chat with a message, THE System SHALL call the OpenAI API with a system prompt defining the ghost's personality (friendly, playful, spooky)

2. WHEN the OpenAI API returns a response, THE System SHALL return the ghost's reply text to the client

3. WHEN the OpenAI API call fails, THE System SHALL return a 500 error with a user-friendly message

4. WHEN a POST request is sent to /api/chat, THE System SHALL include the pet's name in the AI context

5. WHEN a POST request is sent to /api/chat without authentication, THE System SHALL return a 401 Unauthorized error

### Requirement 7: Leaderboard API

**User Story:** As a user, I want to see how my ghost ranks against others so that I'm motivated to care for it better and engage more.

#### Acceptance Criteria

1. WHEN a GET request is sent to /api/leaderboard, THE System SHALL return the top 10 pets ordered by level (descending), then experience (descending), then created_at (ascending)

2. WHEN a GET request is sent to /api/leaderboard, THE System SHALL include for each pet: rank, ghost name, level, and owner username (or anonymous if not set)

3. WHEN a GET request is sent to /api/leaderboard, THE System SHALL not require authentication (public endpoint)

4. WHEN a GET request is sent to /api/leaderboard, THE System SHALL use service role credentials to bypass RLS for reading all pets

5. WHEN a GET request is sent to /api/leaderboard and no pets exist, THE System SHALL return an empty array

### Requirement 8: Environment Configuration

**User Story:** As a developer, I want environment variables properly configured so that API keys and database credentials are secure and the application can connect to external services.

#### Acceptance Criteria

1. WHEN the Next.js application starts, THE System SHALL load SUPABASE_URL from environment variables

2. WHEN the Next.js application starts, THE System SHALL load SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY from environment variables

3. WHEN the Next.js application starts, THE System SHALL load DATABASE_URL for Prisma connection from environment variables

4. WHEN the Next.js application starts, THE System SHALL load OPENAI_API_KEY from environment variables

5. WHEN any required environment variable is missing, THE System SHALL log a clear error message indicating which variable is missing
