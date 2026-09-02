'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export type UploadedObject = { bucket: string; path: string }

/**
 * Revierte un envío fallido.
 *
 * `uploaded` son los archivos que ESTE intento alcanzó a subir. Antes no se
 * borraba ninguno: la fila desaparecía pero el objeto quedaba ocupando el
 * bucket para siempre. Se pasan explícitos en vez de barrer la carpeta del
 * guest porque en un reintento la carpeta también tiene los archivos buenos
 * de un intento anterior.
 *
 * `deleteGuest` es false cuando la fila ya existía antes de este intento
 * (retomar un registro a medias): borrarla destruiría datos que el invitado
 * ya había cargado.
 */
export async function rollbackGuestSubmission(
  guestId: string,
  invitationCode: string | null,
  deleteGuest = true,
  uploaded: UploadedObject[] = []
) {
  const supabase = createAdminClient()

  const byBucket = new Map<string, string[]>()
  for (const { bucket, path } of uploaded) {
    byBucket.set(bucket, [...(byBucket.get(bucket) ?? []), path])
  }
  await Promise.all(
    [...byBucket].map(([bucket, paths]) =>
      supabase.storage.from(bucket).remove(paths)
    )
  )

  if (!deleteGuest) return

  // Primero liberar la invitación: invitations.used_by tiene FK a guests, así
  // que borrar el guest antes falla con 409 y deja el registro a medias y el
  // código quemado (pasó en producción el 13/08/2026).
  if (invitationCode) {
    await supabase.from('invitations').update({ used_by: null, used_at: null }).eq('used_by', guestId)
  }
  await supabase.from('guests').delete().eq('id', guestId)
}
