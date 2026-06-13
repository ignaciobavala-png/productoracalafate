-- ============================================================
-- 004_seed.sql
-- Contenido inicial — volcado desde onboarding-text.ts y mock-data.ts
-- ============================================================

-- ── site_assets ──────────────────────────────────────────────
-- El video del hero actualmente es una URL de Pexels embebida en HeroSection.
-- Cuando se suba el video real a Supabase Storage, actualizar esta URL desde el dashboard.
INSERT INTO site_assets (key, url, type, label) VALUES
  (
    'hero_video',
    'https://videos.pexels.com/video-files/6985003/6985003-uhd_2560_1440_25fps.mp4',
    'video',
    'Video de fondo del Hero (Patagonia drone)'
  ),
  (
    'manifesto_photo',
    '',
    'image',
    'Foto editorial de la sección Manifiesto (pendiente de foto real)'
  );

-- ── site_content: hero ───────────────────────────────────────
INSERT INTO site_content (section, key, value_es, value_en) VALUES
  ('hero', 'location',  'Patagonia, Chile',                                             'Patagonia, Chile'),
  ('hero', 'title',     'Torres del Paine',                                             'Torres del Paine'),
  ('hero', 'subtitle',  'Summit 2026',                                                  'Summit 2026'),
  ('hero', 'tagline',   'No es una cumbre. No es una feria de contactos. Es un encuentro inusual.', 'Not a summit. Not a networking fair. An unusual encounter.'),
  ('hero', 'date',      'Abril 2026',                                                   'April 2026');

-- ── site_content: manifesto ──────────────────────────────────
INSERT INTO site_content (section, key, value_es, value_en) VALUES
  ('manifesto', 'label', 'El Manifiesto', 'The Manifesto'),
  ('manifesto', 'title', 'La desconexión como forma de encuentro', 'Disconnection as a form of encounter'),
  ('manifesto', 'p1',
    'Durante tres días, un grupo reducido de personas dejará atrás las notificaciones, los calendarios y las urgencias fabricadas. No se trata de una retirada ni de un retiro espiritual. Se trata de crear el espacio justo para que las conversaciones que importan —las que no caben en un mail ni en una videollamada— puedan ocurrir sin prisa.',
    'For three days, a small group of people will leave behind notifications, calendars, and manufactured urgencies. This is not a retreat nor a spiritual getaway. It is about creating just enough space so that the conversations that matter —the ones that don''t fit in an email or a video call— can unfold without hurry.'
  ),
  ('manifesto', 'p2',
    'El entorno no es decorado: es interlocutor. La Patagonia no impresiona para distraer, sino para recordar la escala real de las cosas. Acá, la desconexión no es ausencia: es la condición necesaria para una presencia más plena.',
    'The environment is not decoration: it is an interlocutor. Patagonia does not impress to distract, but to remind us of the true scale of things. Here, disconnection is not absence: it is the necessary condition for a fuller presence.'
  );

-- ── site_content: program ────────────────────────────────────
INSERT INTO site_content (section, key, value_es, value_en) VALUES
  ('program', 'label',       'El Programa',             'The Program'),
  ('program', 'title',       '¿Qué pasará estos días?', 'What will happen these days?'),
  ('program', 'description',
    'Sin horas rígidas. Sin bloques de PowerPoint. El paisaje y la conversación dictan el ritmo.',
    'No rigid schedules. No PowerPoint blocks. The landscape and conversation set the pace.'
  ),
  ('program', 'day1label',   'Día Uno',    'Day One'),
  ('program', 'day1sub',     'Llegar',     'Arrive'),
  ('program', 'day2label',   'Día Dos',    'Day Two'),
  ('program', 'day2sub',     'Profundizar','Go Deeper'),
  ('program', 'day3label',   'Día Tres',   'Day Three'),
  ('program', 'day3sub',     'Cerrar',     'Close'),
  -- Agenda items
  ('program', 'item1_title', 'Llegada al Silencio',      'Arrival into Silence'),
  ('program', 'item1_desc',
    'Arribo al Hotel Explora. Recepción sin pantallas. Una caminata de reconocimiento al atardecer para desacelerar el cuerpo y la mirada.',
    'Arrival at Hotel Explora. Screen-free reception. A sunset reconnaissance walk to slow down body and gaze.'
  ),
  ('program', 'item2_title', 'Cena de Apertura',         'Opening Dinner'),
  ('program', 'item2_desc',
    'Una mesa larga. Sin sitios asignados. Sin discursos. Vinos del sur y conversaciones que no caben en una tarjeta de presentación.',
    'A long table. No assigned seats. No speeches. Southern wines and conversations that don''t fit on a business card.'
  ),
  ('program', 'item3_title', 'Caminatas de Introspección','Walks of Introspection'),
  ('program', 'item3_desc',
    'Recorrido en silencio por los senderos del parque. El paisaje como interlocutor. Una pausa para escuchar sin interrumpir.',
    'Silent walks along the park trails. The landscape as interlocutor. A pause to listen without interrupting.'
  ),
  ('program', 'item4_title', 'Charlas Íntimas',          'Intimate Talks'),
  ('program', 'item4_desc',
    'Conversaciones junto al fuego. Sin escenario. Sin diapositivas. Ideas que solo se comparten cuando el entorno invita a la honestidad.',
    'Fireside conversations. No stage. No slides. Ideas only shared when the setting invites honesty.'
  ),
  ('program', 'item5_title', 'Comida Larga',             'Long Meal'),
  ('program', 'item5_desc',
    'Cocina de producto, cocina de tiempo. Un menú que respeta los ritmos de la tierra y extiende la sobremesa hasta que las velas se consumen.',
    'Ingredient-driven cooking, time-driven cooking. A menu that respects the rhythms of the land and extends the after-dinner until the candles burn out.'
  ),
  ('program', 'item6_title', 'Exploración Guiada',       'Guided Exploration'),
  ('program', 'item6_desc',
    'Salida a los miradores del macizo. Geología, flora, fauna. La inmensidad como recordatorio de la escala justa de nuestras urgencias.',
    'Outing to the massif viewpoints. Geology, flora, fauna. Vastness as a reminder of the right scale of our urgencies.'
  ),
  ('program', 'item7_title', 'Círculo de Cierre',        'Closing Circle'),
  ('program', 'item7_desc',
    'Una conversación final sin guion. Lo que queda después de tres días de distancia. Compromisos que no necesitan firma.',
    'A final unscripted conversation. What remains after three days of distance. Commitments that need no signature.'
  );

-- ── site_content: pricing ────────────────────────────────────
INSERT INTO site_content (section, key, value_es, value_en) VALUES
  ('pricing', 'label',          'Tarifa',                                                        'Pricing'),
  ('pricing', 'title',          'Qué incluye',                                                   'What''s included'),
  ('pricing', 'description',    'Una experiencia pensada para que nada distraiga de lo esencial.','An experience designed so nothing distracts from the essential.'),
  ('pricing', 'price',          '8.900',                                                         '8,900'),
  ('pricing', 'currency',       'USD',                                                           'USD'),
  ('pricing', 'note',           'Precio por persona. Sujeto a confirmación de invitación.',      'Price per person. Subject to invitation confirmation.'),
  ('pricing', 'includes_1',     '3 noches en Hotel Explora (suite individual)',                  '3 nights at Hotel Explora (individual suite)'),
  ('pricing', 'includes_2',     'Todas las comidas: desayuno, almuerzo, cena, coffee breaks',   'All meals: breakfast, lunch, dinner, coffee breaks'),
  ('pricing', 'includes_3',     'Barra abierta de vinos y espumantes chilenos',                 'Open bar of Chilean wines and sparkling wines'),
  ('pricing', 'includes_4',     'Excursiones guiadas dentro del Parque Nacional',               'Guided excursions within the National Park'),
  ('pricing', 'includes_5',     'Transfers desde/hacia Punta Arenas (ida y vuelta)',             'Transfers to/from Punta Arenas (round trip)'),
  ('pricing', 'includes_6',     'Equipamiento técnico para caminatas',                           'Technical equipment for hikes'),
  ('pricing', 'includes_7',     'Seguro de viaje dentro de Chile',                              'Travel insurance within Chile'),
  ('pricing', 'excludes_1',     'Vuelos internacionales o domésticos hasta Punta Arenas',       'International or domestic flights to Punta Arenas'),
  ('pricing', 'excludes_2',     'Estadías adicionales antes o después del evento',              'Additional stays before or after the event'),
  ('pricing', 'excludes_3',     'Servicios personales (spa, lavandería, llamadas)',             'Personal services (spa, laundry, calls)'),
  ('pricing', 'excludes_4',     'Propinas',                                                      'Tips');

-- ── site_content: footer ─────────────────────────────────────
INSERT INTO site_content (section, key, value_es, value_en) VALUES
  ('footer', 'description',
    'Un encuentro inusual en la Patagonia. Tres días de conversaciones reales, desconexión digital y paisaje indómito.',
    'An unusual encounter in Patagonia. Three days of real conversations, digital disconnection, and untamed landscape.'
  ),
  ('footer', 'design_credit', 'Diseño — Estudio Sur', 'Design — Estudio Sur');

-- ── payment_methods ──────────────────────────────────────────
INSERT INTO payment_methods (id, label, currency, details, sort_order) VALUES
  (
    'transfer-clp',
    'Transferencia bancaria en Chile (Pesos)',
    'CLP',
    ARRAY[
      'Productora Calafate SPA',
      'RUT: 78.102754-5',
      'Banco Bice',
      'Cuenta Corriente: 12-02013-9',
      'calafatesummits@gmail.com'
    ],
    1
  ),
  (
    'transfer-usd',
    'Transferencia bancaria en Chile (Dólares)',
    'USD',
    ARRAY[
      'Productora Calafate SPA',
      'RUT: 78.102754-5',
      'Banco Bice',
      'Cuenta Corriente: 013-12-04076-6',
      'andreagerardi@yahoo.com'
    ],
    2
  ),
  (
    'transfer-us',
    'Transferencia bancaria en EEUU',
    'USD',
    ARRAY[
      'Account Holder: Calafate SPA',
      'Account Number: 8333242022',
      'Routing Number: 026073150',
      'Swift / BIC: CMFGUS33',
      'Bank: Community Federal Savings Bank',
      'Bank Address: 5 Penn Plaza, 14th Floor, New York, NY 10001, US',
      'Company Address: Av. Andres Bello 2711, piso 16. Las Condes, Santiago de Chile'
    ],
    3
  ),
  (
    'global66',
    'Global66',
    'USD',
    ARRAY['Calafate SPA', '@CALAFCL002'],
    4
  ),
  (
    'card-cl',
    'Tarjeta de crédito (Chile)',
    'CLP',
    ARRAY['Solicitar link de pago Transbank a calafatesummits@gmail.com'],
    5
  ),
  (
    'card-intl',
    'Tarjeta de crédito (Fuera de Chile)',
    'USD',
    ARRAY['Solicitar link de pago a calafatesummits@gmail.com'],
    6
  );
