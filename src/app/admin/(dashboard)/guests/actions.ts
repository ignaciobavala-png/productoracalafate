'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateGuestStatus(
  guestId: string,
  status: 'pending' | 'confirmed' | 'rejected',
  _formData: FormData
) {
  const supabase = await createClient()
  await supabase.from('guests').update({ status }).eq('id', guestId)
  revalidatePath(`/admin/guests/${guestId}`)
  revalidatePath('/admin/guests')
}
