# Ghostagotchi Backend Deployment Guide

## 🚀 Deploying to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Supabase project set up
- OpenAI API key

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial Ghostagotchi backend"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `web`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Step 3: Configure Environment Variables

In Vercel project settings, add these environment variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true

# OpenAI
OPENAI_API_KEY=sk-your-openai-key
```

**Important Notes:**
- Use the connection pooling URL for DATABASE_URL (port 6543)
- Add `?pgbouncer=true` to the DATABASE_URL for serverless compatibility
- Never commit these values to git!

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Your API will be live at `https://your-project.vercel.app`

### Step 5: Run Database Migrations

After first deployment, you need to run migrations:

**Option A: Using Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel env pull .env.local
npm run prisma:migrate
```

**Option B: Using Supabase SQL Editor**
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and paste contents of:
   - `prisma/migrations/00_init_schema.sql`
   - `prisma/migrations/01_add_rls_policies.sql`
4. Execute each migration

### Step 6: Set Up Auth Trigger

In Supabase dashboard:
1. Go to **Database** → **Triggers**
2. Create new trigger:
   - **Name**: `on_auth_user_created`
   - **Table**: `auth.users`
   - **Events**: `INSERT`
   - **Type**: `AFTER`
   - **Function**: `handle_new_user`

This automatically creates a profile when users sign up.

### Step 7: Test Deployment

```bash
# Test leaderboard (public endpoint)
curl https://your-project.vercel.app/api/leaderboard

# Test with authentication (requires valid JWT)
curl -X POST https://your-project.vercel.app/api/pet \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=<your-token>" \
  -d '{"name":"TestGhost"}'
```

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to main:

```bash
git add .
git commit -m "Update feature"
git push
```

## 🐛 Troubleshooting

### Build Fails

**Error: Cannot find module '@prisma/client'**
- Solution: Ensure `prisma generate` runs in build command
- Check: `package.json` build script includes `prisma generate`

**Error: Environment variable not found**
- Solution: Verify all env vars are set in Vercel dashboard
- Check: Variable names match exactly (case-sensitive)

### Database Connection Issues

**Error: Connection timeout**
- Solution: Use connection pooling URL (port 6543)
- Add `?pgbouncer=true` to DATABASE_URL

**Error: Too many connections**
- Solution: Use Supabase connection pooling
- Reduce Prisma connection pool size in production

### API Errors

**401 Unauthorized**
- Check: Supabase URL and keys are correct
- Verify: Client is sending auth cookies/headers

**500 Internal Server Error**
- Check: Vercel function logs for details
- Verify: Database migrations are applied
- Test: OpenAI API key is valid

## 📊 Monitoring

### Vercel Dashboard
- View deployment logs
- Monitor function invocations
- Check error rates

### Supabase Dashboard
- Monitor database queries
- Check auth activity
- View real-time connections

### OpenAI Dashboard
- Track API usage
- Monitor costs
- Check rate limits

## 🔐 Security Checklist

- [ ] Environment variables set in Vercel (not in code)
- [ ] RLS policies enabled on all tables
- [ ] Service role key only used server-side
- [ ] CORS configured if needed
- [ ] Rate limiting considered for chat endpoint
- [ ] Database backups enabled in Supabase

## 🎯 Performance Optimization

### Database
- Indexes created on frequently queried columns
- Connection pooling enabled
- Query optimization with Prisma

### API Routes
- Serverless functions are stateless
- Minimal cold start time
- Efficient error handling

### Caching
- Consider adding Redis for leaderboard caching
- Use Vercel Edge Caching for static responses

## 📈 Scaling Considerations

Current setup handles:
- ~1000 concurrent users
- ~10,000 API requests/day
- ~100 database connections

For higher scale:
- Upgrade Supabase plan
- Add Redis caching layer
- Implement rate limiting
- Consider read replicas

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
