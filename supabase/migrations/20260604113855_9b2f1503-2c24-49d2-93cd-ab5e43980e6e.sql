CREATE TABLE public.site_visits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL UNIQUE,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  duration_seconds integer NOT NULL DEFAULT 0,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.site_visits TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_visits TO authenticated;
GRANT ALL ON public.site_visits TO service_role;

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert visit" ON public.site_visits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update their visit by session" ON public.site_visits
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can view all visits" ON public.site_visits
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_site_visits_started_at ON public.site_visits(started_at DESC);