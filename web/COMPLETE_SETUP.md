# 🎯 Complete Ghostagotchi Backend Setup

## ✅ Already Completed

- ✅ Next.js project created
- ✅ Dependencies installed
- ✅ Environment variables configured
- ✅ Database tables created (profiles, pets, messages)
- ✅ Test data seeded (5 ghost pets)
- ✅ Development server running at http://localhost:3000
- ✅ API tested and working (leaderboard endpoint)

## 🔐 Step 1: Apply RLS Policies (5 minutes)

### Option A: Copy-Paste in Supabase (Recommended)

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/bhdyiudgtwddysontnrb/sql/new

2. **Copy the RLS SQL:**
   - Open file: `web/prisma/migrations/01_add_rls_policies.sql`
   - Select all (Cmd/Ctrl + A) and copy (Cmd/Ctrl + C)

3. **Paste and Run:**
   - Paste into Supabase SQL Editor
   - Click "Run" button (or press Cmd/Ctrl + Enter)
   - You should see "Success. No rows returned" ✅

4. **Verify:**
   - Go to Database → Tables → `profiles`
   - Click "Policies" tab
   - You should see 3 policies listed

### Option B: Run Individual Statements

If the full SQL fails, run these key statements one by one:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Pets policies
CREATE POLICY "Users can view own pet" ON pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own pet" ON pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pet" ON pets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view own pet messages" ON messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM pets WHERE pets.id = messages.pet_id AND pets.user_id = auth.uid()));
CREATE POLICY "Users can insert own pet messages" ON messages FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM pets WHERE pets.id = messages.pet_id AND pets.user_id = auth.uid()));

-- Auto-create profile function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username) VALUES (NEW.id, NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🔔 Step 2: Set Up Auth Trigger (2 minutes)

This automatically creates a profile when users sign up:

1. **Go to Database → Triggers:**
   - https://supabase.com/dashboard/project/bhdyiudgtwddysontnrb/database/triggers

2. **Create New Trigger:**
   - Click "Create a new trigger" button
   - Fill in the form:
     - **Name:** `on_auth_user_created`
     - **Table:** `auth.users` (select from dropdown)
     - **Events:** Check ✅ `INSERT`
     - **Type:** `after`
     - **Orientation:** `row`
     - **Function to trigger:** Select `handle_new_user` from dropdown

3. **Save:**
   - Click "Confirm" or "Save"
   - You should see the trigger listed

## 🧪 Step 3: Test Protected Endpoints (5 minutes)

Now let's test the full authentication flow:

### Create a Test User

1. **Go to Supabase Authentication:**
   - https://supabase.com/dashboard/project/bhdyiudgtwddysontnrb/auth/users

2. **Add User:**
   - Click "Add user" → "Create new user"
   - Email: `test@ghostagotchi.com`
   - Password: `TestGhost123!`
   - Click "Create user"

3. **Get Auth Token:**
   - Click on the user you just created
   - Copy the "Access Token (JWT)" value

### Test API Endpoints

```bash
# Save your token
export TOKEN="your-jwt-token-here"

# Test: Get pet (should return 404 - no pet yet)
curl http://localhost:3000/api/pet \
  -H "Authorization: Bearer $TOKEN"

# Test: Create pet
curl -X POST http://localhost:3000/api/pet \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"TestGhost"}'

# Test: Get pet (should now return your pet)
curl http://localhost:3000/api/pet \
  -H "Authorization: Bearer $TOKEN"

# Test: Feed pet
curl -X POST http://localhost:3000/api/pet/feed \
  -H "Authorization: Bearer $TOKEN"

# Test: Play with pet
curl -X POST http://localhost:3000/api/pet/play \
  -H "Authorization: Bearer $TOKEN"

# Test: Chat with ghost (requires OpenAI)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"Hello! How are you?"}'

# Test: Update profile
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"username":"testuser"}'

# Test: Leaderboard (public - no auth needed)
curl http://localhost:3000/api/leaderboard
```

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] RLS policies visible in Supabase (Database → Tables → Policies tab)
- [ ] Auth trigger created (Database → Triggers)
- [ ] Test user created successfully
- [ ] Can create a pet via API
- [ ] Can feed/play with pet
- [ ] Can chat with ghost (OpenAI responds)
- [ ] Leaderboard shows all pets
- [ ] Profile can be updated

## 🎉 Success Criteria

You'll know everything is working when:

1. ✅ All API endpoints return proper responses (not 500 errors)
2. ✅ Authentication is enforced (401 without token)
3. ✅ Users can only access their own data
4. ✅ New users automatically get a profile
5. ✅ Ghost responds to chat messages
6. ✅ Leaderboard shows ranked pets

## 🚀 What's Next?

Once all steps are complete, you can:

1. **Deploy to Vercel** - See `web/DEPLOYMENT.md`
2. **Build Web Dashboard** - Create React UI for browser
3. **Build iOS App** - SwiftUI + ARKit for mobile
4. **Add Features** - Hunger decay, notifications, achievements

## 📚 Documentation

- **API Testing:** `web/API_TESTING.md`
- **Deployment:** `web/DEPLOYMENT.md`
- **Quick Reference:** `web/QUICK_REFERENCE.md`
- **Full Guide:** `web/README.md`

## 🆘 Troubleshooting

### RLS Policies Not Working
- Verify policies exist: Database → Tables → Select table → Policies tab
- Check auth token is valid and not expired
- Ensure user_id matches in database

### Auth Trigger Not Working
- Check trigger exists: Database → Triggers
- Verify function `handle_new_user` exists: Database → Functions
- Test by creating a new user and checking profiles table

### OpenAI Errors
- Verify API key is valid: https://platform.openai.com/api-keys
- Check you have credits: https://platform.openai.com/usage
- Ensure key starts with `sk-`

### Database Connection Issues
- Verify DATABASE_URL in `.env.local`
- Check password is URL-encoded (@ becomes %40)
- Ensure using connection pooling (port 6543)

## 📞 Need Help?

1. Check server logs in terminal
2. Check Supabase logs: Dashboard → Logs
3. Review error messages carefully
4. Consult documentation files in `web/`

---

**Current Status:** Backend is 95% complete! Just need to apply RLS policies and set up the auth trigger. 🎯
