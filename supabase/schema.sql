-- Enable PostGIS for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ── Tables ────────────────────────────────────────────────────────────────────

CREATE TABLE invaders (
  id          TEXT PRIMARY KEY,
  city        TEXT NOT NULL,
  lat         FLOAT,
  lng         FLOAT,
  points      INT NOT NULL DEFAULT 0,
  status      TEXT NOT NULL,
  hint        TEXT,
  image_url   TEXT
);

CREATE TABLE user_scans (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users ON DELETE CASCADE,
  invader_id  TEXT REFERENCES invaders(id) ON DELETE CASCADE,
  scan_status TEXT NOT NULL CHECK (scan_status IN ('scanned', 'seen', 'not_found')),
  scanned_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, invader_id)
);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE invaders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scans  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invaders are public"
  ON invaders FOR SELECT
  USING (true);

CREATE POLICY "users manage own scans"
  ON user_scans
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Spatial index ─────────────────────────────────────────────────────────────

CREATE INDEX invaders_location_idx ON invaders USING GIST (
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)
);
