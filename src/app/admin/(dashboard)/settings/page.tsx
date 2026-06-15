import { createClient } from '@/lib/supabase/server'
import { togglePaymentMethod, updatePaymentDetails } from './actions'

const CURRENCY_LABEL: Record<string, string> = {
  CLP: 'Pesos CL',
  USD: 'Dólares',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: methods } = await supabase
    .from('payment_methods')
    .select('*')
    .order('sort_order')

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-1">Métodos de pago</h1>
      <p className="text-sm text-black/30 mb-6">
        Activá o desactivá métodos y editá los datos que verá el invitado. Haz clic para desplegar.
      </p>

      <div className="space-y-2">
        {methods?.map((m, idx) => {
          const toggleOn   = togglePaymentMethod.bind(null, m.id, true)
          const toggleOff  = togglePaymentMethod.bind(null, m.id, false)
          const saveDetails = updatePaymentDetails.bind(null, m.id)

          return (
            <details
              key={m.id}
              className="group border border-black/10 rounded-lg overflow-hidden bg-white"
            >
              <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer bg-black/[0.02] hover:bg-black/[0.04] transition-colors list-none">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-black/20 w-4">{idx + 1}</span>
                  <div>
                    <span className="text-sm font-medium">{m.label}</span>
                    <span className="text-xs text-black/30 ml-2">
                      — {CURRENCY_LABEL[m.currency] ?? m.currency}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    m.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-black/5 text-black/25'
                  }`}>
                    {m.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="text-black/30 text-xs group-open:rotate-180 transition-transform duration-200">▼</span>
                </div>
              </summary>

              <div className="border-t border-black/10 p-4 space-y-3">
                <form id={`save-${m.id}`} action={saveDetails} className="space-y-3">
                  <div>
                    <label className="block text-xs text-black/40 mb-1">Etiqueta</label>
                    <input
                      name="label"
                      defaultValue={m.label}
                      className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black/25"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-black/40 mb-1">
                      Datos de pago <span className="text-black/20">(una línea por ítem)</span>
                    </label>
                    <textarea
                      name="details"
                      defaultValue={m.details?.join('\n') ?? ''}
                      rows={Math.max(3, m.details?.length ?? 3)}
                      className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm text-black font-mono focus:outline-none focus:border-black/25 resize-none"
                    />
                  </div>
                </form>
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    form={`save-${m.id}`}
                    className="px-3 py-1.5 bg-black/8 text-black/70 text-xs rounded hover:bg-black/15 hover:text-black transition-colors"
                  >
                    Guardar cambios
                  </button>
                  <form action={m.is_active ? toggleOff : toggleOn}>
                    <button
                      type="submit"
                      className={`text-xs px-3 py-1.5 rounded transition-colors ${
                        m.is_active
                          ? 'text-red-600/70 hover:text-red-700 hover:bg-red-50'
                          : 'text-green-700/70 hover:text-green-800 hover:bg-green-50'
                      }`}
                    >
                      {m.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </form>
                </div>
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}
