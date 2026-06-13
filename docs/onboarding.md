# Onboarding — Flujo de registro

Formulario de inscripcion en 4 pasos embebido en la homepage. Sin ruta separada.

## Arquitectura

```
OnboardingPage (orquestador)
├── StepIndicator (barra de progreso)
├── StepPersonal   (paso 1)
├── StepDocuments  (paso 2)
├── StepPayment    (paso 3)
├── StepConfirm    (paso 4)
└── SuccessScreen  (post-submit)
```

Todo se maneja con un unico store Zustand: `useOnboardingStore`.

## Store: `onboarding-store.ts`

### Estado

| Campo | Tipo | Inicial | Descripcion |
|---|---|---|---|
| `step` | `number` | `1` | Paso actual (1-4, 5 = success) |
| `language` | `"es" \| "en"` | `"es"` | Idioma activo |
| `data` | `Partial<GuestOnboardingData>` | `initialData` | Todos los datos del formulario |
| `isSubmitting` | `boolean` | `false` | Spinner durante submit |
| `isSubmitted` | `boolean` | `false` | Muestra SuccessScreen |

### Datos del formulario (`GuestOnboardingData`)

```typescript
interface GuestOnboardingData {
  fullName: string;
  nationality: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  wantsWhatsApp: boolean;
  isComingAlone: boolean | null;     // null = no respondido
  companion: CompanionData;          // 6 campos: fullName, nationality, dateOfBirth, email, phone, wantsWhatsApp
  dietaryRestrictions: string[];     // valores en espanol: "Ninguna", "Vegano", "Vegetariano", "Sin Gluten", "Sin Lactosa", "Otra"
  dietaryDetails: string;
  idPhoto: File | null;
  profilePhoto: File | null;
  bio: string;
  needsInvoice: boolean;
  paymentMethod: string;             // id del PaymentMethod seleccionado
  acceptedTerms: boolean;
}
```

### Acciones

| Accion | Descripcion |
|---|---|
| `setStep(n)` | Ir al paso `n` |
| `nextStep()` | Avanzar (max 5) |
| `prevStep()` | Retroceder (min 1) |
| `setLanguage(lang)` | Cambiar idioma |
| `updateField(key, value)` | Actualizar campo del huesped |
| `updateCompanionField(key, value)` | Actualizar campo del acompanante |
| `setIdPhoto(file)` | Guardar foto de documento |
| `setProfilePhoto(file)` | Guardar foto de perfil |
| `toggleDietary(restriction)` | Toggle de restriccion alimenticia |
| `submit()` | Enviar (simulado, 2s delay) |
| `reset()` | Volver al estado inicial |

## Logica de restricciones alimenticias (`toggleDietary`)

```
Si restriction === "Ninguna":
  → set ["Ninguna"] (exclusivo, borra todo lo demas)

Si restriction !== "Ninguna":
  → Si ya esta en el array: removerla
  → Si no esta: agregarla (y remover "Ninguna" si existe)
```

**Regla:** Los valores se almacenan siempre en espanol (`"Ninguna"`, `"Vegano"`, etc.). La UI traduce las labels segun `language`. Esto garantiza consistencia interna independientemente del idioma de la interfaz.

## Metodos de pago

6 metodos definidos en `mock-data.ts`:

| ID | Label | Moneda | Detalles |
|---|---|---|---|
| `transfer-clp` | Transferencia Chile (Pesos) | CLP | Bice CC 12-02013-9 |
| `transfer-usd` | Transferencia Chile (Dolares) | USD | Bice CC 013-12-04076-6 |
| `transfer-us` | Transferencia EEUU | USD | Community Federal Savings Bank |
| `global66` | Global66 | USD | Link de pago |
| `credit-cl` | Tarjeta Chile | CLP | Link de pago |
| `credit-intl` | Tarjeta Internacional | USD | Link de pago |

## Dropzones (StepDocuments)

Dos dropzones para archivos:
- **ID Photo:** Foto del documento de identidad.
- **Profile Photo:** Foto de perfil del huesped.

Implementacion actual: simulacion de drag & drop visual. Sin upload real a storage. Pendiente integrar con Supabase Storage + compresion client-side.

## Submit

Actualmente simulado:
```typescript
submit: async () => {
  set({ isSubmitting: true });
  await new Promise((r) => setTimeout(r, 2000));
  set({ isSubmitting: false, isSubmitted: true });
},
```

Pendiente: insert en tabla Supabase con los datos del formulario + upload de archivos.

## Navegacion entre pasos

- **Back:** Visible desde paso 2. Llama `prevStep()`.
- **Next:** Visible en pasos 1-3. En paso 3 se deshabilita si `!acceptedTerms`.
- **Submit:** En paso 4, reemplaza el boton Next. Ejecuta `submit()`.

## Terminos y condiciones

Texto legal completo en `onboarding-text.ts` bajo la key `terms`. Incluye:
- 4 parrafos de terminos generales
- Politica de cancelacion
- Se muestra en StepPayment con checkbox obligatorio
