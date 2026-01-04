-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create wedding_settings table for upload date control
CREATE TABLE public.wedding_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_enabled_from TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on wedding_settings
ALTER TABLE public.wedding_settings ENABLE ROW LEVEL SECURITY;

-- Insert default settings (uploads disabled until date is set)
INSERT INTO public.wedding_settings (upload_enabled_from) VALUES (NULL);

-- Add approved column to photos table
ALTER TABLE public.photos 
ADD COLUMN approved BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Create function to check if uploads are enabled
CREATE OR REPLACE FUNCTION public.uploads_enabled()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.wedding_settings
    WHERE upload_enabled_from IS NOT NULL 
      AND upload_enabled_from <= now()
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for wedding_settings
CREATE POLICY "Anyone can view settings"
ON public.wedding_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can update settings"
ON public.wedding_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Drop old photos policies
DROP POLICY IF EXISTS "Anyone can upload photos" ON public.photos;
DROP POLICY IF EXISTS "Anyone can view photos" ON public.photos;

-- New RLS Policies for photos
CREATE POLICY "Anyone can upload photos when enabled"
ON public.photos
FOR INSERT
WITH CHECK (public.uploads_enabled());

CREATE POLICY "Anyone can view approved photos"
ON public.photos
FOR SELECT
USING (approved = true);

CREATE POLICY "Admins can view all photos"
ON public.photos
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update photos"
ON public.photos
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete photos"
ON public.photos
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));