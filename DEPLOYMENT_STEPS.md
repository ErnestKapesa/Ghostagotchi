# Ghostagotchi Vercel Deployment Steps

Quick guide to deploy your Ghostagotchi backend to Vercel.

## ✅ Pre-Deployment Checklist

Before you start, ensure you have:

- [x] Built successfully locally (`npm run build` passed)
- [x] All environment variables documented
- [x] Supabase project created and configured
- [x] OpenAI API key with available credits
- [x] GitHub repository with latest code pushed
- [x] `.env.local` in `.gitignore` (secrets not committed)

## 🚀 Deployment Steps

### Step 1: Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/ghostagotchi.git

# Push to main branch
git push -u origin main
```

### Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Select your **ghostagotchi** repository
4. Configure project settings:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `web`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. Click **"Deploy"** (it will fail without env vars - that's expected!)

### Step 3: Add Environment Variables

1. In your Vercel project, go to **Settings** → **Environment Variables**

2. Add each variable (copy from your `.env.local`):

   **NEXT_PUBLIC_SUPABASE_URL**
   - Value: `https://xxxxx.supabase.co`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **SUPABASE_SERVICE_ROLE_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **DATABASE_URL**
   - Value: `postgresql://postgres:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - ⚠️ **Important**: Use port **6543** with `?pgbouncer=true` for serverless
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **OPENAI_API_KEY**
   - Value: `sk-proj-xxxxxxxxxxxxxxxxxxxxx`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

3. Click **"Save"** for each variable

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete (~2-3 minutes)

### Step 5: Verify Deployment

Once deployed, your API will be live at: `https://your-project.vercel.app`

Test the endpoints:

```bash
# Set your Vercel URL
export VERCEL_URL="https://your-project.vercel.app"

# Test public endpoint
curl $VERCEL_URL/api/leaderboard

# Expected: {"data":{"leaderboard":[],"total":0,"lastUpdated":"..."}}
```

### Step 6: Test with Authentication

1. Sign up a test user in your Supabase dashboard or via the API
2. Get an auth token
3. Test protected endpoints:

```bash
# Get token (replace with your test user credentials)
# Use Supabase client or direct API call

# Test pet creation
curl -X POST $VERCEL_URL/api/pet \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"TestGhost"}'

# Test pet retrieval
curl $VERCEL_URL/api/pet \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 7: Run Comprehensive Tests

Use the test script to verify all endpoints:

```bash
# Update test script to use production URL
export API_URL="https://your-project.vercel.app"
export TEST_EMAIL="test@example.com"
export TEST_PASSWORD="YourTestPassword123!"

# Run tests
cd web
npx tsx scripts/test-api.ts
```

## 🎉 Success Criteria

Your deployment is successful if:

- ✅ Build completes without errors
- ✅ `/api/leaderboard` returns valid JSON
- ✅ Protected endpoints work with valid JWT
- ✅ Pet creation, feed, play actions work
- ✅ Chat endpoint returns AI responses
- ✅ No 500 errors in Vercel function logs

## 🐛 Troubleshooting

### Build Fails

**Error: "Cannot find module '@prisma/client'"**
```bash
# Solution: Verify package.json build script
"build": "prisma generate && next build"
```

**Error: "Environment variable not found"**
- Check variable names match exactly (case-sensitive)
- Verify all 5 variables are added in Vercel

### Runtime Errors

**Database Connection Timeout**
- Use connection pooling URL (port 6543)
- Add `?pgbouncer=true` parameter
- Check Supabase project is not paused

**401 Unauthorized Errors**
- Verify Supabase URL and keys are correct
- Check JWT token is valid and not expired
- Ensure RLS policies are applied

**OpenAI API Errors**
- Verify API key is valid
- Check you have available credits
- Monitor rate limits in OpenAI dashboard

### Checking Logs

1. Go to Vercel project → **Deployments**
2. Click on latest deployment
3. Click **"View Function Logs"**
4. Look for errors in API route invocations

## 📊 Monitoring

### Vercel Dashboard
- **Deployments**: View build logs and deployment history
- **Analytics**: Monitor traffic and performance
- **Functions**: Check invocation count and errors

### Supabase Dashboard
- **Database**: Monitor query performance
- **Auth**: Track user signups and logins
- **Logs**: View real-time database and auth logs

### OpenAI Dashboard
- **Usage**: Monitor API calls and token usage
- **Costs**: Track spending
- **Rate Limits**: Check if you're hitting limits

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Vercel automatically builds and deploys
# Check deployment status in Vercel dashboard
```

## 🔐 Security Checklist

After deployment:

- [ ] Verify `.env.local` is not in git
- [ ] Check service role key is not exposed in client code
- [ ] Confirm RLS policies are enabled in Supabase
- [ ] Test that users can only access their own data
- [ ] Monitor Supabase and OpenAI usage for anomalies
- [ ] Set up billing alerts in OpenAI dashboard

## 🎯 Next Steps

After successful deployment:

1. **Update iOS app** with production API URL
2. **Update web dashboard** with production URL
3. **Test cross-platform sync** between iOS and web
4. **Monitor performance** and optimize as needed
5. **Set up custom domain** (optional)
6. **Enable Vercel Analytics** for insights

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

---

**Need help?** Check the troubleshooting section or review the logs in Vercel and Supabase dashboards.
