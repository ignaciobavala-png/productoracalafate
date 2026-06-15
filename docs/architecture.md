# Arquitectura

## Stack

| Capa | Tecnologia | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.9 |
| UI | React | 19.2.4 |
| Estilos | Tailwind CSS (via PostCSS) | 4.3.1 |
| Animaciones | Framer Motion | 12.40.0 |
| Estado global | Zustand | 5.0.14 |
| Tipado | TypeScript (strict) | ~5.7 |
| Backend | Supabase (`@supabase/ssr` + `@supabase/supabase-js`) | ^0.12.0 / ^2.108.1 |
| Package manager | pnpm | — |

## Estructura de carpetas

```
src/
├── app/
│   ├── layout.tsx        # RootLayout: metadata, fuentes (Inter, Geist Mono), html/body
│   ├── page.tsx          # Home: Server Component — fetch site_content + site_assets, pasa content={} a secciones
│   └── globals.css       # @theme tokens, ::selection, body defaults
├── components/
│   ├── Navbar.tsx              # Header fijo, reactivo al scroll
│   ├── HeroSection.tsx         # Video background + overlay + texto centrado
│   ├── ManifestoSection.tsx    # 2-column editorial (imagen + texto)
│   ├── ProgramSection.tsx      # Timeline 3 dias, 7 items de agenda
│   ├── PricingSection.tsx      # Lista incluye/excluye + sticky price card
│   ├── OnboardingPage.tsx      # Orquestador de pasos con AnimatePresence
│   ├── Footer.tsx              # Footer bilingue con contacto y CTA
│   ├── LanguageSwitcher.tsx    # Toggle ES/EN
│   ├── InvitationButton.tsx    # Boton "Solicitar Invitacion"
│   ├── InvitationModal.tsx     # Modal con formulario codigo+email
│   ├── MobileMenu.tsx          # Menu hamburguesa mobile
│   └── onboarding/
│       ├── StepIndicator.tsx   # Indicador de 4 pasos
│       ├── StepPersonal.tsx    # Datos personales + acompanante
│       ├── StepDocuments.tsx   # Dieta, dropzones, bio
│       ├── StepPayment.tsx     # Metodos de pago + terminos
│       ├── StepConfirm.tsx     # Review + submit
│       └── SuccessScreen.tsx   # Pantalla de exito
├── app/
│   └── admin/              # Panel admin protegido por middleware
│       ├── login/          # Login con Supabase Auth (email+password)
│       ├── (dashboard)/    # Layout con sidebar + stats
│       │   ├── guests/     # Listado de registros + columna comprobante
│       │   ├── invitations/# Generar/eliminar códigos + sección "entró pero no completó"
│       │   ├── content/    # Editar texto del sitio + subir assets (acordeones)
│       │   ├── settings/   # Activar/desactivar métodos de pago (acordeones)
│       │   └── account/    # Cambiar email y contraseña del admin
│       └── ...layout.tsx
│   └── actions/            # Server Actions
│       ├── validate-invitation.ts
│       ├── consume-invitation.ts
│       ├── log-invitation-request.ts
│       └── update-guest-urls.ts   # Actualiza id/profile/payment URLs via admin client (bypass RLS)
├── lib/
│   ├── mock-data.ts         # navLinks, pricing, paymentMethods (6), agendaItems
│   ├── onboarding-text.ts   # ~280 claves bilingues ES/EN + helper t()
│   └── supabase/
│       ├── client.ts        # Cliente browser (client components)
│       ├── server.ts        # Cliente SSR (server components, Server Actions)
│       ├── middleware.ts     # Refresh session + proteger rutas
│       ├── admin.ts         # Service role key (validar/consumir invitaciones)
│       └── storage.ts       # uploadFile helper
├── store/
│   ├── onboarding-store.ts  # Estado del formulario: step, language, data, submit
│   └── invitation-store.ts  # Modal + unlock + validatedCode
├── proxy.ts                 # Next.js proxy (antes middleware.ts — renombrado en Next.js 16, protege /admin/*)
└── types/
    └── index.ts             # Interfaces: AgendaItem, NavLink, PricingInfo, PaymentMethod,
                               CompanionData, GuestOnboardingData, FileUploadState
```

## Arbol de componentes (page.tsx)

```
<RootLayout>
  <Navbar />                   ─ fixed, scroll-reactive
  <main>
    <HeroSection />            ─ id="hero", video bg, min-h-screen
    <ManifestoSection />       ─ id="manifesto", 2-col, min-h-screen
    <ProgramSection />         ─ id="program", timeline, min-h-screen
    <PricingSection />         ─ id="pricing", lista + price card, min-h-screen
    <OnboardingPage />         ─ id="onboarding", 4 pasos + success, min-h-screen
  </main>
  <Footer />
  <InvitationModal />          ─ overlay portal
</RootLayout>
```

Todas las secciones usan `min-h-screen flex flex-col justify-center` para experiencia tipo slide deck.

## Flujo de datos

```
Supabase DB (site_content, site_assets)
              ────► page.tsx [Server Component]
                      ────► HeroSection    (content={contentMap.hero}, heroVideoUrl)
                      ────► ManifestoSection (content={contentMap.manifesto})
                      ────► ProgramSection  (content={contentMap.program})
                      ────► PricingSection  (content={contentMap.pricing})
                      ────► Footer          (content={contentMap.footer})
              Cada sección: tc(key, fallback) = content?.[key]?.[language] ?? fallback

mock-data.ts ────► Navbar (navLinks)
              ────► StepPayment (paymentMethods)
              ────► CARD_PAYMENT_METHODS → OnboardingPage (validación paso 3)

onboarding-text.ts ────► Fallback de texto en todos los componentes de sección
                    ────► StepPersonal, StepDocuments, StepPayment, StepConfirm
                    ────► t("key.path", language) retorna string en ES o EN

onboarding-store.ts ────► OnboardingPage (step, isSubmitted, nextStep, prevStep)
                    ────► StepPersonal (data, updateField, updateCompanionField)
                    ────► StepDocuments (data, toggleDietary, setIdPhoto, setProfilePhoto)
                    ────► StepPayment (data, updateField, setPaymentProof)
                    ────► StepConfirm (data, submit)
                    ────► SuccessScreen (reset)

invitation-store.ts ────► InvitationButton (open)
                    ────► InvitationModal (isOpen, close)
                    ────► OnboardingPage (isUnlocked, validatedCode)
                    ────► onboarding-store.submit() (validatedCode)
```

## Flujo de invitación (homepage → Supabase)

```
Usuario ingresa código + email
  → validateInvitationCode(code) [server action]
    → SELECT code FROM invitations WHERE code=? AND used_by IS NULL
    → Si válido: invitation-store.unlock(code)
      → OnboardingPage detecta isUnlocked=true, renderiza wizard
      → Usuario completa formulario 4 pasos
      → onboarding-store.submit():
        1. INSERT guests (con invitation_code=validatedCode)
        2. consumeInvitationCode(code, guestId) [server action]
           → UPDATE invitations SET used_by=guestId, used_at=now()
        3. Upload fotos a Storage (id, profile, payment)
        4. INSERT companions (si aplica)
```

## Admin panel

```
Proxy (src/proxy.ts — Next.js 16 renombró middleware.ts):
  /admin/* → updateSession() → verifica getUser()
  Sin sesión → redirect /admin/login
  Con sesión → permite acceso

AdminLayout (server component):
  getUser() → si no hay user, redirect /admin/login
  Fetch stats: total guests, pending, unused codes
  Render sidebar + children

Secciones admin:
  /admin/guests      → Listado de registrados + comprobante link
  /admin/invitations → Generar/eliminar códigos + "entró pero no completó"
  /admin/content     → Editar site_content + subir site_assets (acordeones)
  /admin/settings    → Gestionar payment_methods (acordeones)
  /admin/account     → Cambiar email y contraseña del usuario admin

Server actions admin:
  loginAction()  → signInWithPassword()
  logoutAction() → signOut()
  createInvitation() / deleteInvitation()
  updateContent() + revalidatePath('/') + revalidatePath('/admin/content')
  updateGuestStatus()
  togglePaymentMethod() / updatePaymentDetails()
  updateEmail() / updatePassword()     ← PKCE-safe, usa createClient()
  updateGuestUrl(id, field, url)       ← usa createAdminClient() — bypass RLS anon
```

## Server vs Client Components

- **Server Components** (por defecto): `page.tsx`, `layout.tsx`, todas las `page.tsx` de admin.
- **Client Components** (`"use client"`): componentes de sección (scroll, animaciones), componentes de formulario (stores, event handlers), `AccountForms.tsx` (useActionState), `SidebarNav.tsx`.
- **Patrón de contenido dinámico:** Server Component fetchea datos → pasa como props → Client Component usa `tc(key, fallback)` para degradar si falta la clave en DB.

## Tailwind v4

Sin `tailwind.config.ts`. Los tokens se definen con `@theme inline` en `globals.css`. Las clases de color se usan directamente: `bg-primary`, `text-canvas`, `border-hairline`, etc.
