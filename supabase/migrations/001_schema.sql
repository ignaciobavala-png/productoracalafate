-- ============================================================
-- 001_schema.sql
-- Torres del Paine Summit 2026 — tablas principales
-- ============================================================

-- ── guests ──────────────────────────────────────────────────
CREATE TABLE guests (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Datos personales
  full_name            text NOT NULL,
  nationality          text,
  date_of_birth        date,
  email                text NOT NULL,
  phone                text,
  wants_whatsapp       boolean NOT NULL DEFAULT false,
  is_coming_alone      boolean,
  -- Documentos
  dietary_restrictions text[]  NOT NULL DEFAULT '{}',
  dietary_details      text    NOT NULL DEFAULT '',
  id_photo_url         text,
  profile_photo_url    text,
  bio                  text    NOT NULL DEFAULT '',
  -- Pago
  needs_invoice        boolean NOT NULL DEFAULT false,
  payment_method_id    text,
  accepted_terms       boolean NOT NULL DEFAULT false,
  -- Metadatos
  invitation_code      text,
  status               text    NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'confirmed', 'rejected')),
  submitted_at         timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- ── companions ───────────────────────────────────────────────
CREATE TABLE companions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id       uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  full_name      text NOT NULL,
  nationality    text,
  date_of_birth  date,
  email          text,
  phone          text,
  wants_whatsapp boolean NOT NULL DEFAULT false
);

-- ── invitations ──────────────────────────────────────────────
-- Códigos generados por el admin para invitar a un huésped.
CREATE TABLE invitations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code           text UNIQUE NOT NULL,
  assigned_email text,
  used_by        uuid REFERENCES guests(id),
  used_at        timestamptz,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ── invitation_requests ──────────────────────────────────────
-- Lo que ingresa un visitante en el modal de invitación.
CREATE TABLE invitation_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_entered text,
  email        text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ── payment_methods ──────────────────────────────────────────
CREATE TABLE payment_methods (
  id         text PRIMARY KEY,
  label      text    NOT NULL,
  currency   text    NOT NULL,
  details    text[]  NOT NULL DEFAULT '{}',
  is_active  boolean NOT NULL DEFAULT true,
  sort_order int     NOT NULL DEFAULT 0
);

-- ── site_content ─────────────────────────────────────────────
-- Texto editorial bilingüe editable desde el dashboard.
-- section + key = clave única (ej: 'hero' + 'title')
CREATE TABLE site_content (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section    text NOT NULL,
  key        text NOT NULL,
  value_es   text NOT NULL DEFAULT '',
  value_en   text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (section, key)
);

-- ── site_assets ──────────────────────────────────────────────
-- Assets binarios editables (video hero, foto manifiesto, etc.)
-- url apunta a Supabase Storage bucket 'site-assets' o URL externa.
CREATE TABLE site_assets (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text UNIQUE NOT NULL,
  url        text NOT NULL,
  type       text NOT NULL CHECK (type IN ('video', 'image', 'document')),
  label      text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── índices ──────────────────────────────────────────────────
CREATE INDEX ON guests (email);
CREATE INDEX ON guests (status);
CREATE INDEX ON guests (invitation_code);
CREATE INDEX ON companions (guest_id);
CREATE INDEX ON invitations (code);
CREATE INDEX ON site_content (section);

-- ── updated_at automático ────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER site_assets_updated_at
  BEFORE UPDATE ON site_assets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
