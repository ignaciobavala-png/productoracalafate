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

6 metodos en `mock-data.ts` (editables desde `/admin/settings`). Se dividen en dos tipos con UX diferente:

**Transferencias** — muestran datos bancarios con botones de copia y requieren comprobante:

| ID | Label | Moneda |
|---|---|---|
| `transfer-clp` | Transferencia Chile (Pesos) | CLP |
| `transfer-usd` | Transferencia Chile (Dólares) | USD |
| `transfer-us` | Transferencia EEUU | USD |
| `global66` | Global66 | USD |

**Tarjetas** (`CARD_PAYMENT_METHODS` en `mock-data.ts`) — muestran info box, sin dropzone:

| ID | Label | Moneda |
|---|---|---|
| `card-cl` | Tarjeta Chile | CLP |
| `card-intl` | Tarjeta Internacional | USD |

### Comprobante de pago

- Solo requerido para métodos de transferencia.
- `ProofDropzone` en `StepPayment` — ícono upload en vacío, checkmark verde con archivo.
- `isStep3Ready = !!paymentMethod && !!acceptedTerms && (esCard || !!paymentProof)`
- El botón "Siguiente" en paso 3 queda deshabilitado si es transferencia sin comprobante.

## Dropzones (StepDocuments)

Tres dropzones para archivos (upload real a Supabase Storage):
- **ID Photo:** Foto del documento de identidad → bucket `guest-id-photos`
- **Profile Photo:** Foto de perfil del huesped → bucket `guest-profile-photos`
- **Payment Proof:** Comprobante de pago (en StepPayment) → bucket `guest-payment-proofs`

Upload en `onboarding-store.submit()` via `uploadFile()` de `storage.ts`. Los campos `_url` en la tabla `guests` se actualizan con `updateGuestUrl()` Server Action que usa `createAdminClient()` para bypassear la política RLS.

## Submit (real con Supabase)

El submit en `onboarding-store.ts`:

1. Obtiene el código validado de `useInvitationStore.getState().validatedCode`
2. Inserta en `guests` (incluye `invitation_code`)
3. Llama `consumeInvitationCode(code, guestId)` para marcar `used_by` y `used_at` en `invitations`
4. Sube fotos a Supabase Storage y llama `updateGuestUrl(guestId, field, url)` para cada una
   - `updateGuestUrl` usa `createAdminClient()` — el cliente anon no tiene UPDATE policy en `guests`
5. Inserta `companions` si corresponde
6. Muestra `SuccessScreen`

### Invitación gate

El formulario está protegido por `InvitationGate` (inline en `OnboardingPage.tsx`). Sin código válido no se renderiza el wizard. La validación va contra `invitations` via server action `validate-invitation.ts`.

## Navegacion entre pasos

- **Back:** Visible desde paso 2. Llama `prevStep()`.
- **Next:** Visible en pasos 1-3. En paso 3 se deshabilita si `!isStep3Ready` (requiere método + términos + comprobante si es transferencia).
- **Submit:** En paso 4, reemplaza el boton Next. Ejecuta `submit()`.

## Terminos y condiciones

Texto legal completo en `onboarding-text.ts` bajo la key `terms`. Incluye:
- 4 parrafos de terminos generales
- Politica de cancelacion
- Se muestra en StepPayment con checkbox obligatorio
