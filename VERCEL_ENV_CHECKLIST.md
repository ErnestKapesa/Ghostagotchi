# Vercel Environment Variables Checklist

Before deploying to Vercel, ensure all these environment variables are configured in your Vercel project settings.

## Required Environment Variables

### 1. Supabase Configuration

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Your Supabase project URL
- **Example**: `https://xxxxx.supabase.co`
- **Where to find**: Supabase Dashboard → Settings → API → Project URL
- **Visibility**: Public (exposed to browser)

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Your Supabase anonymous/public key
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find**: Supabase Dashboard → Settings → API → Project API keys → anon public
- **Visibility**: Public (exposed to browser)

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Your Supabase service role key (SECRET!)
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find**: Supabase Dashboard → Settings → API → Project API keys → service_role
- **Visibility**: Secret (server-side only)
- **⚠️ WARNING**: Never expose this key to the client!

### 2. Database Configuration

#### `DATABASE_URL`
- **Value**: PostgreSQL connection string with connection pooling
- **Example**: `postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- **Where to find**: Supabase Dashboard → Settings → Database → Connection string → URI (with connection pooling)
- **Important**: 
  - Use port **6543** (connection pooling)
  - Add `?pgbouncer=true` parameter
  - Replace `[PASSWORD]` with your actual database password
- **Visibility**: Secret (server-side only)

### 3. OpenAI Configuration

#### `OPENAI_API_KEY`
- **Value**: Your OpenAI API key
- **Example**: `sk-proj-xxxxxxxxxxxxxxxxxxxxx`
- **Where to find**: OpenAI Platform → API Keys → Create new secret key
- **Visibility**: Secret (server-side only)
- **⚠️ WARNING**: Never expose this key to the client!

---

## How to Add Environment Variables in Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. For each variable:
   - Enter the **Key** (e.g., `DATABASE_URL`)
   - Enter the **Value** (paste the actual value)
   - Select environments: **Production**, **Preview**, **Development**
   - Click **Save**

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link your project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add DATABASE_URL production
vercel env add OPENAI_API_KEY production

# Pull environment variables locally (optional)
vercel env pull .env.local
```

---

## Verification Checklist

Before deploying, verify:

- [ ] All 5 environment variables are added to Vercel
- [ ] `DATABASE_URL` uses port 6543 with `?pgbouncer=true`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is kept secret (not in git)
- [ ] `OPENAI_API_KEY` is kept secret (not in git)
- [ ] Public variables (`NEXT_PUBLIC_*`) are correctly prefixed
- [ ] All variables are set for Production environment
- [ ] Build command in Vercel is `npm run build`
- [ ] Root directory in Vercel is set to `web`

---

## Testing After Deployment

Once deployed, test your endpoints:

```bash
# Set your Vercel URL
VERCEL_URL="https://your-project.vercel.app"

# Test public endpoint (should work immediately)
curl $VERCEL_URL/api/leaderboard

# Test protected endpoint (requires auth token)
curl $VERCEL_URL/api/pet \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Troubleshooting

### Build Fails with "Cannot find module '@prisma/client'"
- **Solution**: Ensure `prisma generate` is in your build script
- **Check**: `package.json` → `"build": "prisma generate && next build"`

### Database Connection Timeout
- **Solution**: Use connection pooling URL (port 6543)
- **Check**: `DATABASE_URL` includes `?pgbouncer=true`

### "Environment variable not found" Error
- **Solution**: Verify variable names match exactly (case-sensitive)
- **Check**: No typos in variable names

### OpenAI API Errors in Production
- **Solution**: Verify API key is valid and has credits
- **Check**: OpenAI dashboard for usage and limits

---

## Security Best Practices

1. **Never commit secrets to git**
   - `.env.local` is in `.gitignore`
   - Use `.env.example` for templates only

2. **Rotate keys regularly**
   - Regenerate service role key if exposed
   - Rotate OpenAI API key periodically

3. **Use environment-specific values**
   - Different keys for development/staging/production
   - Test with development keys first

4. **Monitor usage**
   - Check Supabase dashboard for unusual activity
   - Monitor OpenAI usage and costs

---

## Quick Reference

| Variable | Type | Where Used | Exposed to Client? |
|----------|------|------------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Client & Server | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Client & Server | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Server only | ❌ No |
| `DATABASE_URL` | Secret | Server only | ❌ No |
| `OPENAI_API_KEY` | Secret | Server only | ❌ No |

