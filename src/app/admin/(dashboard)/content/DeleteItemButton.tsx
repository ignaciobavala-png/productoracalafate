'use client'

import { useTransition } from 'react'
import { deleteContent } from './actions'

/**
 * Borrar es irreversible y el ítem desaparece del sitio público al instante:
 * se pide confirmación antes de llamar a la action.
 */
export function DeleteItemButton({
  id,
  tripSlug,
  label,
}: {
  id: string
  tripSlug: string
  label: string
}) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`¿Borrar "${label}"? Desaparece del sitio al instante.`)) return
        startTransition(() => deleteContent(id, tripSlug))
      }}
      className="px-3 py-1.5 text-xs rounded text-black/35 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
    >
      {pending ? 'Borrando…' : 'Borrar ítem'}
    </button>
  )
}
