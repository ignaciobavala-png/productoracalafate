# Torres del Paine Summit 2026 — Productora Calafate

Plataforma privada de registro para evento exclusivo en la Patagonia chilena. Landing page editorial bilingüe ES/EN con puerta de código de invitación, formulario de inscripción real y panel de administración completo.

## Stack

Next.js 16.2.9 (App Router) · React 19 · Tailwind CSS v4 · Framer Motion v12 · Zustand v5 · Supabase (Auth + DB + Storage) · TypeScript strict · pnpm

## Setup local

```bash
cp .env.example .env.local
# completar las variables con los valores de Supabase
pnpm install
pnpm dev        # http://localhost:3000
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (público, cliente browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (solo server — no exponer al cliente) |

## Flujo principal

```
Homepage → "Solicitar Invitación" → modal código+email
  → código válido → formulario 4 pasos (personal, documentos, pago, confirmar)
  → submit → guests + companions en DB + fotos en Storage
  → admin recibe registro en /admin/guests
```

## Admin panel

Ruta: `/admin` (link discreto en footer → "acceso")

| Sección | Función |
|---|---|
| Registros | Listado de inscriptos, detalle con fotos y comprobante |
| Invitaciones | Generar/eliminar códigos, ver quién entró pero no completó |
| Contenido | Editar textos del sitio + subir video hero e imágenes |
| Métodos de pago | Activar/desactivar métodos, editar datos bancarios |
| Cuenta | Cambiar email y contraseña del admin |

## Documentación

| Documento | Contenido |
|---|---|
| [docs/architecture.md](./docs/architecture.md) | Stack, estructura, flujo de datos, admin |
| [docs/onboarding.md](./docs/onboarding.md) | Flujo de registro (4 pasos, store, pagos, Supabase) |
| [docs/development.md](./docs/development.md) | Convenciones, Supabase, gotchas críticos, pendientes |
| [docs/deployment.md](./docs/deployment.md) | Deploy en Vercel |
| [docs/design.md](./docs/design.md) | Sistema de diseño (tokens, tipografía, paleta glaciar) |
| [docs/i18n.md](./docs/i18n.md) | Sistema bilingüe ES/EN |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Historial de cambios |

## Estado actual

- Supabase: 7 tablas, 4 buckets, auth, RLS configurado
- Admin: login + dashboard completo (5 secciones)
- Registro: flujo completo funcional con Supabase
- Video hero: subir desde `/admin/content` → "Video hero" (formato MP4 H.264)
- Deploy: pendiente conectar repo a Vercel
