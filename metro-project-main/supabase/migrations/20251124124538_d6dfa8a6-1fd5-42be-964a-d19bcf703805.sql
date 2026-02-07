-- Add foreign key constraints for assistance_requests to profiles
ALTER TABLE public.assistance_requests
ADD CONSTRAINT assistance_requests_volunteer_id_fkey
FOREIGN KEY (volunteer_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

ALTER TABLE public.assistance_requests
ADD CONSTRAINT assistance_requests_requester_id_fkey
FOREIGN KEY (requester_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;