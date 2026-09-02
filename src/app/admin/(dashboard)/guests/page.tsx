import { createClient } from '@/lib/supabase/server'
import { ExportButton } from './ExportButton'

const STATUS_LABEL: Record<string, string> = {
  pending:   'Pendiente',
  confirmed: 'Confirmado',
  rejected:  'Rechazado',
}

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  rejected:  'bg-red-100 text-red-800',
}

type PhotoPair = { id_photo_url: string | null; profile_photo_url: string | null }

// El formulario exige foto de documento y foto de perfil de CADA pasajero para
// poder enviar: si la fila llegó sin alguna, el envío murió a mitad de camino.
// Antes esas filas eran indistinguibles de una completa esperando revisión.
function isIncomplete(guest: PhotoPair & { companions?: PhotoPair[] | null }) {
  const everyone = [guest, ...(guest.companions ?? [])]
  return everyone.some(p => !p.id_photo_url || !p.profile_photo_url)
}

export default async function GuestsPage() {
  const supabase = await createClient()

  const { data: guests } = await supabase
    .from('guests')
    .select('id, full_name, email, nationality, document_number, status, submitted_at, payment_method_id, is_coming_alone, payment_proof_url, id_photo_url, profile_photo_url, companions (id, id_photo_url, profile_photo_url)')
    .order('submitted_at', { ascending: false })

  const counts = {
    total:     guests?.length ?? 0,
    pending:   guests?.filter(g => g.status === 'pending').length ?? 0,
    confirmed: guests?.filter(g => g.status === 'confirmed').length ?? 0,
    rejected:  guests?.filter(g => g.status === 'rejected').length ?? 0,
    incomplete: guests?.filter(isIncomplete).length ?? 0,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Registros</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm text-black/40">
            <span>{counts.total} total</span>
            <span className="text-yellow-700">{counts.pending} pendientes</span>
            <span className="text-green-700">{counts.confirmed} confirmados</span>
            <span className="text-red-700">{counts.rejected} rechazados</span>
            {counts.incomplete > 0 && (
              <span className="text-orange-700">{counts.incomplete} incompletos</span>
            )}
          </div>
          <ExportButton />
        </div>
      </div>

      {!guests || guests.length === 0 ? (
        <div className="border border-black/10 rounded-lg p-12 text-center text-black/30">
          No hay registros todavía.
        </div>
      ) : (
        <div className="border border-black/10 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-black/[0.02]">
                <th className="text-left px-4 py-3 text-black/40 font-normal">Nombre</th>
                <th className="text-left px-4 py-3 text-black/40 font-normal">Email</th>
                <th className="text-left px-4 py-3 text-black/40 font-normal">Nacionalidad</th>
                <th className="text-left px-4 py-3 text-black/40 font-normal">N° doc.</th>
                <th className="text-left px-4 py-3 text-black/40 font-normal">Foto doc.</th>
                <th className="text-left px-4 py-3 text-black/40 font-normal">Pago</th>
                <th className="text-left px-4 py-3 text-black/40 font-normal">Acompañantes</th>
                <th className="text-left px-4 py-3 text-black/40 font-normal">Fecha</th>
                <th className="text-left px-4 py-3 text-black/40 font-normal">Comprobante</th>
                <th className="text-left px-4 py-3 text-black/40 font-normal">Estado</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest, i) => (
                <tr
                  key={guest.id}
                  className={`border-b border-black/5 hover:bg-black/[0.03] transition-colors ${i === guests.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-4 py-3">
                    <a href={`/admin/guests/${guest.id}`} className="hover:text-black/70 transition-colors">
                      {guest.full_name}
                    </a>
                    {isIncomplete(guest) && (
                      <span
                        className="ml-2 inline-block px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 text-[10px] uppercase tracking-wide align-middle"
                        title="Le faltan fotos: el envío quedó a medias"
                      >
                        Incompleto
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-black/50">{guest.email}</td>
                  <td className="px-4 py-3 text-black/50">{guest.nationality ?? '—'}</td>
                  <td className="px-4 py-3 text-black/50 font-mono text-xs">{guest.document_number ?? '—'}</td>
                  <td className="px-4 py-3">
                    {guest.id_photo_url ? (
                      <a
                        href={`/admin/guests/${guest.id}`}
                        className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-900 transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Ver
                      </a>
                    ) : (
                      <span className="text-xs text-black/20">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-black/50 font-mono text-xs">{guest.payment_method_id ?? '—'}</td>
                  <td className="px-4 py-3 text-black/50">
                    {guest.companions?.length ? guest.companions.length : '—'}
                  </td>
                  <td className="px-4 py-3 text-black/40 text-xs">
                    {new Date(guest.submitted_at).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-4 py-3">
                    {guest.payment_proof_url ? (
                      <a
                        href={`/admin/guests/${guest.id}`}
                        className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-900 transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Ver
                      </a>
                    ) : (
                      <span className="text-xs text-black/20">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${STATUS_COLOR[guest.status]}`}>
                      {STATUS_LABEL[guest.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
