-- ============================================================
-- 002_rls.sql
-- Row Level Security
-- ============================================================
-- Modelo de acceso:
--   anon (público):        INSERT en submissions, SELECT en contenido del sitio
--   authenticated (admin): acceso total vía service_role o sesión autenticada

ALTER TABLE guests              ENABLE ROW LEVEL SECURITY;
ALTER TABLE companions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods     ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content        ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_assets         ENABLE ROW LEVEL SECURITY;

-- ── guests ───────────────────────────────────────────────────
-- Cualquier visitante puede registrarse (INSERT).
-- Solo admin puede ver registros.
CREATE POLICY "guests: public insert"
  ON guests FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "guests: admin all"
  ON guests FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── companions ───────────────────────────────────────────────
CREATE POLICY "companions: public insert"
  ON companions FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "companions: admin all"
  ON companions FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── invitations ──────────────────────────────────────────────
-- Solo admin. El público valida un código via función/API, nunca SELECT directo.
CREATE POLICY "invitations: admin all"
  ON invitations FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── invitation_requests ──────────────────────────────────────
CREATE POLICY "invitation_requests: public insert"
  ON invitation_requests FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "invitation_requests: admin all"
  ON invitation_requests FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── payment_methods ──────────────────────────────────────────
-- El público ve solo los métodos activos.
CREATE POLICY "payment_methods: public read active"
  ON payment_methods FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "payment_methods: admin all"
  ON payment_methods FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── site_content ─────────────────────────────────────────────
CREATE POLICY "site_content: public read"
  ON site_content FOR SELECT TO anon
  USING (true);

CREATE POLICY "site_content: admin all"
  ON site_content FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── site_assets ──────────────────────────────────────────────
CREATE POLICY "site_assets: public read"
  ON site_assets FOR SELECT TO anon
  USING (true);

CREATE POLICY "site_assets: admin all"
  ON site_assets FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
