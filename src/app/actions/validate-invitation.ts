'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export type ValidateResult = {
  valid: boolean
  code?: string
  error?: string
}

export async function validateInvitationCode(code: string): Promise<ValidateResult> {
  const clean = code.trim().toUpperCase()

  if (!clean) return { valid: false, error: 'Ingresá un código de invitación.' }

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('invitations')
    .select('id, code, used_by')
    .eq('code', clean)
    .is('used_by', null)
    .single()

  if (!data) {
    return { valid: false, error: 'Código inválido o ya utilizado.' }
  }

  return { valid: true, code: data.code }
}
