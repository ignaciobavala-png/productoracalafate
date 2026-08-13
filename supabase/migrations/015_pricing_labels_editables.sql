-- Los títulos de "Qué incluye" y "No incluye" estaban hardcodeados en el
-- componente: si un viaje cambiaba sus políticas, Andrea no tenía dónde
-- editarlos. Se crean como filas de site_content para que sean editables
-- en ambos idiomas desde el admin, igual que el resto del contenido.

insert into site_content (trip_id, section, key, value_es, value_en)
select t.id, 'pricing', v.key, v.value_es, v.value_en
from trips t
cross join (values
  ('title',         'Qué incluye', 'What''s included'),
  ('excludesLabel', 'No incluye',  'Not included')
) as v(key, value_es, value_en)
on conflict (trip_id, section, key) do nothing;
