# Changelog

## 2026-06-15 — UX pago, contenido dinámico, RLS bug fix, cuenta admin, acordeones

- **StepPayment reescrito:** `CopyButton` con clipboard y feedback visual, `ProofDropzone` (comprobante requerido solo para transferencias). Métodos de tarjeta muestran info box; transferencias muestran dropzone.
- **`CARD_PAYMENT_METHODS`** constante compartida en `mock-data.ts`. `OnboardingPage` bloquea "Siguiente" en paso 3 si hay transferencia sin comprobante.
- **Columna comprobante en /admin/guests:** link verde "✓ Ver" si `payment_proof_url` existe, "—" si no.
- **Contenido dinámico:** `page.tsx` convertido a Server Component. Fetch de `site_content` y `site_assets` en paralelo desde Supabase. Todos los componentes de sección aceptan `content?: SectionContent` con `tc(key, fallback)` para degradar a texto hardcodeado si falta la clave.
- **Invalidación de caché:** `revalidatePath('/')` agregado en `content/actions.ts` — cambios en admin se reflejan inmediatamente en homepage.
- **"Entró pero no completó":** nueva sección en `/admin/invitations` con badge amarillo. Cruza `invitation_requests` con `invitations` para detectar quién ingresó código válido pero no completó el registro. Deduplicación por email con `Set<string>`.
- **Bug crítico RLS resuelto:** `guests.update()` desde cliente anon era bloqueado silenciosamente (sin política UPDATE para anon en Supabase). Fix: Server Action `update-guest-urls.ts` con `createAdminClient()` (service_role key) para los 3 campos de URL (`id_photo_url`, `profile_photo_url`, `payment_proof_url`).
- **`/admin/account`:** nueva sección para cambiar email (envía link de confirmación al nuevo email via PKCE) y contraseña. `useActionState` en client component, Server Actions en `actions.ts`.
- **Acordeones en /admin/settings:** métodos de pago reescritos con `<details>`/`<summary>` al estilo de `/admin/content`. Cada método muestra label, moneda, badge activo/inactivo y formulario de edición colapsable.
- **Fix hydration:** formularios anidados en `/admin/settings` causaban error en React. Resuelto separando los dos `<form>` como hermanos y usando atributo `form="save-{id}"` en el botón de guardar.

## 2026-06-14 — Admin funcional + flujo de invitaciones completo + maqueta operativa

- **Middleware:** `src/middleware.ts` protege `/admin/*` con sesión de Supabase.
- **Admin login:** pantalla blanca/gris con autenticación por email+password.
- **Admin dashboard:** sidebar con stats (total/pendientes), navegación a registros, invitaciones, contenido, pagos. Toda la UI pasada de oscuro a blanco/gris.
- **Invitaciones:** generar/eliminar códigos desde el panel. Validación contra Supabase en la homepage.
- **Flujo registro real:** sube fotos a Supabase Storage, guarda guest + companion en DB, marca código como usado.
- **Server actions:** `validate-invitation`, `log-invitation-request`, `consume-invitation`.
- **Admin service client:** `src/lib/supabase/admin.ts` con service_role key para operaciones internas.
- **HeroSection:** fix 404 de `hero-fallback.jpg` (poster no existente).
- **Footer:** botón de aplicación removido (redundante con nav + homepage).

## 2026-06-13 — Scroll-reactive navbar + video hero

- Navbar ahora cambia de estilo segun la seccion visible: texto blanco sobre hero oscuro, texto negro sobre secciones claras (`bg-canvas/95`, `border-hairline`).
- Tipografia de links del navbar aumentada de `text-xs` a `text-sm`.
- `LanguageSwitcher` y `MobileMenu` reciben prop `scrolled` para adaptarse al fondo.
- Video de Pexels embebido en Hero (Patagonia drone, 1080p 60fps, ~22 MB).

## 2026-06-13 — Homepage reducida a 5 secciones esenciales

- Secciones eliminadas: Hotel, Origen, Organizadores, Participantes, Cierre.
- Secciones conservadas: Hero, Manifiesto, Programa, Tarifa, Registro.
- `onboarding-text.ts` reescrito limpio (estaba corrupto por ediciones anteriores).
- `ProgramSection` migrado a usar text map en vez de mock-data para los items de agenda.

## 2026-06-13 — Formulario de registro real

- Reconstruccion completa: 4 pasos reales (Personal, Documentos, Pago, Confirmar).
- Datos personales: nombre, nacionalidad, DOB, email, telefono, WhatsApp, solo/acompanado.
- Acompanante condicional: 6 campos identicos al huesped.
- Documentos: chips de dieta con logica exclusiva ("Ninguna"), dropzones ID/Profile photo, bio.
- Pago: 6 metodos con datos bancarios completos (CLP, USD Chile, EEUU, Global66, tarjetas).
- Terminos y condiciones completos bilingues (4 parrafos + politica de cancelacion).
- Submit simulado con spinner.

## 2026-06-13 — Bilingue completo

- Todo el sitio traducido ES/EN: Hero, Manifiesto, Programa (7 items), Tarifa, Registro (4 pasos), Footer, Modal de invitacion.
- ~280 claves en `onboarding-text.ts`.
- `LanguageSwitcher` en navbar con toggle visual.

## 2026-06-13 — Diseno glaciar

- Paleta cambiada de Coinbase Blue (`#0052ff`) a azul glaciar (`#387A92`).
- Active: `#2C6174`, Disabled: `#9BB5C0`.
- Texto corporal negro (`#000000`) en vez de gris — estetica editorial.
- Inter (400/600) como unica tipografia para display y body. Geist Mono para mono.
- Secciones 1:1 viewport (`min-h-screen`).

## 2026-06-13 — Scaffold inicial

- Next.js 16.2.9 + React 19.2.4 + Tailwind v4.3.1 + Framer Motion 12.40.0 + Zustand 5.0.14.
- Tipos, mock data, stores, estructura de componentes base.
- 17 componentes totales.
