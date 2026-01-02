-- Create photos table for wedding gallery
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by TEXT,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view photos (public wedding gallery)
CREATE POLICY "Anyone can view photos"
ON public.photos
FOR SELECT
USING (true);

-- Allow anyone to upload photos (guests don't need accounts)
CREATE POLICY "Anyone can upload photos"
ON public.photos
FOR INSERT
WITH CHECK (true);

-- Create storage bucket for wedding photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-photos', 'wedding-photos', true);

-- Storage policies for the wedding photos bucket
CREATE POLICY "Anyone can view wedding photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'wedding-photos');

CREATE POLICY "Anyone can upload wedding photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'wedding-photos');