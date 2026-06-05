ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS download_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_download_count(photo_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.photos SET download_count = download_count + 1 WHERE id = photo_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_download_count(uuid) TO anon, authenticated;