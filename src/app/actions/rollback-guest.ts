'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function rollbackGuestSubmission(guestId: string, invitationCode: string | null) {
  const supabase = createAdminClient()
  await supabase.from('guests').delete().eq('id', guestId)
  if (invitationCode) {
    await supabase.from('invitations').update({ used_by: null, used_at: null }).eq('used_by', guestId)
  }
}
