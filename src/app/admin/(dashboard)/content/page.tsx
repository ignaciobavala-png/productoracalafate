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

export default async function ContentPage() {
  const supabase = await createClient()
  const [{ data: rows }, { data: assets }] = await Promise.all([
    supabase.from('site_content').select('*').order('section').order('key'),
    supabase.from('site_assets').select('*').order('key'),
  ])

  const bySection: Record<string, typeof rows> = {}
  for (const row of rows ?? []) {
    bySection[row.section] ??= []
    bySection[row.section]!.push(row)
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold mb-1">Contenido del sitio</h1>
      <p className="text-sm text-white/30 mb-6">
        Los cambios se aplican al sitio en tiempo real. Haz clic en una sección para desplegarla.
      </p>

      <div className="space-y-2">

        {/* ── Multimedia (assets) ─────────────────────────── */}
        {assets && assets.length > 0 && (
          <details className="group border border-white/10 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-colors list-none">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-white/20 w-4">0</span>
                <div>
                  <span className="text-sm font-medium">Multimedia</span>
                  <span className="text-xs text-white/30 ml-2">— video hero y foto manifiesto</span>
                </div>
              </div>
              <span className="text-white/30 text-xs group-open:rotate-180 transition-transform duration-200">▼</span>
            </summary>
            <div className="divide-y divide-white/5 border-t border-white/10">
              {assets.map(asset => (
                <div key={asset.id}>
                  <div className="px-4 pt-4">
                    <p className="text-xs font-mono text-white/30">{asset.key}</p>
                    {asset.label && <p className="text-sm text-white/60 mt-0.5">{asset.label}</p>}
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
              className="group border border-white/10 rounded-lg overflow-hidden"
              open={idx === 0}
            >
              <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-colors list-none">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-white/20 w-4">{idx + 1}</span>
                  <div>
                    <span className="text-sm font-medium capitalize">{section}</span>
                    <span className="text-xs text-white/30 ml-2">
                      — {SECTION_LABELS[section]?.split('— ')[1]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/20">{sectionRows.length} campos</span>
                  <span className="text-white/30 text-xs group-open:rotate-180 transition-transform duration-200">▼</span>
                </div>
              </summary>

              <div className="divide-y divide-white/5 border-t border-white/10">
                {sectionRows.map(row => {
                  const save = updateContent.bind(null, row.id)
                  const isLong = row.value_es.length > 80

                  return (
                    <form key={row.id} action={save} className="p-4">
                      <p className="text-xs font-mono text-white/30 mb-3">{row.key}</p>
                      <div className={`grid gap-3 ${isLong ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        <div>
                          <label className="block text-xs text-white/40 mb-1">Español</label>
                          {isLong ? (
                            <textarea
                              name="value_es"
                              defaultValue={row.value_es}
                              rows={4}
                              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 resize-y"
                            />
                          ) : (
                            <input
                              name="value_es"
                              defaultValue={row.value_es}
                              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-white/40 mb-1">English</label>
                          {isLong ? (
                            <textarea
                              name="value_en"
                              defaultValue={row.value_en}
                              rows={4}
                              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 resize-y"
                            />
                          ) : (
                            <input
                              name="value_en"
                              defaultValue={row.value_en}
                              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                            />
                          )}
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="mt-3 px-3 py-1.5 bg-white/8 text-white/70 text-xs rounded hover:bg-white/15 hover:text-white transition-colors"
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
      </div>
    </div>
  )
}
