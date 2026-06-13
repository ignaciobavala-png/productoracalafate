'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function togglePaymentMethod(id: string, active: boolean, _formData: FormData) {
  const supabase = await createClient()
  await supabase.from('payment_methods').update({ is_active: active }).eq('id', id)
  revalidatePath('/admin/settings')
}

export async function updatePaymentDetails(id: string, formData: FormData) {
  const label = formData.get('label') as string
  const details = (formData.get('details') as string)
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)

  const supabase = await createClient()
  await supabase.from('payment_methods').update({ label, details }).eq('id', id)
  revalidatePath('/admin/settings')
}
