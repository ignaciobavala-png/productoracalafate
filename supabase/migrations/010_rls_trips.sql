-- ============================================================
-- 010_rls_trips.sql
-- RLS faltante en tabla trips — corrige exposición en producción
-- ============================================================
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trips: public read"
  ON trips FOR SELECT TO anon USING (true);

CREATE POLICY "trips: admin all"
  ON trips FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
