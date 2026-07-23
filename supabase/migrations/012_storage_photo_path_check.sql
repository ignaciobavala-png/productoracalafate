-- ============================================================
-- 012_storage_photo_path_check.sql
-- Restringe subidas anónimas a los buckets privados de invitados:
-- el primer segmento del path debe ser el UUID de un guest real.
-- Antes, las políticas solo chequeaban bucket_id, permitiendo subir
-- a cualquier ruta dentro del bucket.
-- ============================================================

-- Función auxiliar: chequea existencia de un guest sin depender del
-- RLS de la tabla `guests` (el rol anon no tiene SELECT sobre guests).
CREATE OR REPLACE FUNCTION public.guest_exists(guest_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.guests WHERE id = guest_id);
$$;

REVOKE ALL ON FUNCTION public.guest_exists(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.guest_exists(uuid) TO anon, authenticated;

-- ── guest-id-photos ──────────────────────────────────────────
DROP POLICY IF EXISTS "guest-id-photos: public upload" ON storage.objects;

CREATE POLICY "guest-id-photos: public upload"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'guest-id-photos'
    AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
    AND public.guest_exists(((storage.foldername(name))[1])::uuid)
  );

-- ── guest-profile-photos ─────────────────────────────────────
DROP POLICY IF EXISTS "guest-profile-photos: public upload" ON storage.objects;

CREATE POLICY "guest-profile-photos: public upload"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'guest-profile-photos'
    AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
    AND public.guest_exists(((storage.foldername(name))[1])::uuid)
  );

-- ── guest-payment-proofs ─────────────────────────────────────
DROP POLICY IF EXISTS "guest-payment-proofs: public upload" ON storage.objects;

CREATE POLICY "guest-payment-proofs: public upload"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'guest-payment-proofs'
    AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
    AND public.guest_exists(((storage.foldername(name))[1])::uuid)
  );
