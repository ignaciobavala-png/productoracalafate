import { createClient } from '@/lib/supabase/server'

const STATUS_LABEL: Record<string, string> = {
  pending:   'Pendiente',
  confirmed: 'Confirmado',
  rejected:  'Rechazado',
}

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-yellow-500/10 text-yellow-400',
  confirmed: 'bg-green-500/10 text-green-400',
  rejected:  'bg-red-500/10 text-red-400',
}

export default async function GuestsPage() {
  const supabase = await createClient()

  const { data: guests } = await supabase
    .from('guests')
    .select('id, full_name, email, nationality, status, submitted_at, payment_method_id, is_coming_alone')
    .order('submitted_at', { ascending: false })

  const counts = {
    total:     guests?.length ?? 0,
    pending:   guests?.filter(g => g.status === 'pending').length ?? 0,
    confirmed: guests?.filter(g => g.status === 'confirmed').length ?? 0,
    rejected:  guests?.filter(g => g.status === 'rejected').length ?? 0,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Registros</h1>
        <div className="flex items-center gap-3 text-sm text-white/40">
          <span>{counts.total} total</span>
          <span className="text-yellow-400">{counts.pending} pendientes</span>
          <span className="text-green-400">{counts.confirmed} confirmados</span>
          <span className="text-red-400">{counts.rejected} rechazados</span>
        </div>
      </div>

      {!guests || guests.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-12 text-center text-white/30">
          No hay registros todavía.
        </div>
      ) : (
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="text-left px-4 py-3 text-white/40 font-normal">Nombre</th>
                <th className="text-left px-4 py-3 text-white/40 font-normal">Email</th>
                <th className="text-left px-4 py-3 text-white/40 font-normal">Nacionalidad</th>
                <th className="text-left px-4 py-3 text-white/40 font-normal">Pago</th>
                <th className="text-left px-4 py-3 text-white/40 font-normal">Acompañante</th>
                <th className="text-left px-4 py-3 text-white/40 font-normal">Fecha</th>
                <th className="text-left px-4 py-3 text-white/40 font-normal">Estado</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest, i) => (
                <tr
                  key={guest.id}
                  className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${i === guests.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-4 py-3">
                    <a href={`/admin/guests/${guest.id}`} className="hover:text-white/70 transition-colors">
                      {guest.full_name}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-white/50">{guest.email}</td>
                  <td className="px-4 py-3 text-white/50">{guest.nationality ?? '—'}</td>
                  <td className="px-4 py-3 text-white/50 font-mono text-xs">{guest.payment_method_id ?? '—'}</td>
                  <td className="px-4 py-3 text-white/50">{guest.is_coming_alone ? 'No' : 'Sí'}</td>
                  <td className="px-4 py-3 text-white/40 text-xs">
                    {new Date(guest.submitted_at).toLocaleDateString('es-CL')}
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
