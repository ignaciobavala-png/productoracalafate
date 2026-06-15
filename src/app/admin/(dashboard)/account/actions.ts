'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ActionResult = { success: boolean; error?: string }

export async function updateEmail(_: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = (formData.get('email') as string)?.trim()
  if (!email) return { success: false, error: 'Ingresá un email válido.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ email })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/account')
  return { success: true }
}

export async function updatePassword(_: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const password    = formData.get('password') as string
  const confirm     = formData.get('confirm') as string

  if (!password || password.length < 8)
    return { success: false, error: 'La contraseña debe tener al menos 8 caracteres.' }

  if (password !== confirm)
    return { success: false, error: 'Las contraseñas no coinciden.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { success: false, error: error.message }

  return { success: true }
}
