'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function consumeInvitationCode(code: string, guestId: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('invitations')
    .update({ used_by: guestId, used_at: new Date().toISOString() })
    .eq('code', code)
    .is('used_by', null)

  if (error) {
    console.error('[consumeInvitation] error:', error.message)
  }
}
