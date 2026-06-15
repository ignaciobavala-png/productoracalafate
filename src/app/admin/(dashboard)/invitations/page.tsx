import { createClient } from '@/lib/supabase/server'
import { createInvitation, deleteInvitation } from './actions'

export default async function InvitationsPage() {
  const supabase = await createClient()

  const [{ data: invitations }, { data: requests }] = await Promise.all([
    supabase.from('invitations').select('*').order('created_at', { ascending: false }),
    supabase.from('invitation_requests').select('*').order('created_at', { ascending: false }).limit(100),
  ])

  // Personas que validaron un código real pero nunca completaron el registro
  const validCodes = new Set((invitations ?? []).map(inv => inv.code))
  const usedCodes = new Set(
    (invitations ?? []).filter(inv => inv.used_by).map(inv => inv.code)
  )
  const abandoned = (requests ?? []).filter(
    r => r.code_entered && validCodes.has(r.code_entered) && !usedCodes.has(r.code_entered)
  )
  // Deduplicar por email — quedarse con la entrada más reciente
  const seenEmails = new Set<string>()
  const abandonedByEmail = abandoned.filter(r => {
    if (seenEmails.has(r.email)) return false
    seenEmails.add(r.email)
    return true
  })

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Invitaciones</h1>
      </div>

      {/* Crear nueva invitación */}
      <form action={createInvitation} className="border border-black/10 rounded-lg p-4 space-y-3 bg-white">
        <h2 className="text-sm font-medium text-black/60">Generar código</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-black/40 mb-1">Email asignado (opcional)</label>
            <input
              name="email"
              type="email"
              placeholder="invitado@email.com"
              className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm text-black placeholder:text-black/20 focus:outline-none focus:border-black/25"
            />
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
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-black/80 transition-colors"
        >
          Generar código
        </button>
      </form>

      {/* Lista de códigos */}
      <div>
        <h2 className="text-sm font-medium text-black/40 mb-3">
          Códigos ({invitations?.length ?? 0})
        </h2>
        <div className="border border-black/10 rounded-lg overflow-hidden bg-white">
          {!invitations?.length ? (
            <p className="p-6 text-center text-black/20 text-sm">No hay códigos generados</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-black/[0.02]">
                  <th className="text-left px-4 py-3 text-black/40 font-normal">Código</th>
                  <th className="text-left px-4 py-3 text-black/40 font-normal">Email</th>
                  <th className="text-left px-4 py-3 text-black/40 font-normal">Estado</th>
                  <th className="text-left px-4 py-3 text-black/40 font-normal">Notas</th>
                  <th className="text-left px-4 py-3 text-black/40 font-normal">Creado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv, i) => {
                  const deleteAction = deleteInvitation.bind(null, inv.id)
                  return (
                    <tr key={inv.id} className={`border-b border-black/5 ${i === invitations.length - 1 ? 'border-b-0' : ''}`}>
                      <td className="px-4 py-3 font-mono text-black">{inv.code}</td>
                      <td className="px-4 py-3 text-black/50">{inv.assigned_email ?? '—'}</td>
                      <td className="px-4 py-3">
                        {inv.used_by ? (
                          <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">Usado</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded bg-black/5 text-black/30">Disponible</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-black/30 text-xs">{inv.notes ?? '—'}</td>
                      <td className="px-4 py-3 text-black/30 text-xs">
                        {new Date(inv.created_at).toLocaleDateString('es-CL')}
                      </td>
                      <td className="px-4 py-3">
                        {!inv.used_by && (
                          <form action={deleteAction}>
                            <button type="submit" className="text-xs text-black/20 hover:text-red-600 transition-colors">
                              Eliminar
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Entraron con código válido pero no completaron */}
      {abandonedByEmail.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-medium text-black/40">
              Entraron pero no completaron ({abandonedByEmail.length})
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">
              Pendiente de seguimiento
            </span>
          </div>
          <div className="border border-black/10 rounded-lg overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-black/[0.02]">
                  <th className="text-left px-4 py-3 text-black/40 font-normal">Email</th>
                  <th className="text-left px-4 py-3 text-black/40 font-normal">Código</th>
                  <th className="text-left px-4 py-3 text-black/40 font-normal">Accedió</th>
                </tr>
              </thead>
              <tbody>
                {abandonedByEmail.map((r, i) => (
                  <tr key={r.id} className={`border-b border-black/5 ${i === abandonedByEmail.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-4 py-3 text-black/70">{r.email}</td>
                    <td className="px-4 py-3 font-mono text-black/40 text-xs">{r.code_entered}</td>
                    <td className="px-4 py-3 text-black/30 text-xs">
                      {new Date(r.created_at).toLocaleString('es-CL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Intentos con código inválido */}
      {requests && requests.some(r => !r.code_entered || !validCodes.has(r.code_entered ?? '')) && (
        <div>
          <h2 className="text-sm font-medium text-black/40 mb-3">
            Intentos con código inválido
          </h2>
          <div className="border border-black/10 rounded-lg overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-black/[0.02]">
                  <th className="text-left px-4 py-3 text-black/40 font-normal">Email</th>
                  <th className="text-left px-4 py-3 text-black/40 font-normal">Código ingresado</th>
                  <th className="text-left px-4 py-3 text-black/40 font-normal">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {requests.filter(r => !r.code_entered || !validCodes.has(r.code_entered ?? '')).map((r, i, arr) => (
                  <tr key={r.id} className={`border-b border-black/5 ${i === arr.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-4 py-3 text-black/70">{r.email}</td>
                    <td className="px-4 py-3 font-mono text-black/30">{r.code_entered ?? '—'}</td>
                    <td className="px-4 py-3 text-black/30 text-xs">
                      {new Date(r.created_at).toLocaleString('es-CL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
