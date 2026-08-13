'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function rollbackGuestSubmission(guestId: string, invitationCode: string | null) {
  const supabase = createAdminClient()
  // Primero liberar la invitación: invitations.used_by tiene FK a guests, así
  // que borrar el guest antes falla con 409 y deja el registro a medias y el
  // código quemado (pasó en producción el 13/08/2026).
  if (invitationCode) {
    await supabase.from('invitations').update({ used_by: null, used_at: null }).eq('used_by', guestId)
  }
  await supabase.from('guests').delete().eq('id', guestId)
}
