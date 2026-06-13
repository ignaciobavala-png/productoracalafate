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
| Backend (pendiente) | Supabase (`@supabase/ssr` + `@supabase/supabase-js`) | ^0.12.0 / ^2.108.1 |
| Package manager | pnpm | — |

## Estructura de carpetas

```
src/
├── app/
│   ├── layout.tsx        # RootLayout: metadata, fuentes (Inter, Geist Mono), html/body
│   ├── page.tsx          # Home: compone las 5 secciones + Navbar + Footer + InvitationModal
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
├── lib/
│   ├── mock-data.ts        # navLinks, pricing, paymentMethods (6), agendaItems
│   └── onboarding-text.ts  # ~280 claves bilingues ES/EN + helper t()
├── store/
│   ├── onboarding-store.ts # Estado del formulario: step, language, data, submit
│   └── invitation-store.ts # Toggle del modal de invitacion (isOpen)
└── types/
    └── index.ts            # Interfaces: AgendaItem, NavLink, PricingInfo, PaymentMethod,
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
mock-data.ts ────► Navbar (navLinks)
              ────► PricingSection (pricing, paymentMethods)

onboarding-text.ts ────► Todos los componentes que muestran texto
                    ────► t("key.path", language) retorna string en ES o EN

onboarding-store.ts ────► OnboardingPage (step, isSubmitted, nextStep, prevStep)
                    ────► StepPersonal (data, updateField, updateCompanionField)
                    ────► StepDocuments (data, toggleDietary, setIdPhoto, setProfilePhoto)
                    ────► StepPayment (data, updateField)
                    ────► StepConfirm (data, submit)
                    ────► SuccessScreen (reset)
                    ────► Todos los componentes que leen language

invitation-store.ts ────► InvitationButton (open)
                    ────► InvitationModal (isOpen, close)
```

## Server vs Client Components

- **Server Components** (por defecto): `page.tsx`, `layout.tsx`.
- **Client Components** (`"use client"`): todos los demas — requieren interactividad (scroll, formularios, animaciones, stores).

## Tailwind v4

Sin `tailwind.config.ts`. Los tokens se definen con `@theme inline` en `globals.css`. Las clases de color se usan directamente: `bg-primary`, `text-canvas`, `border-hairline`, etc.
