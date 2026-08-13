-- ============================================================
-- 016_storage_upload_authenticated.sql
-- Las policies de subida a los buckets de invitados eran solo TO anon:
-- si el formulario se completaba desde un navegador con sesión de admin
-- (rol authenticated), las tres subidas fallaban con
-- "new row violates row-level security policy for table objects"
-- y el alta se revertía. Se agrega el rol authenticated con el mismo
-- chequeo de path (primer segmento = uuid de un guest real).
-- ============================================================

-- ── guest-id-photos ──────────────────────────────────────────
DROP POLICY IF EXISTS "guest-id-photos: public upload" ON storage.objects;

CREATE POLICY "guest-id-photos: public upload"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'guest-id-photos'
    AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
    AND public.guest_exists(((storage.foldername(name))[1])::uuid)
  );

-- ── guest-profile-photos ─────────────────────────────────────
DROP POLICY IF EXISTS "guest-profile-photos: public upload" ON storage.objects;

CREATE POLICY "guest-profile-photos: public upload"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'guest-profile-photos'
    AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
    AND public.guest_exists(((storage.foldername(name))[1])::uuid)
  );

-- ── guest-payment-proofs ─────────────────────────────────────
DROP POLICY IF EXISTS "guest-payment-proofs: public upload" ON storage.objects;

CREATE POLICY "guest-payment-proofs: public upload"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'guest-payment-proofs'
    AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
    AND public.guest_exists(((storage.foldername(name))[1])::uuid)
  );
