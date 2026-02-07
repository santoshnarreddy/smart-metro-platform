-- Fix RLS policies that are causing permission errors

-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Safe volunteer profile access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate simpler policies for profiles
CREATE POLICY "users_select_own" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Drop ALL existing policies on feedback table
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can update all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can create their own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can update their own feedback" ON public.feedback;

-- Recreate feedback policies without problematic joins
CREATE POLICY "feedback_select_own" ON public.feedback
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "feedback_insert_own" ON public.feedback
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feedback_update_own" ON public.feedback
FOR UPDATE USING (auth.uid() = user_id);

-- Drop ALL existing policies on lost_and_found table
DROP POLICY IF EXISTS "Admins can update all reports" ON public.lost_and_found;
DROP POLICY IF EXISTS "Users can view all active lost and found reports" ON public.lost_and_found;
DROP POLICY IF EXISTS "Users can create their own reports" ON public.lost_and_found;
DROP POLICY IF EXISTS "Users can update their own reports" ON public.lost_and_found;

-- Recreate lost_and_found policies
CREATE POLICY "lost_found_select_active" ON public.lost_and_found
FOR SELECT USING ((status = 'active'::item_status) OR (user_id = auth.uid()));

CREATE POLICY "lost_found_insert_own" ON public.lost_and_found
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lost_found_update_own" ON public.lost_and_found
FOR UPDATE USING (auth.uid() = user_id);