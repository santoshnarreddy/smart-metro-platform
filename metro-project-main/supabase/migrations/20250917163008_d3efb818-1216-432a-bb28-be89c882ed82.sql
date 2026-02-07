-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Volunteers can view other volunteer profiles" ON public.profiles;

-- Create a safer policy that doesn't cause recursion
-- This policy allows users to view their own profile and admin users to view all profiles
CREATE POLICY "Safe volunteer profile access" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
  )
);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;