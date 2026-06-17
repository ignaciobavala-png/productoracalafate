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

  const { data: assetTemplate } = await supabase
    .from('site_assets')
    .select('key, type, label')
    .eq('trip_id', '00000000-0000-0000-0000-000000000001')

  if (assetTemplate && assetTemplate.length > 0) {
    await supabase.from('site_assets').insert(
      assetTemplate.map((row) => ({
        trip_id: trip.id,
        key: row.key,
        type: row.type,
        label: row.label,
        url: '',
      }))
    )
  }

  // Copiar program_items del template
  const { data: programTemplate } = await supabase
    .from('program_items')
    .select('day_number, day_label_es, day_label_en, day_subtitle_es, day_subtitle_en, title_es, title_en, description_es, description_en, sort_order')
    .eq('trip_id', '00000000-0000-0000-0000-000000000001')
    .order('day_number')
    .order('sort_order')

  if (programTemplate && programTemplate.length > 0) {
    await supabase.from('program_items').insert(
      programTemplate.map((row) => ({
        trip_id:         trip.id,
        day_number:      row.day_number,
        day_label_es:    row.day_label_es,
        day_label_en:    row.day_label_en,
        day_subtitle_es: row.day_subtitle_es,
        day_subtitle_en: row.day_subtitle_en,
        title_es:        '',
        title_en:        '',
        description_es:  '',
        description_en:  '',
        sort_order:      row.sort_order,
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
