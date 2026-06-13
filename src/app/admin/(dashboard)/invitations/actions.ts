'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function createInvitation(formData: FormData) {
  const email = (formData.get('email') as string) || null
  const notes = (formData.get('notes') as string) || null

  const supabase = await createClient()
  await supabase.from('invitations').insert({
    code: generateCode(),
    assigned_email: email,
    notes,
  })
  revalidatePath('/admin/invitations')
}

export async function deleteInvitation(id: string, _formData: FormData) {
  const supabase = await createClient()
  await supabase.from('invitations').delete().eq('id', id)
  revalidatePath('/admin/invitations')
}
