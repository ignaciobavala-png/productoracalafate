-- Agrega company_name, company_email, location al footer
-- para que sean editables desde el admin.

-- 1. Insertar en el trip template (UUID fijo)
INSERT INTO site_content (trip_id, section, key, value_es, value_en)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'footer', 'company_name', 'Productora Calafate', 'Productora Calafate'),
  ('00000000-0000-0000-0000-000000000001', 'footer', 'company_email', 'calafatesummits@gmail.com', 'calafatesummits@gmail.com'),
  ('00000000-0000-0000-0000-000000000001', 'footer', 'location', 'Torres del Paine, Magallanes', 'Torres del Paine, Magallanes')
ON CONFLICT DO NOTHING;

-- 2. Insertar en todos los trips reales que aún no tengan estos campos
INSERT INTO site_content (trip_id, section, key, value_es, value_en)
SELECT t.id, 'footer', v.key, v.value_es, v.value_en
FROM trips t
CROSS JOIN (
  VALUES
    ('company_name',  'Productora Calafate',         'Productora Calafate'),
    ('company_email', 'calafatesummits@gmail.com',   'calafatesummits@gmail.com'),
    ('location',      'Torres del Paine, Magallanes','Torres del Paine, Magallanes')
) AS v(key, value_es, value_en)
WHERE t.id <> '00000000-0000-0000-0000-000000000001'
  AND NOT EXISTS (
    SELECT 1 FROM site_content sc
    WHERE sc.trip_id = t.id
      AND sc.section = 'footer'
      AND sc.key = v.key
  );
