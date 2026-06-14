'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function logInvitationRequest(codeEntered: string, email: string) {
  const supabase = createAdminClient()
  await supabase.from('invitation_requests').insert({
    code_entered: codeEntered,
    email,
  })
}
