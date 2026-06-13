# Torres del Paine Summit 2026 — Productora Calafate

Sitio web para el evento exclusivo en la Patagonia chilena. Landing page editorial con formulario de inscripcion real, diseno bilingue ES/EN.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Framer Motion v12 · Zustand v5 · TypeScript strict · pnpm

## Quick start

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # build de produccion
pnpm lint       # ESLint
```

## Estructura

```
src/
├── app/            # layout + page + globals.css
├── components/     # 17 componentes (5 secciones + navbar/footer + onboarding)
├── lib/            # mock-data, onboarding-text (i18n)
├── store/          # Zustand (onboarding, invitation)
└── types/          # Interfaces TypeScript
```

## Documentacion

Documentacion completa en [`docs/`](./docs/):

| Documento | Contenido |
|---|---|
| [docs/architecture.md](./docs/architecture.md) | Stack, estructura, arbol de componentes, data flow |
| [docs/components.md](./docs/components.md) | Catalogo de 17 componentes |
| [docs/onboarding.md](./docs/onboarding.md) | Flujo de registro (4 pasos, store, dieta, pagos) |
| [docs/design.md](./docs/design.md) | Sistema de diseno (tokens, tipografia, paleta glaciar) |
| [docs/i18n.md](./docs/i18n.md) | Sistema bilingue ES/EN |
| [docs/development.md](./docs/development.md) | Setup, convenciones, plan Supabase |
| [docs/deployment.md](./docs/deployment.md) | Deploy en Vercel |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Historial de cambios |

## Estado

- Build: compila sin errores (0 TS errors, 0 warnings)
- Video hero: Pexels placeholder (Patagonia drone, 1080p)
- Onboarding: formulario completo con submit simulado
- i18n: ~280 claves ES/EN
- Supabase: pendiente de integracion
- Imagenes: placeholders pendientes de reemplazo
