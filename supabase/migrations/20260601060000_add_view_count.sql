ALTER TABLE photos ADD COLUMN view_count integer NOT NULL DEFAULT 0;

-- RPC to increment view count atomically
CREATE OR REPLACE FUNCTION increment_view_count(photo_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE photos SET view_count = view_count + 1 WHERE id = photo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

