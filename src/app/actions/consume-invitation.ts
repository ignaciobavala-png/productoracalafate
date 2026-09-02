'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export type ActionResult = { ok: true } | { ok: false; error: string }

export async function consumeInvitationCode(
  code: string,
  guestId: string
): Promise<ActionResult> {
  const supabase = createAdminClient()

  // `used_by = guestId` en el filtro hace la operación idempotente: si el
  // invitado está retomando un registro a medias que ya había consumido el
  // código, este update lo vuelve a marcar en vez de no hacer nada.
  const { error } = await supabase
    .from('invitations')
    .update({ used_by: guestId, used_at: new Date().toISOString() })
    .eq('code', code)
    .or(`used_by.is.null,used_by.eq.${guestId}`)

  if (error) {
    // No se traga más: el que llama decide si revierte. Antes esto solo
    // logueaba y el submit seguía como si nada, dejando un guest creado con
    // el código sin consumir.
    console.error('[consumeInvitation] error:', error.message)
    return { ok: false, error: error.message }
  }

  // El update no falla cuando no matchea ninguna fila, así que hay que
  // verificar: si el código quedó tomado por otro guest, este envío no puede
  // darse por bueno.
  const { data: invitation } = await supabase
    .from('invitations')
    .select('used_by')
    .eq('code', code)
    .single()

  if (!invitation || invitation.used_by !== guestId) {
    return { ok: false, error: 'Este código de invitación ya fue utilizado.' }
  }

  return { ok: true }
}
