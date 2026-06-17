'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTrip(formData: FormData) {
  const name = (formData.get('name') as string).trim()
  const slug = (formData.get('slug') as string).trim().toLowerCase()

  if (!name || !slug) return

  const supabase = await createClient()

  const { data: trip, error } = await supabase
    .from('trips')
    .insert({ name, slug })
    .select('id')
    .single()

  if (error || !trip) return

  // Seed del contenido: copiar estructura de secciones/keys del primer viaje con valores vacíos
  const { data: template } = await supabase
    .from('site_content')
    .select('section, key')
    .eq('trip_id', '00000000-0000-0000-0000-000000000001')

  if (template && template.length > 0) {
    await supabase.from('site_content').insert(
      template.map((row) => ({
        trip_id: trip.id,
        section: row.section,
        key: row.key,
        value_es: '',
        value_en: '',
      }))
    )
  }

  revalidatePath('/admin/trips')
}

export async function toggleTripActive(id: string, is_active: boolean) {
  const supabase = await createClient()
  await supabase.from('trips').update({ is_active }).eq('id', id)
  revalidatePath('/admin/trips')
}
