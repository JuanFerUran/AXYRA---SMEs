-- Supabase RLS Policies for `public.profiles` table
-- Run this in Supabase SQL editor (Database → New Query)

-- 1. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Users can view their own profile
CREATE POLICY "users_can_select_own_profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 3. Policy: Users can update their own profile (except role)
CREATE POLICY "users_can_update_own_profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- 4. Policy: Service role can do anything (bypasses RLS automatically)
-- No explicit policy needed; service_role key always bypasses RLS

-- 5. Optional: Allow admins to view all profiles
-- Uncomment if you want to implement admin role checks
-- CREATE POLICY "admins_can_select_all" ON public.profiles
--   FOR SELECT
--   USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 6. Optional: Prevent users from changing their own role (already handled in UPDATE policy above)
-- The UPDATE policy checks that the role remains unchanged

-- Summary of policies:
-- - Everyone can view/update their own profile
-- - Users cannot change their own role
-- - Service role (backend) bypasses all RLS and can modify anything
-- - Admins can view all profiles (optional, commented out above)
