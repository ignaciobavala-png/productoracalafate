'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export type InvitationResult = {
  url?: string
  code?: string
  error?: string
} | null

export async function createInvitation(
  _prevState: InvitationResult,
  formData: FormData
): Promise<InvitationResult> {
  const email = (formData.get('email') as string) || null
  const notes = (formData.get('notes') as string) || null
  const tripId = formData.get('trip_id') as string

  if (!tripId) return { error: 'Seleccioná un viaje.' }

  const supabase = await createClient()

  const { data: trip } = await supabase
    .from('trips')
    .select('slug')
    .eq('id', tripId)
    .single()

  if (!trip) return { error: 'Viaje no encontrado.' }

  const code = generateCode()

  const { error } = await supabase.from('invitations').insert({
    code,
    assigned_email: email,
    notes,
    trip_id: tripId,
  })

  if (error) return { error: 'Error al crear la invitación.' }

  revalidatePath('/admin/invitations')

  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const url = `${protocol}://${host}/${trip.slug}?code=${code}`

  return { url, code }
}

export async function deleteInvitation(id: string, _formData: FormData) {
  const supabase = await createClient()
  await supabase.from('invitations').delete().eq('id', id)
  revalidatePath('/admin/invitations')
}
