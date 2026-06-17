import { createClient } from '@/lib/supabase/server'
import { updateContent } from './actions'
import { AssetUploader } from './AssetUploader'

const SECTION_ORDER = ['hero', 'manifesto', 'program', 'pricing', 'footer']

const SECTION_LABELS: Record<string, string> = {
  hero:      'Hero — encabezado principal',
  manifesto: 'Manifiesto — sección editorial',
  program:   'Programa — agenda de 3 días',
  pricing:   'Precios — tarifa e incluidos',
  footer:    'Footer — pie de página',
}

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ trip?: string }>
}) {
  const { trip: tripId } = await searchParams
  const supabase = await createClient()

  const { data: trips } = await supabase
    .from('trips')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('created_at')

  const selectedTrip = trips?.find((t) => t.id === tripId) ?? trips?.[0] ?? null

  const [{ data: rows }, { data: assets }] = selectedTrip
    ? await Promise.all([
        supabase
          .from('site_content')
          .select('*')
          .eq('trip_id', selectedTrip.id)
          .order('section')
          .order('key'),
        supabase
          .from('site_assets')
          .select('*')
          .eq('trip_id', selectedTrip.id)
          .order('key'),
      ])
    : [{ data: null }, { data: null }]

  const bySection: Record<string, typeof rows> = {}
  for (const row of rows ?? []) {
    bySection[row.section] ??= []
    bySection[row.section]!.push(row)
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold mb-1">Contenido del sitio</h1>
      <p className="text-sm text-black/30 mb-4">
        Los cambios se aplican al sitio en tiempo real. Haz clic en una sección para desplegarla.
      </p>

      {/* Selector de viaje */}
      {trips && trips.length > 0 && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-xs text-black/40">Viaje:</span>
          {trips.map((trip) => (
            <a
              key={trip.id}
              href={`/admin/content?trip=${trip.id}`}
              className={`text-xs px-3 py-1.5 rounded transition-colors ${
                selectedTrip?.id === trip.id
                  ? 'bg-black text-white'
                  : 'bg-black/5 text-black/50 hover:bg-black/10'
              }`}
            >
              {trip.name}
            </a>
          ))}
        </div>
      )}

      {!selectedTrip ? (
        <p className="text-sm text-black/30 py-8 text-center">
          No hay viajes activos.{' '}
          <a href="/admin/trips" className="underline">
            Crear un viaje →
          </a>
        </p>
      ) : (
        <div className="space-y-2">

          {/* ── Multimedia (assets) ─────────────────────────── */}
          {assets && assets.length > 0 && (
            <details className="group border border-black/10 rounded-lg overflow-hidden bg-white">
              <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer bg-black/[0.02] hover:bg-black/[0.04] transition-colors list-none">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-black/20 w-4">0</span>
                  <div>
                    <span className="text-sm font-medium">Multimedia</span>
                    <span className="text-xs text-black/30 ml-2">— video hero y foto manifiesto</span>
                  </div>
                </div>
                <span className="text-black/30 text-xs group-open:rotate-180 transition-transform duration-200">▼</span>
              </summary>
              <div className="divide-y divide-black/5 border-t border-black/10">
                {assets.map((asset) => (
                  <div key={asset.id}>
                    <div className="px-4 pt-4">
                      <p className="text-xs font-mono text-black/30">{asset.key}</p>
                      {asset.label && <p className="text-sm text-black/60 mt-0.5">{asset.label}</p>}
                    </div>
                    <AssetUploader
                      assetKey={asset.key}
                      assetId={asset.id}
                      currentUrl={asset.url}
                      type={asset.type as 'video' | 'image'}
                      label={asset.label ?? asset.key}
                    />
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* ── Secciones de texto ──────────────────────────── */}
          {SECTION_ORDER.map((section, idx) => {
            const sectionRows = bySection[section]
            if (!sectionRows?.length) return null

            return (
              <details
                key={section}
                className="group border border-black/10 rounded-lg overflow-hidden bg-white"
                open={idx === 0}
              >
                <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer bg-black/[0.02] hover:bg-black/[0.04] transition-colors list-none">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-black/20 w-4">{idx + 1}</span>
                    <div>
                      <span className="text-sm font-medium capitalize">{section}</span>
                      <span className="text-xs text-black/30 ml-2">
                        — {SECTION_LABELS[section]?.split('— ')[1]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-black/20">{sectionRows.length} campos</span>
                    <span className="text-black/30 text-xs group-open:rotate-180 transition-transform duration-200">▼</span>
                  </div>
                </summary>

                <div className="divide-y divide-black/5 border-t border-black/10">
                  {sectionRows.map((row) => {
                    const save = updateContent.bind(null, row.id)
                    const isLong = row.value_es.length > 80

                    return (
                      <form key={row.id} action={save} className="p-4">
                        <input type="hidden" name="trip_slug" value={selectedTrip.slug} />
                        <p className="text-xs font-mono text-black/30 mb-3">{row.key}</p>
                        <div className={`grid gap-3 ${isLong ? 'grid-cols-1' : 'grid-cols-2'}`}>
                          <div>
                            <label className="block text-xs text-black/40 mb-1">Español</label>
                            {isLong ? (
                              <textarea
                                name="value_es"
                                defaultValue={row.value_es}
                                rows={4}
                                className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black/30 resize-y"
                              />
                            ) : (
                              <input
                                name="value_es"
                                defaultValue={row.value_es}
                                className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black/30"
                              />
                            )}
                          </div>
                          <div>
                            <label className="block text-xs text-black/40 mb-1">English</label>
                            {isLong ? (
                              <textarea
                                name="value_en"
                                defaultValue={row.value_en}
                                rows={4}
                                className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black/30 resize-y"
                              />
                            ) : (
                              <input
                                name="value_en"
                                defaultValue={row.value_en}
                                className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black/30"
                              />
                            )}
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="mt-3 px-3 py-1.5 bg-black/8 text-black/70 text-xs rounded hover:bg-black/15 hover:text-black transition-colors"
                        >
                          Guardar
                        </button>
                      </form>
                    )
                  })}
                </div>
              </details>
            )
          })}

          {!rows?.length && (
            <p className="text-sm text-black/30 py-8 text-center">
              Este viaje no tiene contenido aún. Edita los campos para empezar a llenarlos.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
