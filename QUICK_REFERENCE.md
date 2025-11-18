# 🚀 Ghostagotchi Backend - Quick Reference

## Essential Commands

```bash
# Setup
npm install                    # Install dependencies
npm run check-setup           # Verify configuration
npm run prisma:generate       # Generate Prisma client
npm run prisma:migrate        # Run migrations

# Development
npm run dev                   # Start dev server (localhost:3000)
npm run prisma:studio         # Open database GUI
npm run type-check            # Check TypeScript errors

# Database
npm run prisma:seed           # Add test data
npx prisma migrate reset      # Reset database (dev only)

# Deployment
npm run build                 # Build for production
npm start                     # Start production server
```

## Environment Variables

```bash
# Required in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:6543/postgres
OPENAI_API_KEY=sk-xxx...
```

## API Endpoints

```bash
# Public
GET  /api/leaderboard         # Top ghosts

# Protected (requires auth)
GET  /api/pet                 # Get user's pet
POST /api/pet                 # Create pet {"name":"Casper"}
POST /api/pet/feed            # Feed ghost (+10 XP)
POST /api/pet/play            # Play with ghost (+5 XP)
POST /api/chat                # Chat {"message":"Hi!"}
POST /api/profile             # Update {"username":"user"}
```

## Quick Test

```bash
# Test leaderboard (no auth needed)
curl http://localhost:3000/api/leaderboard

# Test with auth (get token from Supabase first)
curl http://localhost:3000/api/pet \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## File Locations

```
web/
├── lib/                      # Utilities
│   ├── prisma.ts            # DB client
│   ├── auth.ts              # Auth middleware
│   ├── openai.ts            # AI integration
│   └── api-helpers.ts       # Response helpers
├── pages/api/               # API routes
├── prisma/
│   ├── schema.prisma        # Data models
│   └── migrations/          # SQL migrations
└── scripts/
    └── check-setup.ts       # Setup checker
```

## Common Issues

### "Cannot find module '@prisma/client'"
```bash
npm run prisma:generate
```

### "Environment variable not found"
```bash
# Check .env.local exists and has all variables
npm run check-setup
```

### "Connection timeout"
```bash
# Use connection pooling URL (port 6543)
# Add ?pgbouncer=true to DATABASE_URL
```

### "Unauthorized" errors
```bash
# Verify Supabase credentials
# Check auth token is valid
# Ensure RLS policies are applied
```

## Database Schema

```
profiles (1) ←→ (1) pets (1) ←→ (many) messages

profiles:
  - id (UUID, PK)
  - username (unique)
  - created_at, updated_at

pets:
  - id (UUID, PK)
  - user_id (UUID, unique, FK)
  - name, level, experience
  - hunger, mood (0-100)
  - last_fed_at, last_played_at
  - created_at, updated_at

messages:
  - id (serial, PK)
  - pet_id (UUID, FK)
  - sender ('user' | 'ghost')
  - message (text)
  - created_at
```

## Level System

```
Level = 1 + floor(experience / 100)

Actions:
- Feed: +10 XP, hunger → 100
- Play: +5 XP, mood → 100

Examples:
- 0-99 XP   = Level 1
- 100-199 XP = Level 2
- 200-299 XP = Level 3
```

## Useful Links

- [Full Setup Guide](./SETUP.md)
- [API Testing Examples](./API_TESTING.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Supabase Dashboard](https://app.supabase.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [OpenAI Dashboard](https://platform.openai.com)

## Support

1. Run `npm run check-setup` to diagnose issues
2. Check logs in Vercel/Supabase dashboards
3. Review error messages in console
4. Consult documentation in `web/` directory
