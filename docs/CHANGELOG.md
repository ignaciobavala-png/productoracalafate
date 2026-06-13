# Changelog

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
