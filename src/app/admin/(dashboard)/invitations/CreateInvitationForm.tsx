'use client'

import { useActionState, useRef } from 'react'
import { createInvitation, type InvitationResult } from './actions'

interface Trip {
  id: string
  name: string
  slug: string
}

interface Props {
  trips: Trip[]
}

export function CreateInvitationForm({ trips }: Props) {
  const [state, action, pending] = useActionState<InvitationResult, FormData>(
    createInvitation,
    null
  )
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <div className="border border-black/10 rounded-lg p-4 space-y-3 bg-white">
      <h2 className="text-sm font-medium text-black/60">Generar código de invitación</h2>

      <form ref={formRef} action={action} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-black/40 mb-1">Viaje *</label>
            <select
              name="trip_id"
              required
              className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black/25"
            >
              <option value="">Seleccioná un viaje</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-black/40 mb-1">Email asignado (opcional)</label>
            <input
              name="email"
              type="email"
              placeholder="invitado@email.com"
              className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm text-black placeholder:text-black/20 focus:outline-none focus:border-black/25"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-black/40 mb-1">Notas internas (opcional)</label>
          <input
            name="notes"
            type="text"
            placeholder="ej: referido por Andrea"
            className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm text-black placeholder:text-black/20 focus:outline-none focus:border-black/25"
          />
        </div>

        {state?.error && (
          <p className="text-xs text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-black/80 transition-colors disabled:opacity-50"
        >
          {pending ? 'Generando...' : 'Generar código'}
        </button>
      </form>

      {state?.url && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
          <p className="text-xs font-medium text-green-800">
            Código generado: <span className="font-mono text-base">{state.code}</span>
          </p>
          <p className="text-xs text-green-700 mb-1">URL para enviar al invitado:</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={state.url}
              className="flex-1 bg-white border border-green-300 rounded px-3 py-1.5 text-xs font-mono text-green-900 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(state.url!)}
              className="px-3 py-1.5 bg-green-700 text-white text-xs rounded hover:bg-green-800 transition-colors shrink-0"
            >
              Copiar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
