-- Fix contact_messages RLS policies
-- The issue is that all policies are RESTRICTIVE, which means access is denied by default
-- We need PERMISSIVE policies for the operations we want to allow

-- Drop the existing RESTRICTIVE INSERT policy
DROP POLICY IF EXISTS "Anyone can send messages" ON public.contact_messages;

-- Create a PERMISSIVE INSERT policy for public contact form submissions
CREATE POLICY "Anyone can send messages" 
ON public.contact_messages 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Drop and recreate the SELECT policy as PERMISSIVE (but still restricted to admins/editors)
DROP POLICY IF EXISTS "Admins and editors can view messages" ON public.contact_messages;

CREATE POLICY "Admins and editors can view messages" 
ON public.contact_messages 
FOR SELECT 
TO authenticated
USING (is_admin_or_editor(auth.uid()));

-- Drop and recreate the UPDATE policy as PERMISSIVE (but still restricted to admins/editors)
DROP POLICY IF EXISTS "Admins and editors can update messages" ON public.contact_messages;

CREATE POLICY "Admins and editors can update messages" 
ON public.contact_messages 
FOR UPDATE 
TO authenticated
USING (is_admin_or_editor(auth.uid()));

-- Add DELETE policy for admins/editors to manage messages
CREATE POLICY "Admins and editors can delete messages" 
ON public.contact_messages 
FOR DELETE 
TO authenticated
USING (is_admin_or_editor(auth.uid()));