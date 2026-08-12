-- Número grande que se muestra en el itinerario.
-- Antes se usaba day_number (01, 02, 03), que es el orden del bloque y no
-- coincide con la fecha real del viaje: el bloque 3 puede ser "Día Cinco".
-- Con este campo el admin escribe lo que se ve en grande ("21", "22–24").
ALTER TABLE program_items
  ADD COLUMN IF NOT EXISTS day_date_label text NOT NULL DEFAULT '';

COMMENT ON COLUMN program_items.day_date_label IS
  'Etiqueta grande del día en el itinerario (ej. "21" o "22–24"). Vacío = se usa day_number.';
