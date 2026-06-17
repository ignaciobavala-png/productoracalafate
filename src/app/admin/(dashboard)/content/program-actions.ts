'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

function revalidate(tripSlug: string) {
  revalidatePath(`/${tripSlug}`)
  revalidatePath('/admin/content')
}

export async function updateProgramDay(tripId: string, dayNumber: number, tripSlug: string, formData: FormData) {
  const supabase = createAdminClient()
  await supabase
    .from('program_items')
    .update({
      day_label_es:    (formData.get('day_label_es') as string).trim(),
      day_label_en:    (formData.get('day_label_en') as string).trim(),
      day_subtitle_es: (formData.get('day_subtitle_es') as string).trim(),
      day_subtitle_en: (formData.get('day_subtitle_en') as string).trim(),
    })
    .eq('trip_id', tripId)
    .eq('day_number', dayNumber)
  revalidate(tripSlug)
}

export async function updateProgramItem(id: string, tripSlug: string, formData: FormData) {
  const supabase = createAdminClient()
  await supabase
    .from('program_items')
    .update({
      title_es:       (formData.get('title_es') as string).trim(),
      title_en:       (formData.get('title_en') as string).trim(),
      description_es: (formData.get('description_es') as string).trim(),
      description_en: (formData.get('description_en') as string).trim(),
    })
    .eq('id', id)
  revalidate(tripSlug)
}

export async function addProgramItem(tripId: string, dayNumber: number, tripSlug: string) {
  const supabase = createAdminClient()

  // Heredar label/subtitle del día existente
  const { data: existing } = await supabase
    .from('program_items')
    .select('day_label_es, day_label_en, day_subtitle_es, day_subtitle_en, sort_order')
    .eq('trip_id', tripId)
    .eq('day_number', dayNumber)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const maxOrder = existing?.sort_order ?? -1

  await supabase.from('program_items').insert({
    trip_id:         tripId,
    day_number:      dayNumber,
    day_label_es:    existing?.day_label_es ?? '',
    day_label_en:    existing?.day_label_en ?? '',
    day_subtitle_es: existing?.day_subtitle_es ?? '',
    day_subtitle_en: existing?.day_subtitle_en ?? '',
    title_es:        '',
    title_en:        '',
    description_es:  '',
    description_en:  '',
    sort_order:      maxOrder + 1,
  })
  revalidate(tripSlug)
}

export async function deleteProgramItem(id: string, tripSlug: string) {
  const supabase = createAdminClient()
  await supabase.from('program_items').delete().eq('id', id)
  revalidate(tripSlug)
}

export async function addProgramDay(tripId: string, tripSlug: string) {
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('program_items')
    .select('day_number')
    .eq('trip_id', tripId)
    .order('day_number', { ascending: false })
    .limit(1)
    .single()

  const nextDay = (existing?.day_number ?? 0) + 1

  await supabase.from('program_items').insert({
    trip_id:         tripId,
    day_number:      nextDay,
    day_label_es:    `Día ${nextDay}`,
    day_label_en:    `Day ${nextDay}`,
    day_subtitle_es: '',
    day_subtitle_en: '',
    title_es:        '',
    title_en:        '',
    description_es:  '',
    description_en:  '',
    sort_order:      0,
  })
  revalidate(tripSlug)
}

export async function updateDayPhoto(tripId: string, dayNumber: number, photoUrl: string, tripSlug: string) {
  const supabase = createAdminClient()
  await supabase
    .from('program_items')
    .update({ day_photo_url: photoUrl })
    .eq('trip_id', tripId)
    .eq('day_number', dayNumber)
  revalidate(tripSlug)
}

export async function deleteProgramDay(tripId: string, dayNumber: number, tripSlug: string) {
  const supabase = createAdminClient()
  await supabase
    .from('program_items')
    .delete()
    .eq('trip_id', tripId)
    .eq('day_number', dayNumber)
  revalidate(tripSlug)
}
