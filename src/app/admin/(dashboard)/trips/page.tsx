import { createClient } from '@/lib/supabase/server'
import { createTrip, toggleTripActive } from './actions'

export default async function TripsPage() {
  const supabase = await createClient()

  const { data: trips } = await supabase
    .from('trips')
    .select('id, slug, name, is_active, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Viajes</h1>
      </div>

      {/* Crear nuevo viaje */}
      <form
        action={createTrip}
        className="border border-black/10 rounded-lg p-4 space-y-3 bg-white"
      >
        <h2 className="text-sm font-medium text-black/60">Crear viaje</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-black/40 mb-1">
              Nombre del viaje
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="ej: Atacama Summit 2027"
              className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm text-black placeholder:text-black/20 focus:outline-none focus:border-black/25"
            />
          </div>
          <div>
            <label className="block text-xs text-black/40 mb-1">
              Slug (URL del viaje)
            </label>
            <input
              name="slug"
              type="text"
              required
              placeholder="ej: atacama-2027"
              pattern="[a-z0-9\-]+"
              className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm text-black placeholder:text-black/20 focus:outline-none focus:border-black/25 font-mono"
            />
          </div>
        </div>
        <p className="text-xs text-black/30">
          El slug define la URL pública: <span className="font-mono">sitio.com/[slug]</span>. Solo minúsculas, números y guiones.
        </p>
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-black/80 transition-colors"
        >
          Crear viaje
        </button>
      </form>

      {/* Lista de viajes */}
      <div>
        <h2 className="text-sm font-medium text-black/40 mb-3">
          Viajes ({trips?.length ?? 0})
        </h2>
        <div className="border border-black/10 rounded-lg overflow-hidden bg-white">
          {!trips?.length ? (
            <p className="p-6 text-center text-black/20 text-sm">
              No hay viajes creados
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-black/[0.02]">
                  <th className="text-left px-4 py-3 text-black/40 font-normal">Nombre</th>
                  <th className="text-left px-4 py-3 text-black/40 font-normal">Slug</th>
                  <th className="text-left px-4 py-3 text-black/40 font-normal">Estado</th>
                  <th className="text-left px-4 py-3 text-black/40 font-normal">Creado</th>
                  <th className="text-left px-4 py-3 text-black/40 font-normal">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip, i) => {
                  const toggleAction = toggleTripActive.bind(null, trip.id, !trip.is_active)
                  return (
                    <tr
                      key={trip.id}
                      className={`border-b border-black/5 ${i === trips.length - 1 ? 'border-b-0' : ''}`}
                    >
                      <td className="px-4 py-3 font-medium text-black">{trip.name}</td>
                      <td className="px-4 py-3 font-mono text-black/50 text-xs">{trip.slug}</td>
                      <td className="px-4 py-3">
                        {trip.is_active ? (
                          <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">
                            Activo
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded bg-black/5 text-black/30">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-black/30 text-xs">
                        {new Date(trip.created_at).toLocaleDateString('es-CL')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <a
                            href={`/admin/content?trip=${trip.id}`}
                            className="text-xs text-black/40 hover:text-black transition-colors"
                          >
                            Contenido →
                          </a>
                          <a
                            href={`/admin/invitations?trip=${trip.id}`}
                            className="text-xs text-black/40 hover:text-black transition-colors"
                          >
                            Invitaciones →
                          </a>
                          <form action={toggleAction}>
                            <button
                              type="submit"
                              className="text-xs text-black/20 hover:text-black/60 transition-colors"
                            >
                              {trip.is_active ? 'Desactivar' : 'Activar'}
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
