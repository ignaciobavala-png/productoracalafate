'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export type ValidateResult = {
  valid: boolean
  code?: string
  tripId?: string
  error?: string
}

export async function validateInvitationCode(
  code: string,
  tripSlug: string,
  email?: string
): Promise<ValidateResult> {
  const clean = code.trim().toUpperCase()

  if (!clean) return { valid: false, error: 'Ingresá un código de invitación.' }

  const supabase = createAdminClient()

  const { data: trip } = await supabase
    .from('trips')
    .select('id')
    .eq('slug', tripSlug)
    .eq('is_active', true)
    .single()

  if (!trip) return { valid: false, error: 'Viaje no encontrado.' }

  const { data } = await supabase
    .from('invitations')
    .select('id, code, used_by, assigned_email')
    .eq('code', clean)
    .eq('trip_id', trip.id)
    .is('used_by', null)
    .single()

  if (!data) {
    return { valid: false, error: 'Código inválido o ya utilizado.' }
  }

  // Si el código tiene email asignado, verificar que coincida
  if (data.assigned_email && email) {
    const normalizedAssigned = data.assigned_email.trim().toLowerCase()
    const normalizedEntered = email.trim().toLowerCase()
    if (normalizedAssigned !== normalizedEntered) {
      return { valid: false, error: 'Este código no corresponde al email ingresado.' }
    }
  }

  return { valid: true, code: data.code, tripId: trip.id }
}
