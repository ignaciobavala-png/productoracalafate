'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export type ValidateResult = {
  valid: boolean
  code?: string
  tripId?: string
  error?: string
}

export async function validateInvitationCode(code: string, tripSlug: string): Promise<ValidateResult> {
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
    .select('id, code, used_by')
    .eq('code', clean)
    .eq('trip_id', trip.id)
    .is('used_by', null)
    .single()

  if (!data) {
    return { valid: false, error: 'Código inválido o ya utilizado.' }
  }

  return { valid: true, code: data.code, tripId: trip.id }
}
