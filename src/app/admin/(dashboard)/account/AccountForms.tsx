'use client'

import { useActionState } from 'react'
import { updateEmail, updatePassword, type ActionResult } from './actions'

const initial: ActionResult = { success: false }

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, action, pending] = useActionState(updateEmail, initial)

  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="block text-xs text-black/40 mb-1">Email actual</label>
        <p className="text-sm text-black/50 font-mono px-3 py-2 bg-black/[0.03] border border-black/8 rounded">
          {currentEmail}
        </p>
      </div>
      <div>
        <label className="block text-xs text-black/40 mb-1">Nuevo email</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black/25"
          placeholder="nuevo@email.com"
        />
      </div>

      {state.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs text-green-700">
          Revisá tu bandeja — te llegará un link de confirmación al nuevo email.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-3 py-1.5 bg-black/10 text-black text-xs rounded hover:bg-black/15 transition-colors disabled:opacity-50"
      >
        {pending ? 'Guardando…' : 'Cambiar email'}
      </button>
    </form>
  )
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initial)

  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="block text-xs text-black/40 mb-1">Nueva contraseña</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black/25"
          placeholder="Mínimo 8 caracteres"
        />
      </div>
      <div>
        <label className="block text-xs text-black/40 mb-1">Confirmar contraseña</label>
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black/25"
          placeholder="Repetí la contraseña"
        />
      </div>

      {state.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs text-green-700">Contraseña actualizada correctamente.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-3 py-1.5 bg-black/10 text-black text-xs rounded hover:bg-black/15 transition-colors disabled:opacity-50"
      >
        {pending ? 'Guardando…' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}
