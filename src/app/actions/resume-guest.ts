'use server'

import { createAdminClient } from '@/lib/supabase/admin'

/** Columnas de `guests` que escribe el formulario público. */
export type GuestFormRow = {
  full_name: string
  nationality: string | null
  date_of_birth: string | null
  document_number: string | null
  email: string
  phone: string | null
  wants_whatsapp: boolean
  is_coming_alone: boolean | null | undefined
  dietary_restrictions: string[]
  dietary_details: string
  bio: string
  needs_invoice: boolean
  payment_method_id: string | null
  accepted_terms: boolean
  invitation_code: string | null
  trip_id: string | null
}

export type ResumeResult =
  | { ok: true; guestId: string }
  | { ok: false; error: string }

/**
 * Retoma un registro que quedó a medias.
 *
 * `guests` tiene UNIQUE (trip_id, email): si un envío anterior creó la fila
 * pero murió antes de subir las fotos, todo reintento chocaba con un 23505 y
 * el invitado quedaba bloqueado para siempre ("este email ya fue registrado")
 * sin ninguna forma de completar ni corregir. Ahora ese choque se resuelve
 * pisando la fila propia en vez de rechazar el envío.
 *
 * Autorización: solo puede pisarla quien presente el mismo código de
 * invitación con el que se creó. El código se revalida acá contra la base —
 * no se confía en lo que manda el cliente.
 */
export async function resumeGuestSubmission(
  row: GuestFormRow
): Promise<ResumeResult> {
  const supabase = createAdminClient()

  if (!row.trip_id || !row.email) {
    return { ok: false, error: 'Faltan datos para retomar el registro.' }
  }

  const code = row.invitation_code?.trim().toUpperCase() ?? null
  if (!code) {
    return { ok: false, error: 'Falta el código de invitación.' }
  }

  const { data: invitation } = await supabase
    .from('invitations')
    .select('code')
    .eq('code', code)
    .eq('trip_id', row.trip_id)
    .single()

  if (!invitation) {
    return { ok: false, error: 'Código de invitación inválido.' }
  }

  const { data: existing, error: findError } = await supabase
    .from('guests')
    .select('id, invitation_code')
    .eq('trip_id', row.trip_id)
    .eq('email', row.email)
    .maybeSingle()

  if (findError) return { ok: false, error: findError.message }
  if (!existing) {
    return { ok: false, error: 'No se encontró un registro previo con ese email.' }
  }

  if ((existing.invitation_code ?? '').toUpperCase() !== code) {
    return {
      ok: false,
      error:
        'Ese email ya está registrado con otro código de invitación. Escribinos para que lo revisemos.',
    }
  }

  // Se pisan solo los campos del formulario. Las columnas de URLs quedan como
  // están: si el intento anterior alcanzó a subir alguna foto, no se pierde, y
  // si el invitado sube una nueva la sobrescribe el paso de subida.
  const { error: updateError } = await supabase
    .from('guests')
    .update({ ...row, invitation_code: code, updated_at: new Date().toISOString() })
    .eq('id', existing.id)

  if (updateError) return { ok: false, error: updateError.message }

  // El acompañante se vuelve a insertar desde el cliente en este mismo envío,
  // así que se limpia el anterior para no duplicarlo.
  const { error: companionError } = await supabase
    .from('companions')
    .delete()
    .eq('guest_id', existing.id)

  if (companionError) return { ok: false, error: companionError.message }

  return { ok: true, guestId: existing.id }
}
