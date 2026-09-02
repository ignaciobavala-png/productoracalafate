'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/app/actions/consume-invitation'

type GuestUrlField = 'id_photo_url' | 'profile_photo_url' | 'payment_proof_url'

export async function updateGuestUrl(
  guestId: string,
  field: GuestUrlField,
  value: string
): Promise<ActionResult> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('guests')
    .update({ [field]: value })
    .eq('id', guestId)

  if (error) {
    // No se traga más: si falla, el archivo queda en el bucket pero la fila
    // sin URL y nadie se entera. Ahora el submit revierte y el invitado
    // reintenta.
    console.error(`[updateGuestUrl] ${field}:`, error.message)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
