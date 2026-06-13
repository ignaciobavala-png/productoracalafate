# Sistema de diseno

Tokens reales aplicados en el proyecto. Definidos en `src/app/globals.css` via `@theme inline` (Tailwind v4).

## Paleta de color

### Superficies

| Token | Hex | Uso |
|---|---|---|
| `canvas` | `#ffffff` | Fondo principal, navbar scrolleado |
| `surface-soft` | `#f7f7f7` | Fondos secundarios |
| `surface-strong` | `#eef0f3` | Elevacion sutil |
| `surface-dark` | `#0a0b0d` | Hero fallback, fondos oscuros |
| `surface-dark-elevated` | `#16181c` | Cards sobre fondo oscuro |

### Brand (Azul glaciar)

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#387A92` | CTAs, acentos, links hover, seleccion |
| `primary-active` | `#2C6174` | Hover/press state |
| `primary-disabled` | `#9BB5C0` | Estado deshabilitado |

### Texto

| Token | Hex | Uso |
|---|---|---|
| `ink` | `#000000` | Titulos |
| `body` | `#000000` | Parrafos |
| `muted` | `#000000` | Texto secundario |
| `muted-soft` | `#000000` | Texto terciario |
| `on-primary` | `#ffffff` | Texto sobre primary |
| `on-dark` | `#ffffff` | Texto sobre fondos oscuros |
| `on-dark-soft` | `#a8acb3` | Texto secundario sobre oscuro |

> Nota: `ink`, `body`, `muted` y `muted-soft` comparten `#000000`. Es intencional para el diseno editorial monocromatico.

### Semanticos

| Token | Hex | Uso |
|---|---|---|
| `up` | `#05b169` | Exito, checks |
| `down` | `#cf202f` | Error |
| `accent-yellow` | `#f4b000` | Advertencia |

### Hairlines

| Token | Hex | Uso |
|---|---|---|
| `hairline` | `#dee1e6` | Bordes sobre canvas |
| `hairline-soft` | `#eef0f3` | Bordes sutiles |

## Tipografia

| Token | Font | Weights | Uso |
|---|---|---|---|
| `font-display` | Inter | 400, 600 | Display y headings |
| `font-sans` | Inter | 400, 600 | Body, UI |
| `font-mono` | Geist Mono | variable | Codigo, datos tecnicos |

Cargadas en `layout.tsx`:
```typescript
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "600"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
```

### Escala aplicada

| Elemento | Clase | Size |
|---|---|---|
| Hero titulo | `text-5xl sm:text-6xl md:text-7xl lg:text-[88px]` | 48-88px |
| Section heading | `text-2xl md:text-3xl` | 24-30px |
| Nav logo | `text-lg` | 18px |
| Nav links | `text-sm` | 14px |
| Body | `text-base` | 16px |
| Labels / meta | `text-xs` | 12px |

## Radios

| Token | Valor | Uso |
|---|---|---|
| `pill` | `100px` | Botones full-rounded |
| `card` | `24px` | Cards |
| `input` | `12px` | Inputs, textareas |

> Nota: El diseno actual usa bordes rectos en su mayoria. Los radios estan definidos pero no se usan extensivamente — la estetica editorial prefiere esquinas cuadradas.

## Convenciones visuales

### Secciones 1:1 pantalla

Todas las secciones usan:
```
min-h-screen flex flex-col justify-center
```
Esto crea una experiencia tipo slide deck donde cada seccion ocupa exactamente el viewport.

### Navbar reactiva al fondo

- Sobre fondos oscuros: transparente con texto blanco y borde sutil.
- Sobre fondos claros: `bg-canvas/95` con texto negro y borde `hairline`.
- Transicion: `transition-colors duration-300`.

### Imagenes

- Imagenes editoriales usan `max-h-[55vh]` con `object-cover` para no desbordar el viewport.
- Sin `rounded-*` — bordes rectos consistentes con la estetica editorial.

### Overlay

- Hero overlay: `bg-black/55` sobre video/imagen.
- Modal backdrop: fondo semitransparente con blur.

### Seleccion

```css
::selection {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}
```

## Fuera de este documento

`DESIGN.md` (raiz del proyecto, 570 lineas) contiene el analisis original del diseno de Coinbase que inspiro los tokens. Ese documento usa `#0052ff` (Coinbase Blue) y Coinbase Display/Sans. El proyecto real se desvio a `#387A92` (azul glaciar) e Inter/Geist Mono.
