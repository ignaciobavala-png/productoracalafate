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
