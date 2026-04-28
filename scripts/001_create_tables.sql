-- ============================================================
-- Wedding Venue Comparator - Database Schema
-- ============================================================

-- Benefits table (dynamic benefit types)
CREATE TABLE IF NOT EXISTS public.benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Sparkles',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Venues table
CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Junction table: which venue has which benefits
CREATE TABLE IF NOT EXISTS public.venue_benefits (
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  benefit_id UUID NOT NULL REFERENCES public.benefits(id) ON DELETE CASCADE,
  PRIMARY KEY (venue_id, benefit_id)
);

-- Enable RLS on all tables
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_benefits ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (no auth required - shared app)
CREATE POLICY "Allow public read benefits"  ON public.benefits  FOR SELECT USING (true);
CREATE POLICY "Allow public insert benefits" ON public.benefits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update benefits" ON public.benefits FOR UPDATE USING (true);
CREATE POLICY "Allow public delete benefits" ON public.benefits FOR DELETE USING (true);

CREATE POLICY "Allow public read venues"  ON public.venues  FOR SELECT USING (true);
CREATE POLICY "Allow public insert venues" ON public.venues FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update venues" ON public.venues FOR UPDATE USING (true);
CREATE POLICY "Allow public delete venues" ON public.venues FOR DELETE USING (true);

CREATE POLICY "Allow public read venue_benefits"  ON public.venue_benefits  FOR SELECT USING (true);
CREATE POLICY "Allow public insert venue_benefits" ON public.venue_benefits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update venue_benefits" ON public.venue_benefits FOR UPDATE USING (true);
CREATE POLICY "Allow public delete venue_benefits" ON public.venue_benefits FOR DELETE USING (true);

-- Seed default benefits
INSERT INTO public.benefits (id, label, icon, sort_order) VALUES
  (gen_random_uuid(), 'Buffet',           'UtensilsCrossed', 0),
  (gen_random_uuid(), 'Open Bar',         'Wine',            1),
  (gen_random_uuid(), 'Decoracao',        'Flower2',         2),
  (gen_random_uuid(), 'Som/DJ',           'Music',           3),
  (gen_random_uuid(), 'Suite',            'BedDouble',       4),
  (gen_random_uuid(), 'Estacionamento',   'Car',             5),
  (gen_random_uuid(), 'Gerador',          'Zap',             6),
  (gen_random_uuid(), 'Ar Condicionado',  'Snowflake',       7);
