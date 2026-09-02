'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/app/actions/consume-invitation'

type CompanionUrlField = 'id_photo_url' | 'profile_photo_url'

export async function updateCompanionUrl(
  companionId: string,
  field: CompanionUrlField,
  value: string
): Promise<ActionResult> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('companions')
    .update({ [field]: value })
    .eq('id', companionId)

  if (error) {
    console.error(`[updateCompanionUrl] ${field}:`, error.message)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
