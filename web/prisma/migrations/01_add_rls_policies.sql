-- Row Level Security (RLS) Policies for Ghostagotchi
-- These policies ensure users can only access their own data

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- PETS POLICIES
-- ============================================

-- Allow users to view their own pet
CREATE POLICY "Users can view own pet"
  ON pets FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own pet
CREATE POLICY "Users can update own pet"
  ON pets FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to insert their own pet
CREATE POLICY "Users can insert own pet"
  ON pets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow service role to read all pets (for leaderboard)
-- Note: This is handled by using the service role key which bypasses RLS

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Allow users to view messages for their own pet
CREATE POLICY "Users can view own pet messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = messages.pet_id
      AND pets.user_id = auth.uid()
    )
  );

-- Allow users to insert messages for their own pet
CREATE POLICY "Users can insert own pet messages"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = messages.pet_id
      AND pets.user_id = auth.uid()
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to automatically create profile on user signup
-- This can be set up as a Supabase trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
-- Note: This trigger should be created on auth.users table in Supabase dashboard
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- NOTES
-- ============================================

-- To set up the auth trigger in Supabase:
-- 1. Go to Database > Functions in Supabase dashboard
-- 2. The handle_new_user function should be visible
-- 3. Go to Database > Triggers
-- 4. Create a new trigger on auth.users table:
--    - Name: on_auth_user_created
--    - Table: auth.users
--    - Events: INSERT
--    - Type: AFTER
--    - Function: handle_new_user
