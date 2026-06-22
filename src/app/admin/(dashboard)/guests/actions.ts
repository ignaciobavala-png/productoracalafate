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

export async function exportGuestsData() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('guests')
    .select(`
      id, full_name, email, nationality, date_of_birth, phone,
      wants_whatsapp, is_coming_alone, dietary_restrictions, dietary_details,
      bio, needs_invoice, payment_method_id, accepted_terms, status,
      submitted_at, invitation_code,
      companions (full_name, email, nationality, date_of_birth, phone, dietary_restrictions)
    `)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

