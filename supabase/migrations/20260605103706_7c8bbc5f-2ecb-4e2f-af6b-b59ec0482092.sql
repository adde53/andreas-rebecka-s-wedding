-- Add category to photos and adjust RLS
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'wedding';

-- Drop old insert policy and recreate with category-aware rules
DROP POLICY IF EXISTS "Anyone can upload photos when enabled" ON public.photos;

-- Guests can upload wedding photos when uploads enabled
CREATE POLICY "Guests can upload wedding photos when enabled"
ON public.photos
FOR INSERT
TO public
WITH CHECK (category = 'wedding' AND uploads_enabled());

-- Admins can upload any photo (wedding or honeymoon) at any time
CREATE POLICY "Admins can upload any photo"
ON public.photos
FOR INSERT
TO public
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));