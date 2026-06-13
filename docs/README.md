# Documentacion — Torres del Paine Summit 2026

Sitio web de Productora Calafate para el evento exclusivo Torres del Paine Summit 2026. Landing page editorial con formulario de inscripcion real, diseno bilingue ES/EN y experiencia tipo deck de presentacion.

## Indice

| Documento | Contenido |
|---|---|
| [architecture.md](./architecture.md) | Stack tecnologico, estructura de carpetas, arbol de componentes, flujo de datos |
| [components.md](./components.md) | Catalogo completo de 17 componentes: props, estado, edge cases |
| [onboarding.md](./onboarding.md) | Flujo de registro a fondo: 4 pasos, store Zustand, logica de dieta, metodos de pago, dropzones |
| [design.md](./design.md) | Sistema de diseno real aplicado: tokens CSS, tipografia, paleta, convenciones visuales |
| [i18n.md](./i18n.md) | Sistema bilingue: uso de `t()`, estructura de keys, como agregar texto nuevo |
| [development.md](./development.md) | Setup local, scripts, convenciones de codigo, plan de integracion Supabase |
| [deployment.md](./deployment.md) | Deploy en Vercel, variables de entorno |
| [CHANGELOG.md](./CHANGELOG.md) | Historial de cambios |

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Framer Motion v12 · Zustand v5 · TypeScript strict · pnpm

## Fuera de docs/

- `DESIGN.md` (raiz) — Analisis de diseno original de Coinbase (570 lineas). Referencia historica, no refleja la paleta glaciar actual.
- `AGENTS.md` — Instrucciones para agentes de IA en el proyecto.
- `CLAUDE.md` — Contexto del desarrollador y convenciones personales.
