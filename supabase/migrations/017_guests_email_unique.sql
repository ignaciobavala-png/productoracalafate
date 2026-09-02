-- ============================================================
-- 017_guests_email_unique.sql
-- La constraint UNIQUE (trip_id, email) ya está aplicada en producción desde
-- el 22/06/2026 (migración `012_guests_unique_email_per_trip` en el ledger de
-- Supabase), pero el .sql nunca se guardó en este directorio. Lo mismo pasó
-- con `013_companion_docs` y `014_payment_content_and_contact`, y encima los
-- números 012/013/014 se reutilizaron después para otras migraciones: el repo
-- y la base cuentan historias distintas.
--
-- Este archivo deja la constraint escrita para que un entorno nuevo salga
-- igual que producción. Es idempotente (Postgres no soporta ADD CONSTRAINT
-- IF NOT EXISTS), así que correrlo contra la base actual no hace nada.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.guests'::regclass
      AND conname  = 'guests_trip_id_email_unique'
  ) THEN
    ALTER TABLE public.guests
      ADD CONSTRAINT guests_trip_id_email_unique UNIQUE (trip_id, email);
  END IF;
END $$;
