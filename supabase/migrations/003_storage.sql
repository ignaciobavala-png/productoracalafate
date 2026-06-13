-- ============================================================
-- 003_storage.sql
-- Supabase Storage buckets y políticas
-- ============================================================

-- ── Buckets ──────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'site-assets',
    'site-assets',
    true,  -- público: el sitio sirve el video hero y la foto del manifiesto directamente
    52428800,  -- 50 MB
    ARRAY['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'guest-id-photos',
    'guest-id-photos',
    false,  -- privado: documentos de identidad solo para el admin
    10485760,  -- 10 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'guest-profile-photos',
    'guest-profile-photos',
    false,  -- privado: fotos de perfil solo para el admin
    5242880,  -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  );

-- ── Políticas: site-assets (público) ─────────────────────────
CREATE POLICY "site-assets: public read"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'site-assets');

CREATE POLICY "site-assets: admin write"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-assets');

CREATE POLICY "site-assets: admin update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-assets');

CREATE POLICY "site-assets: admin delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-assets');

-- ── Políticas: guest-id-photos (privado) ─────────────────────
-- El anon puede subir (se llama en submit del formulario).
-- Solo admin puede leer.
CREATE POLICY "guest-id-photos: public upload"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'guest-id-photos');

CREATE POLICY "guest-id-photos: admin read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'guest-id-photos');

CREATE POLICY "guest-id-photos: admin delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'guest-id-photos');

-- ── Políticas: guest-profile-photos (privado) ────────────────
CREATE POLICY "guest-profile-photos: public upload"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'guest-profile-photos');

CREATE POLICY "guest-profile-photos: admin read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'guest-profile-photos');

CREATE POLICY "guest-profile-photos: admin delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'guest-profile-photos');
