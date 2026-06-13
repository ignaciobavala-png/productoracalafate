import { createClient } from '@/lib/supabase/server'
import { togglePaymentMethod, updatePaymentDetails } from './actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: methods } = await supabase
    .from('payment_methods')
    .select('*')
    .order('sort_order')

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">Métodos de pago</h1>

      <div className="space-y-4">
        {methods?.map(m => {
          const toggleOn  = togglePaymentMethod.bind(null, m.id, true)
          const toggleOff = togglePaymentMethod.bind(null, m.id, false)
          const saveDetails = updatePaymentDetails.bind(null, m.id)

          return (
            <div key={m.id} className="border border-white/10 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{m.label}</span>
                  <span className="text-xs text-white/30 font-mono">{m.currency}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${m.is_active ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/20'}`}>
                    {m.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <form action={m.is_active ? toggleOff : toggleOn}>
                  <button type="submit" className="text-xs text-white/40 hover:text-white transition-colors">
                    {m.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </form>
              </div>

              <form action={saveDetails} className="p-4 space-y-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Etiqueta</label>
                  <input
                    name="label"
                    defaultValue={m.label}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">
                    Detalles (una línea por ítem)
                  </label>
                  <textarea
                    name="details"
                    defaultValue={m.details?.join('\n') ?? ''}
                    rows={m.details?.length ?? 3}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-white/25 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-white/10 text-white text-xs rounded hover:bg-white/15 transition-colors"
                >
                  Guardar
                </button>
              </form>
            </div>
          )
        })}
      </div>
    </div>
  )
}
