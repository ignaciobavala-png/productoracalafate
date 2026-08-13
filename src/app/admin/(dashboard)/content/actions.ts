'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const BUCKET = 'site-assets'

function revalidate(tripSlug?: string | null) {
  revalidatePath('/admin/content')
  if (tripSlug) revalidatePath(`/${tripSlug}`)
}

// Extrae el path dentro del bucket a partir de la URL pública.
// https://<ref>.supabase.co/storage/v1/object/public/site-assets/<path>
function storagePathFromUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return decodeURIComponent(url.slice(idx + marker.length).split('?')[0])
}

export async function updateContent(id: string, formData: FormData) {
  const value_es = formData.get('value_es') as string
  const value_en = formData.get('value_en') as string
  const trip_slug = formData.get('trip_slug') as string | null

  const supabase = await createClient()
  const { error } = await supabase
    .from('site_content')
    .update({ value_es, value_en })
    .eq('id', id)

  // Fallar en silencio acá era el bug: el admin mostraba "guardado" y la DB no cambiaba.
  if (error) throw new Error(`No se pudo guardar el texto: ${error.message}`)

  revalidate(trip_slug)
}

/**
 * Agrega un ítem nuevo a una lista de la sección precio (`includes_N` /
 * `excludes_N`). El número se calcula a partir de las claves que ya existen
 * para ese viaje, no de un contador global: cada viaje tiene su propia lista.
 */
export async function addPricingItem(
  tripId: string,
  tripSlug: string,
  prefix: 'includes' | 'excludes',
  formData: FormData
) {
  const supabase = await createClient()

  const { data: existing, error: readError } = await supabase
    .from('site_content')
    .select('key')
    .eq('trip_id', tripId)
    .eq('section', 'pricing')
    .like('key', `${prefix}_%`)

  if (readError) throw new Error(`No se pudo leer la lista: ${readError.message}`)

  const maxN = (existing ?? []).reduce((max, row) => {
    const n = Number(row.key.split('_')[1])
    return Number.isFinite(n) && n > max ? n : max
  }, 0)

  const { error } = await supabase.from('site_content').insert({
    trip_id: tripId,
    section: 'pricing',
    key: `${prefix}_${maxN + 1}`,
    value_es: (formData.get('value_es') as string) ?? '',
    value_en: (formData.get('value_en') as string) ?? '',
  })

  if (error) throw new Error(`No se pudo agregar el ítem: ${error.message}`)

  revalidate(tripSlug)
}

/** Borra un ítem de la lista de incluidos / no incluidos. */
export async function deleteContent(id: string, tripSlug: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('site_content').delete().eq('id', id)
  if (error) throw new Error(`No se pudo borrar el ítem: ${error.message}`)

  revalidate(tripSlug)
}

/**
 * Guarda la URL nueva de un asset y borra el archivo anterior del storage.
 * Corre en el server con service_role: el update no depende de la sesión del
 * browser y revalida el sitio público (el update client-side no revalidaba nada).
 */
export async function setAssetUrl(
  assetId: string,
  url: string,
  tripSlug: string,
  previousUrl?: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase.from('site_assets').update({ url }).eq('id', assetId)
  if (error) return { error: `No se pudo guardar en la base: ${error.message}` }

  const oldPath = previousUrl ? storagePathFromUrl(previousUrl) : null
  const newPath = url ? storagePathFromUrl(url) : null
  if (oldPath && oldPath !== newPath) {
    await supabase.storage.from(BUCKET).remove([oldPath])
  }

  revalidate(tripSlug)
  return {}
}
