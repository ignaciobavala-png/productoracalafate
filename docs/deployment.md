# Deploy

## Vercel

La aplicacion esta construida sobre Next.js y se despliega de forma nativa en Vercel.

### Pasos

1. Conectar el repositorio en Vercel.
2. Vercel detecta automaticamente el framework (Next.js).
3. Build command: `pnpm build` (configurado en `package.json`).
4. Output directory: `.next` (por defecto).
5. Install command: `pnpm install` (por defecto, por `pnpm-lock.yaml`).

### Variables de entorno requeridas

| Variable | Descripcion | Estado |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Pendiente |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Key anonima/publica de Supabase | Pendiente |

### Variables de entorno opcionales (futuro)

| Variable | Descripcion |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Key de servicio para Server Actions |
| `NEXT_PUBLIC_SITE_URL` | URL de produccion (para emails, metadata) |

## Dominio

Pendiente definir. Posible: `torresdelpaine2026.com` o subdominio de `productoracalafate.com`.

## Build local para verificacion

```bash
pnpm build
```

Esto ejecuta:
1. Compilacion con Turbopack (~11s)
2. TypeScript type-checking (~12s)
3. Generacion de paginas estaticas (~2s)

La build actual compila sin errores (0 errores TypeScript, 0 warnings).

## Consideraciones

- El video del hero (Pexels, ~22MB) se sirve desde `videos.pexels.com`. En produccion conviene hostearlo en un CDN propio o en Supabase Storage para evitar dependencia externa.
- Las imagenes placeholder deben reemplazarse antes del lanzamiento.
- Los terminos y condiciones deben ser revisados por un abogado.
