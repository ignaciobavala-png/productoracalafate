# Componentes

Catalogo de los 17 componentes del proyecto. Todos son Client Components (`"use client"`) salvo indicacion.

---

## Navbar

**Archivo:** `src/components/Navbar.tsx`

**Proposito:** Header fijo superior con logo, links de navegacion, LanguageSwitcher, InvitationButton y MobileMenu.

**Estado:** `scrolled` (boolean) — detecta si el hero salio del viewport (`bottom < 64px`).

**Comportamiento reactivo al scroll:**
- Sobre Hero (fondo oscuro): `bg-transparent`, texto `text-canvas` / `text-on-dark-soft`, borde `border-white/[0.06]`.
- Pasado el Hero: `bg-canvas/95`, texto `text-black`, borde `border-hairline`.
- Transicion: `transition-colors duration-300`.

**Props:** Ninguna. Lee `navLinks` de `mock-data.ts`.

**Edge cases:** `useEffect` con listener pasivo + cleanup. Llama `onScroll()` en mount para estado inicial.

---

## HeroSection

**Archivo:** `src/components/HeroSection.tsx`

**Proposito:** Seccion hero con video de fondo (o fallback oscuro), overlay, texto centrado con animacion Framer Motion.

**Props:**
| Prop | Tipo | Default | Descripcion |
|---|---|---|---|
| `videoSrc` | `string?` | — | URL del video MP4. Si no se pasa, muestra fondo `bg-surface-dark`. |

**Estado:** Lee `language` del store para texto bilingue.

**Estructura:** `relative min-h-screen` → capa `absolute inset-0` con `<video>` o `<div>` de fondo → overlay `bg-black/55` → contenido `relative z-10` con titulo (88px), tagline y fecha.

**Edge cases:** Si `videoSrc` esta presente pero el video falla, no hay fallback automatico (el poster `hero-fallback.jpg` aun no existe). El `<video>` usa `playsInline` para iOS.

---

## ManifestoSection

**Archivo:** `src/components/ManifestoSection.tsx`

**Proposito:** Seccion editorial con imagen a la izquierda y texto del manifiesto a la derecha.

**Estado:** Lee `language` del store.

**Layout:** Grid 2 columnas. Imagen con `max-h-[55vh]` y `object-cover`. Texto con label, titulo y 2 parrafos.

**Edge cases:** Imagen es placeholder (src pendiente de foto real).

---

## ProgramSection

**Archivo:** `src/components/ProgramSection.tsx`

**Proposito:** Timeline de 3 dias con 7 items de agenda, completamente bilingue.

**Estado:** Lee `language` del store.

**Estructura:** 3 bloques de dia (Day One/Two/Three) cada uno con 2-3 items de agenda. Los titulos y descripciones vienen del text map via `t("program.agenda.itemN.title", lang)` y `t("program.agenda.itemN.desc", lang)`.

**Dependencia:** No usa `mock-data.ts` para los items de agenda. Usa directamente `onboarding-text.ts`.

---

## PricingSection

**Archivo:** `src/components/PricingSection.tsx`

**Proposito:** Muestra el precio (USD 8.900), lista de incluye/excluye, y sticky price card.

**Estado:** Lee `language` del store.

**Datos:** `pricing` de `mock-data.ts` (incluye 7 items, excluye 4 items).

---

## OnboardingPage

**Archivo:** `src/components/OnboardingPage.tsx`

**Proposito:** Orquestador del formulario de registro en 4 pasos con AnimatePresence.

**Estado consumido del store:**
- `step` (1-5) — paso actual
- `language` — idioma
- `isSubmitted` — si ya se envio
- `data.acceptedTerms` — controla si se puede avanzar del paso 3 al 4
- `nextStep()`, `prevStep()` — navegacion

**Flujo:**
1. Si `isSubmitted === true` → renderiza `SuccessScreen`.
2. Si no → renderiza `StepIndicator` + paso activo (1-4) + botones Back/Next.
3. El boton Next en paso 3 se deshabilita si `!acceptedTerms`.

**Animacion:** `AnimatePresence mode="wait"` en titulo y contenido del paso.

**Props:** Ninguna.

---

## StepIndicator

**Archivo:** `src/components/onboarding/StepIndicator.tsx`

**Proposito:** Barra de progreso de 4 pasos con circulos numerados y labels bilingues.

**Estado:** Lee `step` y `language` del store.

**Visual:** 4 circulos conectados por lineas. Activo: `bg-ink text-canvas`. Inactivo: `border-hairline text-black/30`. Completado: check verde.

---

## StepPersonal

**Archivo:** `src/components/onboarding/StepPersonal.tsx`

**Proposito:** Paso 1 — Datos personales del huesped + datos del acompanante (condicional).

**Campos del huesped:** `fullName`, `nationality`, `dateOfBirth`, `email`, `phone`, `wantsWhatsApp` (checkbox), `isComingAlone` (radio: solo/acompanado).

**Campos del acompanante:** Se muestran solo si `isComingAlone === false`. Mismos 6 campos: `fullName`, `nationality`, `dateOfBirth`, `email`, `phone`, `wantsWhatsApp`.

**Acciones del store:** `updateField()`, `updateCompanionField()`.

---

## StepDocuments

**Archivo:** `src/components/onboarding/StepDocuments.tsx`

**Proposito:** Paso 2 — Restricciones alimenticias, documentos y bio.

**Componentes:**
- **Dietary chips:** 6 opciones (Ninguna, Vegetariano, Vegano, Sin Gluten, Sin Lactosa, Otra). Logica exclusiva: seleccionar "Ninguna" desmarca todas las demas; seleccionar cualquiera desmarca "Ninguna". Valores siempre en espanol en el store.
- **Dietary details:** Textarea que aparece si hay restricciones != "Ninguna".
- **ID Photo dropzone:** Simula drag & drop, guarda `File | null` en el store.
- **Profile Photo dropzone:** Igual que ID photo.
- **Bio:** Textarea de 10 lineas.

**Acciones del store:** `toggleDietary()`, `updateField()`, `setIdPhoto()`, `setProfilePhoto()`.

---

## StepPayment

**Archivo:** `src/components/onboarding/StepPayment.tsx`

**Proposito:** Paso 3 — Seleccion de metodo de pago y aceptacion de terminos.

**Componentes:**
- **Checkbox factura:** `needsInvoice` (boolean).
- **6 metodos de pago** (de `mock-data.ts`):
  1. Transferencia CLP (Bice, pesos chilenos)
  2. Transferencia USD Chile (Bice, dolares)
  3. Transferencia EEUU (Community Federal Savings Bank)
  4. Global66
  5. Tarjeta de credito Chile (link de pago)
  6. Tarjeta de credito internacional (link de pago)
- **Checkbox terminos:** `acceptedTerms`. Texto legal completo de `onboarding-text.ts` (4 parrafos + politica de cancelacion).

**Acciones del store:** `updateField()`.

---

## StepConfirm

**Archivo:** `src/components/onboarding/StepConfirm.tsx`

**Proposito:** Paso 4 — Review de todos los datos antes de enviar.

**Bloques de revision:**
1. Datos personales (nombre, nacionalidad, DOB, email, telefono, WhatsApp)
2. Acompanante (si `isComingAlone === false`)
3. Documentos (dieta, archivos, bio)
4. Pago (metodo, factura)

**Boton Submit:** Ejecuta `submit()` del store (simulado con `setTimeout` 2s). Muestra spinner durante el envio.

---

## SuccessScreen

**Archivo:** `src/components/onboarding/SuccessScreen.tsx`

**Proposito:** Pantalla post-submit exitoso con animacion de check y link para volver al inicio.

**Estado:** Lee `language` del store.

---

## Footer

**Archivo:** `src/components/Footer.tsx`

**Proposito:** Footer con descripcion bilingue, contacto, link CTA al registro y creditos de diseno.

**Contenido:** Descripcion de la agencia, email `calafatesummits@gmail.com`, CTA "Solicitar Invitacion".

---

## LanguageSwitcher

**Archivo:** `src/components/LanguageSwitcher.tsx`

**Proposito:** Boton toggle ES/EN con estilo adaptativo al scroll.

**Props:**
| Prop | Tipo | Default | Descripcion |
|---|---|---|---|
| `scrolled` | `boolean?` | `false` | Define si usa tema claro u oscuro. |

**Estado:** Lee `language` y llama `setLanguage()` del store.

**Visual:** Idioma activo en `text-primary font-semibold`. Fondo vidrio `bg-white/[0.08]` (oscuro) o `bg-ink/[0.05]` (claro).

---

## InvitationButton

**Archivo:** `src/components/InvitationButton.tsx`

**Proposito:** Boton que abre el modal de invitacion. Texto bilingue.

**Props:** Ninguna. Lee `open()` de `invitation-store.ts`.

---

## InvitationModal

**Archivo:** `src/components/InvitationModal.tsx`

**Proposito:** Modal con formulario de codigo + email para solicitar invitacion.

**Estado:** `isOpen` de `invitation-store.ts`. Lee `language` del store de onboarding.

**Flujo:** Overlay con backdrop → formulario con 2 campos → boton enviar → animacion de exito.

---

## MobileMenu

**Archivo:** `src/components/MobileMenu.tsx`

**Proposito:** Menu hamburguesa para mobile con links de navegacion.

**Props:**
| Prop | Tipo | Default | Descripcion |
|---|---|---|---|
| `scrolled` | `boolean?` | `false` | Color de las barras: `bg-ink` (claro) o `bg-canvas` (oscuro). |

**Estado local:** `isOpen` (boolean).

**Animacion:** Las 3 barras se transforman en X con rotacion. Overlay full-screen con links centrados.

**Edge cases:** Cierra el menu al hacer click en un link.
