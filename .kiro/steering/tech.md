# Ghostagotchi Technical Stack

## iOS Mobile App

- **Language**: Swift with SwiftUI for declarative UI
- **AR Framework**: ARKit with RealityKit/SceneKit for 3D ghost rendering
- **Backend SDK**: Supabase Swift SDK for auth, database, and realtime
- **State Management**: SwiftUI's @State, @ObservableObject, @Published
- **Networking**: URLSession for custom API calls to Next.js backend
- **Development**: Xcode

## Web Dashboard

- **Framework**: Next.js (React) with TypeScript
- **Styling**: Tailwind CSS for rapid UI development
- **State Management**: React hooks (useState, useEffect, Context)
- **Backend Integration**: @supabase/supabase-js for auth and realtime
- **API Calls**: Fetch API for internal Next.js routes
- **Deployment**: Vercel

## Backend Services

- **Database**: Supabase Postgres with Row Level Security (RLS)
- **ORM**: Prisma for type-safe database access from Next.js
- **Authentication**: Supabase Auth (email/password, OAuth)
- **Real-Time**: Supabase Realtime (WebSocket-based Postgres changes)
- **AI Integration**: OpenAI API (GPT-4 or GPT-3.5-turbo)
- **API Layer**: Next.js API routes (serverless functions)

## Data Schema

### Tables
- **profiles**: User display names and metadata (1-to-1 with auth.users)
- **pets**: Ghost pet data (name, level, experience, hunger, mood, timestamps)
- **messages**: Chat conversation history (optional, for cross-device continuity)

### Key Relationships
- One user has one pet (enforced via unique constraint on pets.user_id)
- One pet has many messages

## Common Commands

### Next.js Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Type checking
npm run type-check
```

### Prisma Database Management
```bash
# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name <migration_name>

# Deploy migrations to production
npx prisma migrate deploy

# Open Prisma Studio (DB GUI)
npx prisma studio

# Reset database (dev only)
npx prisma migrate reset
```

### iOS Development
```bash
# Build from command line
xcodebuild -scheme Ghostagotchi -configuration Debug

# Run tests
xcodebuild test -scheme Ghostagotchi -destination 'platform=iOS Simulator,name=iPhone 15'

# Archive for distribution
xcodebuild archive -scheme Ghostagotchi -archivePath ./build/Ghostagotchi.xcarchive
```

### Deployment
```bash
# Deploy to Vercel (automatic on git push to main)
vercel --prod

# Or manual deploy
vercel deploy --prod
```

## Environment Variables

### Next.js (.env.local)
```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
DATABASE_URL=postgresql://<connection_string>
OPENAI_API_KEY=<openai_key>
```

### iOS (Config.swift or similar)
```swift
let supabaseURL = "https://<project>.supabase.co"
let supabaseAnonKey = "<anon_key>"
let apiBaseURL = "https://<app>.vercel.app"
```

## API Endpoints

- `POST /api/pet` - Create new ghost pet
- `GET /api/pet` - Fetch user's pet data
- `PUT /api/pet` - Update pet attributes
- `POST /api/pet/feed` - Feed the ghost (updates hunger, XP)
- `POST /api/pet/play` - Play with ghost (updates mood, XP)
- `POST /api/chat` - AI chat with ghost (OpenAI integration)
- `GET /api/leaderboard` - Fetch top ghosts ranking
- `POST /api/profile` - Update user profile

## Architecture Patterns

- **iOS**: MVVM pattern with ViewModels managing state and business logic
- **Web**: Component-based architecture with hooks for state management
- **Backend**: Serverless functions with Prisma for data access
- **Real-Time**: Pub-sub pattern via Supabase Realtime channels
- **Security**: Row Level Security (RLS) on database, JWT-based auth

## Key Technologies Integration

1. **Cross-Platform Sync**: Supabase Realtime broadcasts Postgres changes to all subscribed clients
2. **AI Chat**: Next.js server proxies OpenAI API calls (keeps API key secure)
3. **AR Experience**: ARKit places 3D ghost model in real-world environment
4. **Authentication**: Supabase Auth provides JWT tokens used across all services
