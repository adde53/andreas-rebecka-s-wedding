-- Add wedding start and end time columns to wedding_settings
ALTER TABLE public.wedding_settings 
ADD COLUMN wedding_start_time timestamp with time zone,
ADD COLUMN wedding_end_time timestamp with time zone;