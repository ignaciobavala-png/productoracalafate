'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateContent(id: string, formData: FormData) {
  const value_es = formData.get('value_es') as string
  const value_en = formData.get('value_en') as string

  const supabase = await createClient()
  await supabase.from('site_content').update({ value_es, value_en }).eq('id', id)
  revalidatePath('/admin/content')
  revalidatePath('/')
}
