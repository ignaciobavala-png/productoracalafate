-- ============================================================
-- 013_document_number.sql
-- Número de documento (DNI / pasaporte) del inscripto y su acompañante.
-- Pedido por la dueña: va después de la fecha de nacimiento.
-- ============================================================

ALTER TABLE guests     ADD COLUMN IF NOT EXISTS document_number text;
ALTER TABLE companions ADD COLUMN IF NOT EXISTS document_number text;
