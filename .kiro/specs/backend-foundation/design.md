# Backend Foundation - Design Document

## Overview

The backend foundation provides the core infrastructure for Ghostagotchi, consisting of a Supabase Postgres database, Prisma ORM for type-safe access, Next.js API routes for business logic, and integrations with Supabase Auth and OpenAI. This design ensures a single source of truth for all pet data with real-time synchronization capabilities.

## Architecture

### High-Level Architecture

```
Client Apps (iOS/Web)
        ↓
    [Authentication Layer]
        ↓
    [Next.js API Routes] ←→ [OpenAI API]
        ↓
    [Prisma ORM]
        ↓
    [Supabase Postgres + RLS]
        ↓
    [Supabase Realtime] → Client Apps
```

### Technology Stack

- **Database**: Supabase Postgres 15+ with Row Level Security
- **ORM**: Prisma 5.x for type-safe database access
- **API Framework**: Next.js 14+ API routes (serverless functions)
- **Authentication**: Supabase Auth with JWT tokens
- **AI Integration**: OpenAI API (GPT-4 or GPT-3.5-turbo)
- **Real-Time**: Supabase Realtime (WebSocket-based)

## Components and Interfaces

### 1. Database Schema (Prisma)

**File**: `web/prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Profile {
  id        String   @id @db.Uuid
  username  String?  @unique
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  pet       Pet?

  @@map("profiles")
}

model Pet {
  id           String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId       String    @unique @map("user_id") @db.Uuid
  name         String
  level        Int       @default(1)
  experience   Int       @default(0)
  hunger       Int       @default(100)
  mood         Int       @default(100)
  lastFedAt    DateTime? @map("last_fed_at")
  lastPlayedAt DateTime? @map("last_played_at")
  ghostPersona String?   @map("ghost_persona")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  
  profile      Profile   @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages     Message[]

  @@map("pets")
}

model Message {
  id        Int      @id @default(autoincrement())
  petId     String   @map("pet_id") @db.Uuid
  sender    String   // 'user' or 'ghost'
  message   String
  createdAt DateTime @default(now()) @map("created_at")
  
  pet       Pet      @relation(fields: [petId], references: [id], onDelete: Cascade)

  @@map("messages")
}
```

**Key Design Decisions**:
- Use UUID for primary keys (better for distributed systems)
- Enforce one-to-one relationship between Profile and Pet via unique constraint
- Use snake_case for database columns (Postgres convention) with @map
- Cascade deletes to maintain referential integrity
- Default values for pet stats ensure consistent initial state

### 2. Row Level Security Policies

**File**: `web/prisma/migrations/[timestamp]_add_rls_policies/migration.sql`

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Pets policies
CREATE POLICY "Users can view own pet"
  ON pets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own pet"
  ON pets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pet"
  ON pets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view own pet messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = messages.pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own pet messages"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = messages.pet_id
      AND pets.user_id = auth.uid()
    )
  );
```

**Security Considerations**:
- All policies use `auth.uid()` to ensure user isolation
- Messages require subquery to verify ownership through pet relationship
- Service role key bypasses RLS for admin operations (leaderboard)

### 3. API Route Structure

**Directory**: `web/pages/api/`

```
api/
├── pet/
│   ├── index.ts       # GET (retrieve), POST (create)
│   ├── feed.ts        # POST (feed action)
│   └── play.ts        # POST (play action)
├── chat.ts            # POST (AI chat)
├── leaderboard.ts     # GET (public leaderboard)
└── profile.ts         # POST (update profile)
```

### 4. Authentication Middleware

**File**: `web/lib/auth.ts`

```typescript
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createServerSupabaseClient({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'Unauthorized', status: 401 }
  }

  return { userId: session.user.id, session }
}
```

**Design Rationale**:
- Centralized auth logic prevents duplication
- Returns structured error for consistent handling
- Extracts userId for use in database queries

### 5. Prisma Client Singleton

**File**: `web/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Design Rationale**:
- Singleton pattern prevents connection pool exhaustion
- Logging enabled for debugging
- Development mode caching prevents hot-reload issues

### 6. OpenAI Integration

**File**: `web/lib/openai.ts`

```typescript
import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export function createGhostPrompt(petName: string, userMessage: string) {
  return [
    {
      role: 'system' as const,
      content: `You are ${petName}, a friendly ghost pet in the Ghostagotchi app. You have a playful, slightly spooky personality. You love your owner and enjoy making ghost puns. Keep responses concise (2-3 sentences max) and stay in character. You're helpful but with a ghostly twist.`,
    },
    {
      role: 'user' as const,
      content: userMessage,
    },
  ]
}
```

**Design Rationale**:
- System prompt establishes consistent personality
- Pet name personalization increases engagement
- Concise responses prevent UI overflow and reduce token costs

## Data Models

### Pet Stats Logic

**Level Calculation**:
- Level = 1 + floor(experience / 100)
- Each level requires 100 XP
- Example: 250 XP = Level 3

**Stat Constraints**:
- Hunger: 0-100 (100 = full, 0 = starving)
- Mood: 0-100 (100 = very happy, 0 = very sad)
- Experience: 0+ (unbounded, drives level)
- Level: 1+ (minimum level 1)

**Action Rewards**:
- Feed: +10 XP, hunger → 100
- Play: +5 XP, mood → 100

### Database Constraints

```sql
-- Add check constraints for stat ranges
ALTER TABLE pets ADD CONSTRAINT hunger_range CHECK (hunger >= 0 AND hunger <= 100);
ALTER TABLE pets ADD CONSTRAINT mood_range CHECK (mood >= 0 AND mood <= 100);
ALTER TABLE pets ADD CONSTRAINT level_minimum CHECK (level >= 1);
ALTER TABLE pets ADD CONSTRAINT experience_minimum CHECK (experience >= 0);
```

## Error Handling

### API Error Response Format

```typescript
interface ApiError {
  error: string
  message?: string
  code?: string
}
```

### Common Error Codes

- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Pet or resource doesn't exist
- `409 Conflict`: User already has a pet
- `500 Internal Server Error`: Database or external API failure

### Error Handling Strategy

1. **Validation Errors**: Return 400 with specific field errors
2. **Auth Errors**: Return 401 with clear message
3. **Database Errors**: Log full error, return sanitized message
4. **OpenAI Errors**: Fallback to friendly ghost message
5. **Unexpected Errors**: Log with context, return generic 500

## Testing Strategy

### Unit Tests

**File**: `web/__tests__/api/pet.test.ts`

Test coverage:
- Pet creation with valid data
- Pet creation when one already exists (409)
- Pet retrieval for authenticated user
- Pet retrieval without auth (401)
- Feed action updates stats correctly
- Level up triggers at 100 XP threshold

### Integration Tests

- End-to-end flow: signup → create pet → feed → verify DB state
- RLS policy enforcement with multiple users
- Real-time event propagation (manual testing initially)

### Testing Tools

- Jest for unit tests
- Supertest for API endpoint testing
- Prisma test database with migrations

## Performance Considerations

### Database Optimization

- Index on `pets.user_id` (already created by unique constraint)
- Index on `pets.level` and `pets.experience` for leaderboard queries
- Connection pooling via Prisma (default 10 connections)

### API Response Times

- Target: < 200ms for database operations
- Target: < 3s for OpenAI chat (external dependency)
- Use async/await throughout for non-blocking operations

### Caching Strategy

- No caching for pet data (real-time sync priority)
- Consider caching leaderboard for 30s (future optimization)
- OpenAI responses not cached (uniqueness desired)

## Security Measures

### API Key Protection

- All secrets in environment variables
- Never expose in client-side code
- Use service role key only in server context

### Input Validation

- Sanitize all user inputs
- Validate pet names (max length, allowed characters)
- Limit chat message length (200 chars)

### Rate Limiting

- Consider implementing rate limiting on chat endpoint
- Prevent spam feeding (cooldown period)
- Monitor OpenAI usage to prevent cost overruns

## Deployment Configuration

### Environment Variables

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Database
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres

# OpenAI
OPENAI_API_KEY=sk-xxx...

# Next.js
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### Vercel Deployment

- Automatic deployment on git push to main
- Environment variables configured in Vercel dashboard
- Serverless functions for all API routes
- Edge runtime not used (Prisma requires Node.js runtime)

## Migration Strategy

### Initial Setup

1. Create Supabase project
2. Configure Prisma with DATABASE_URL
3. Run `prisma migrate dev` to create tables
4. Apply RLS policies via migration
5. Seed test data (optional)

### Future Migrations

- Use `prisma migrate dev --name <description>` for schema changes
- Test migrations on staging environment first
- Include RLS policy changes in SQL migrations
- Document breaking changes in migration notes

## Monitoring and Logging

### Logging Strategy

- Log all API requests with userId and endpoint
- Log database query errors with context
- Log OpenAI API calls (request/response/latency)
- Use structured logging (JSON format)

### Metrics to Track

- API response times by endpoint
- Database query performance
- OpenAI API usage and costs
- Error rates by type
- Active user sessions

## Future Enhancements

### Potential Improvements

1. **Hunger Decay**: Implement time-based hunger reduction
2. **Achievements**: Track milestones and award badges
3. **Ghost Customization**: Allow appearance changes
4. **Social Features**: Friend system, ghost interactions
5. **Push Notifications**: Remind users to care for ghost
6. **Analytics**: Track user engagement patterns

### Scalability Considerations

- Current design supports ~1000 concurrent users
- For larger scale: implement caching layer (Redis)
- Consider read replicas for leaderboard queries
- Move heavy operations to background jobs (BullMQ)
