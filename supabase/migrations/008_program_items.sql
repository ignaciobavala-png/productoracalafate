-- ============================================================
-- 008_program_items.sql
-- Programa dinámico: N días, M items por día, sin tocar código
-- ============================================================

CREATE TABLE program_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id         uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number      int  NOT NULL,
  -- Metadatos del día (se repiten en cada fila del día)
  day_label_es    text NOT NULL DEFAULT '',
  day_label_en    text NOT NULL DEFAULT '',
  day_subtitle_es text NOT NULL DEFAULT '',
  day_subtitle_en text NOT NULL DEFAULT '',
  -- Contenido del item
  title_es        text NOT NULL DEFAULT '',
  title_en        text NOT NULL DEFAULT '',
  description_es  text NOT NULL DEFAULT '',
  description_en  text NOT NULL DEFAULT '',
  sort_order      int  NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON program_items (trip_id, day_number, sort_order);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE program_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "program_items: public read"
  ON program_items FOR SELECT TO anon USING (true);

CREATE POLICY "program_items: admin all"
  ON program_items FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── Migrar datos del viaje template ──────────────────────────
-- Day 1 (items 1, 2)
INSERT INTO program_items (trip_id, day_number, day_label_es, day_label_en, day_subtitle_es, day_subtitle_en, title_es, title_en, description_es, description_en, sort_order)
SELECT
  '00000000-0000-0000-0000-000000000001',
  1,
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day1label'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day1label'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day1sub'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day1sub'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item1_title'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item1_title'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item1_desc'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item1_desc'),
  0;

INSERT INTO program_items (trip_id, day_number, day_label_es, day_label_en, day_subtitle_es, day_subtitle_en, title_es, title_en, description_es, description_en, sort_order)
VALUES (
  '00000000-0000-0000-0000-000000000001', 1,
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day1label'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day1label'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day1sub'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day1sub'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item2_title'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item2_title'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item2_desc'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item2_desc'),
  1
);

-- Day 2 (items 3, 4, 5)
INSERT INTO program_items (trip_id, day_number, day_label_es, day_label_en, day_subtitle_es, day_subtitle_en, title_es, title_en, description_es, description_en, sort_order)
VALUES (
  '00000000-0000-0000-0000-000000000001', 2,
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day2label'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day2label'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day2sub'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day2sub'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item3_title'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item3_title'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item3_desc'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item3_desc'),
  0
);

INSERT INTO program_items (trip_id, day_number, day_label_es, day_label_en, day_subtitle_es, day_subtitle_en, title_es, title_en, description_es, description_en, sort_order)
VALUES (
  '00000000-0000-0000-0000-000000000001', 2,
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day2label'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day2label'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day2sub'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day2sub'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item4_title'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item4_title'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item4_desc'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item4_desc'),
  1
);

INSERT INTO program_items (trip_id, day_number, day_label_es, day_label_en, day_subtitle_es, day_subtitle_en, title_es, title_en, description_es, description_en, sort_order)
VALUES (
  '00000000-0000-0000-0000-000000000001', 2,
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day2label'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day2label'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day2sub'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day2sub'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item5_title'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item5_title'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item5_desc'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item5_desc'),
  2
);

-- Day 3 (items 6, 7)
INSERT INTO program_items (trip_id, day_number, day_label_es, day_label_en, day_subtitle_es, day_subtitle_en, title_es, title_en, description_es, description_en, sort_order)
VALUES (
  '00000000-0000-0000-0000-000000000001', 3,
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day3label'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day3label'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day3sub'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day3sub'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item6_title'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item6_title'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item6_desc'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item6_desc'),
  0
);

INSERT INTO program_items (trip_id, day_number, day_label_es, day_label_en, day_subtitle_es, day_subtitle_en, title_es, title_en, description_es, description_en, sort_order)
VALUES (
  '00000000-0000-0000-0000-000000000001', 3,
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day3label'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day3label'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day3sub'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'day3sub'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item7_title'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item7_title'),
  (SELECT value_es FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item7_desc'),
  (SELECT value_en FROM site_content WHERE trip_id = '00000000-0000-0000-0000-000000000001' AND section = 'program' AND key = 'item7_desc'),
  1
);

-- Limpiar site_content: eliminar las keys que ya viven en program_items
DELETE FROM site_content
WHERE section = 'program'
  AND key IN (
    'day1label','day1sub','day2label','day2sub','day3label','day3sub',
    'item1_title','item1_desc','item2_title','item2_desc',
    'item3_title','item3_desc','item4_title','item4_desc','item5_title','item5_desc',
    'item6_title','item6_desc','item7_title','item7_desc'
  );
