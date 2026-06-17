'use client'

import { deleteTrip } from './actions'

export function DeleteTripButton({ tripId, tripName }: { tripId: string; tripName: string }) {
  return (
    <form action={deleteTrip.bind(null, tripId)}>
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm(`¿Eliminar "${tripName}"? Esta acción no se puede deshacer.`)) {
            e.preventDefault()
          }
        }}
        className="text-xs text-red-400 hover:text-red-600 transition-colors"
      >
        Eliminar
      </button>
    </form>
  )
}
