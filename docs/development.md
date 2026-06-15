# Desarrollo

## Requisitos

- Node.js >= 18
- pnpm >= 9

## Setup local

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## Scripts

| Comando | Descripcion |
|---|---|
| `pnpm dev` | Servidor de desarrollo con Turbopack |
| `pnpm build` | Build de produccion (compilacion + TypeScript) |
| `pnpm start` | Iniciar servidor de produccion |
| `pnpm lint` | ESLint |

## Convenciones de codigo

### Server vs Client Components

- **Server Components por defecto.** Solo agregar `"use client"` cuando el componente necesite interactividad (event listeners, hooks, estado, animaciones).
- `page.tsx` y `layout.tsx` son Server Components.
- Todos los componentes en `src/components/` son Client Components.

### TypeScript

- Strict mode activado (`strict: true` en `tsconfig.json`).
- Interfaces en `src/types/index.ts`.
- Evitar `any`. Usar `unknown` si no se conoce el tipo.

### Estilos

- Tailwind v4 sin `tailwind.config.ts`. Usar las clases directamente.
- Tokens de color via `@theme inline` en `globals.css`.
- Sin `rounded-*` — la estetica editorial usa bordes rectos.
- Preferir `gap`, `flex`, `grid` sobre margins manuales.

### Estado

- Zustand para estado global (onboarding, invitation).
- Estado local con `useState` para UI efimera (menu mobile, hover states).
- No usar Context para estado global.

### Nombrado

- Componentes: PascalCase (`HeroSection`, `StepPersonal`).
- Funciones/utilidades: camelCase (`t()`, `updateField()`).
- Archivos: kebab-case de Next.js (`hero-section.tsx` no, pero el proyecto usa PascalCase en archivos de componentes).
- Keys i18n: camelCase con puntos (`"stepPersonal.fullNameLabel"`).

### Estructura de imports

```typescript
// 1. React / Next.js
import { useState } from "react";
import Link from "next/link";

// 2. Terceros
import { motion } from "framer-motion";

// 3. Stores
import { useOnboardingStore } from "@/store/onboarding-store";

// 4. Locales
import { t } from "@/lib/onboarding-text";
import type { NavLink } from "@/types";
```

## Supabase (funcionando)

### Stack actual

| Modulo | Archivo | Rol |
|---|---|---|
| Cliente browser | `src/lib/supabase/client.ts` | Inserción de guests, subida de archivos |
| Cliente server | `src/lib/supabase/server.ts` | SSR para admin (getUser, fetch data) |
| Cliente admin | `src/lib/supabase/admin.ts` | Service role key para validar/consumir invitaciones |
| Middleware sesión | `src/lib/supabase/middleware.ts` | Refresh session + proteger admin |
| Server actions | `src/app/actions/validate-invitation.ts` | Validar código vs `invitations` |
| Server actions | `src/app/actions/consume-invitation.ts` | Marcar código como usado |
| Server actions | `src/app/actions/log-invitation-request.ts` | Log de intentos fallidos |

### Tablas en Supabase

| Tabla | Uso |
|---|---|
| `guests` | Datos del registrado + `invitation_code`, fotos, status (pending/confirmed/rejected) |
| `companions` | Acompañante (FK a guests) |
| `invitations` | Códigos generados desde admin, con `used_by` y `used_at` |
| `invitation_requests` | Log de intentos de código (email + code_entered) |
| `payment_methods` | Métodos de pago (6 registros) |
| `site_content` | Texto bilingüe editable desde admin |
| `site_assets` | URLs de video hero e imágenes |

### Buckets de Storage

| Bucket | Uso | Visibilidad |
|---|---|---|
| `guest-id-photos` | Foto de documento | Privado (signed URLs) |
| `guest-profile-photos` | Foto de perfil | Privado (signed URLs) |
| `guest-payment-proofs` | Comprobante de pago | Privado (signed URLs) |
| `site-assets` | Video hero + imágenes del sitio | Público |

## Admin panel

- Ruta: `/admin` (protegida por `src/proxy.ts` — Next.js 16 renombró middleware.ts)
- Login: email + password via `supabase.auth.signInWithPassword()`
- Secciones: Registros, Invitaciones, Contenido, Métodos de pago, Cuenta
- Para acceder: crear usuario en Supabase Auth > Users

### Nota sobre RLS y admin client

Toda operación de escritura sobre `guests` desde el lado del cliente usa `createAdminClient()` (service_role key). El cliente anon no tiene política UPDATE en la tabla `guests` — si se intenta una actualización con el cliente anon, Supabase la bloquea silenciosamente (sin error). Siempre usar Server Actions con `createAdminClient()` para updates de guests.

## Pendiente para producción

1. **Email transaccional:** Enviar confirmación al guest al completar registro. Con Gmail directo (sin Resend). Edge Function o nodemailer via Server Action.
2. **Rate limiting / CAPTCHA:** Proteger el endpoint de registro público.
3. **Video hero:** Subir video final a Supabase Storage `site-assets` desde `/admin/content`.
4. **Imágenes:** Subir foto de manifiesto y logo definitivos desde `/admin/content`.
5. **SEO:** Meta tags, Open Graph, sitemap.
6. **Deploy Vercel:** Variables de entorno `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
7. **Cron (opcional):** Limpiar `invitation_requests` viejos.
8. **GitHub:** Crear repo + conectar a Vercel para deploys automáticos.
