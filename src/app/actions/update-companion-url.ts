'use server'

import { createAdminClient } from '@/lib/supabase/admin'

type CompanionUrlField = 'profile_photo_url'

export async function updateCompanionUrl(companionId: string, field: CompanionUrlField, value: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('companions')
    .update({ [field]: value })
    .eq('id', companionId)
  if (error) console.error(`[updateCompanionUrl] ${field}:`, error.message)
}
