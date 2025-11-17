# Ghostagotchi Backend Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)
- OpenAI API account

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name**: ghostagotchi (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for development
4. Wait for project to be created (~2 minutes)

## Step 2: Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - keep this secret!)

3. Go to **Settings** → **Database**
4. Scroll to "Connection string" section
5. Copy the **URI** connection string (select "Use connection pooling" for better performance)
6. Replace `[YOUR-PASSWORD]` with your database password

## Step 3: Configure Authentication Providers

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. (Optional) Enable **Google** and **Apple** OAuth:
   - Click on each provider
   - Follow the setup instructions
   - Add redirect URLs

## Step 4: Update Environment Variables

1. Open `web/.env.local`
2. Replace the placeholder values with your actual credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
OPENAI_API_KEY=sk-your-openai-key
```

## Step 5: Get OpenAI API Key

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up or login
3. Go to **API Keys** section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. Add it to `.env.local` as `OPENAI_API_KEY`

## Step 6: Initialize Database

```bash
# Initialize Prisma
npm run prisma:generate

# Create database tables
npm run prisma:migrate

# (Optional) Seed with test data
npm run prisma:seed
```

## Step 7: Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## Troubleshooting

### Database Connection Issues
- Verify your DATABASE_URL is correct
- Check that your IP is allowed in Supabase (Settings → Database → Connection pooling)
- Ensure password doesn't contain special characters that need URL encoding

### Authentication Issues
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct
- Check that email provider is enabled in Supabase Auth settings

### OpenAI API Issues
- Verify your API key is valid
- Check you have credits available in your OpenAI account
- Ensure the key starts with `sk-`

## Next Steps

Once setup is complete, you can:
1. Test API endpoints using tools like Postman or curl
2. View database in Prisma Studio: `npm run prisma:studio`
3. Monitor real-time events in Supabase dashboard
4. Start building the iOS and web clients!
