-- ============================================================
-- 018_companion_id_photo.sql
-- Foto de documento por acompañante. Hasta ahora solo el titular subía la
-- suya, así que el manifiesto de pasajeros quedaba incompleto para todo el
-- que viajaba acompañado.
-- ============================================================

ALTER TABLE public.companions
  ADD COLUMN IF NOT EXISTS id_photo_url text;
