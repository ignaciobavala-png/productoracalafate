'use server'

import { createAdminClient } from '@/lib/supabase/admin'

type GuestUrlField = 'id_photo_url' | 'profile_photo_url' | 'payment_proof_url'

export async function updateGuestUrl(guestId: string, field: GuestUrlField, value: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('guests')
    .update({ [field]: value })
    .eq('id', guestId)
  if (error) console.error(`[updateGuestUrl] ${field}:`, error.message)
}
