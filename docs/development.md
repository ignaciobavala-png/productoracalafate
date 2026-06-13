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

## Plan de integracion Supabase

### Pendiente

1. **Variables de entorno:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. **Cliente SSR:** Configurar `@supabase/ssr` en `src/lib/supabase/`.
3. **Schema:** Crear tablas `guests`, `companions`, `invitations`, `submissions`.
4. **RLS:** Politicas de acceso para insercion anonima.
5. **Storage:** Bucket para `id_photos` y `profile_photos`. Politicas public-read.
6. **Migraciones:** Archivos SQL en `supabase/migrations/`.
7. **Reemplazar submit simulado:** `onboarding-store.ts` → insert real en Supabase.
8. **Reemplazar invitation submit:** `InvitationModal` → verificar codigo contra tabla `invitations`.
9. **Edge Functions (opcional):** Email de confirmacion al submit exitoso.

### Estructura propuesta para cliente Supabase

```
src/lib/supabase/
├── client.ts       # Cliente browser (client components)
├── server.ts       # Cliente server (server components, Server Actions)
└── middleware.ts    # Middleware de sesion (opcional, sin auth por ahora)
```
