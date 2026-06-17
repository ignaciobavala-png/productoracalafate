-- ============================================================
-- 006_trips.sql
-- Multi-viaje: tabla trips + trip_id en tablas existentes
-- ============================================================

-- ── trips ────────────────────────────────────────────────────
CREATE TABLE trips (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text UNIQUE NOT NULL,
  name       text NOT NULL,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Migrar el viaje existente como el primer trip
INSERT INTO trips (id, slug, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'torres-del-paine-2026', 'Torres del Paine Summit 2026');

-- ── site_content ─────────────────────────────────────────────
ALTER TABLE site_content ADD COLUMN trip_id uuid REFERENCES trips(id) ON DELETE CASCADE;
UPDATE site_content SET trip_id = '00000000-0000-0000-0000-000000000001';
ALTER TABLE site_content ALTER COLUMN trip_id SET NOT NULL;
ALTER TABLE site_content DROP CONSTRAINT site_content_section_key_key;
ALTER TABLE site_content ADD CONSTRAINT site_content_trip_section_key UNIQUE (trip_id, section, key);

-- ── site_assets ──────────────────────────────────────────────
ALTER TABLE site_assets ADD COLUMN trip_id uuid REFERENCES trips(id) ON DELETE CASCADE;
UPDATE site_assets SET trip_id = '00000000-0000-0000-0000-000000000001';
ALTER TABLE site_assets ALTER COLUMN trip_id SET NOT NULL;
ALTER TABLE site_assets DROP CONSTRAINT site_assets_key_key;
ALTER TABLE site_assets ADD CONSTRAINT site_assets_trip_key UNIQUE (trip_id, key);

-- ── invitations ──────────────────────────────────────────────
ALTER TABLE invitations ADD COLUMN trip_id uuid REFERENCES trips(id);
UPDATE invitations SET trip_id = '00000000-0000-0000-0000-000000000001';
ALTER TABLE invitations ALTER COLUMN trip_id SET NOT NULL;

-- ── guests ───────────────────────────────────────────────────
ALTER TABLE guests ADD COLUMN trip_id uuid REFERENCES trips(id);
UPDATE guests SET trip_id = '00000000-0000-0000-0000-000000000001';
ALTER TABLE guests ALTER COLUMN trip_id SET NOT NULL;

-- ── invitation_requests ──────────────────────────────────────
ALTER TABLE invitation_requests ADD COLUMN trip_id uuid REFERENCES trips(id);

-- ── índices ──────────────────────────────────────────────────
CREATE INDEX ON trips (is_active);
CREATE INDEX ON invitations (trip_id);
CREATE INDEX ON guests (trip_id);
CREATE INDEX ON site_content (trip_id);
CREATE INDEX ON site_assets (trip_id);
