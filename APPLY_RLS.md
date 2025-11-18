# Apply RLS Policies to Supabase

## Quick Steps

1. Go to your Supabase project: https://supabase.com/dashboard/project/bhdyiudgtwddysontnrb

2. Navigate to **SQL Editor** in the left sidebar

3. Click **New Query**

4. Copy and paste the contents of `prisma/migrations/01_add_rls_policies.sql`

5. Click **Run** (or press Cmd/Ctrl + Enter)

6. You should see "Success. No rows returned" - this is normal!

## What This Does

- Enables Row Level Security on all tables
- Creates policies so users can only access their own data
- Creates a function to auto-create profiles when users sign up
- Sets up proper security for the leaderboard

## Verify It Worked

After running the SQL, you can verify by:

1. Go to **Database** → **Tables** in Supabase
2. Click on `profiles`, `pets`, or `messages`
3. Click the **Policies** tab
4. You should see multiple policies listed

## Set Up Auth Trigger (Important!)

After applying RLS, set up the auto-profile creation:

1. In Supabase, go to **Database** → **Triggers**
2. Click **Create a new trigger**
3. Fill in:
   - **Name**: `on_auth_user_created`
   - **Table**: `auth.users`
   - **Events**: Check `INSERT`
   - **Type**: `after`
   - **Orientation**: `row`
   - **Function**: Select `handle_new_user` from dropdown
4. Click **Confirm**

This ensures every new user automatically gets a profile record!

## Done!

Once RLS is applied, your backend is fully secured and ready to use! 🎉
