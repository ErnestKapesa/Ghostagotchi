# Ghostagotchi Backend

Backend API for the Ghostagotchi virtual ghost pet application.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase and OpenAI credentials
   - See `SETUP.md` for detailed instructions

3. **Initialize database**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   Server will start at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
web/
├── lib/                    # Shared utilities
│   ├── prisma.ts          # Database client
│   ├── supabase.ts        # Supabase clients
│   ├── auth.ts            # Authentication middleware
│   ├── openai.ts          # OpenAI integration
│   └── api-helpers.ts     # API response helpers
├── pages/
│   └── api/               # API routes
│       ├── pet/
│       │   ├── index.ts   # GET/POST pet
│       │   ├── feed.ts    # Feed action
│       │   └── play.ts    # Play action
│       ├── chat.ts        # AI chat
│       ├── leaderboard.ts # Public leaderboard
│       └── profile.ts     # Profile updates
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
└── SETUP.md               # Detailed setup guide
```

## 🔌 API Endpoints

### Pet Management

- `GET /api/pet` - Get user's pet
- `POST /api/pet` - Create new pet
  ```json
  { "name": "Casper" }
  ```
- `POST /api/pet/feed` - Feed the ghost
- `POST /api/pet/play` - Play with the ghost

### AI Chat

- `POST /api/chat` - Chat with ghost
  ```json
  { "message": "How are you feeling?" }
  ```

### Leaderboard

- `GET /api/leaderboard?limit=10` - Get top ghosts (public)

### Profile

- `POST /api/profile` - Update username
  ```json
  { "username": "ghostmaster" }
  ```

## 🔐 Authentication

All endpoints except `/api/leaderboard` require authentication via Supabase JWT token.

Include the token in cookies (handled automatically by Supabase client) or in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🗄️ Database Schema

### Tables

- **profiles** - User display names
- **pets** - Ghost pet data (stats, timestamps)
- **messages** - Chat history (optional)

### Key Relationships

- One user → One pet (enforced by unique constraint)
- One pet → Many messages

## 🧪 Development

### Database Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio (DB GUI)
npm run prisma:studio

# Reset database (dev only)
npx prisma migrate reset
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Environment variables needed:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `OPENAI_API_KEY`

## 📝 Notes

- RLS (Row Level Security) is enabled on all tables
- Service role key bypasses RLS for admin operations (leaderboard)
- OpenAI responses are limited to 150 tokens for cost control
- Chat messages have a 500 character limit

## 🔗 Related

- [Full SRD Documentation](../srd.md)
- [Setup Guide](./SETUP.md)
- [Kiro Specs](../.kiro/specs/backend-foundation/)
