import { createClient } from '@/lib/supabase/server'
import { updateContent } from './actions'

const SECTION_LABELS: Record<string, string> = {
  hero:       'Hero',
  manifesto:  'Manifiesto',
  program:    'Programa',
  pricing:    'Precios',
  footer:     'Footer',
}

export default async function ContentPage() {
  const supabase = await createClient()
  const { data: rows } = await supabase
    .from('site_content')
    .select('*')
    .order('section')
    .order('key')

  const bySection: Record<string, typeof rows> = {}
  for (const row of rows ?? []) {
    bySection[row.section] ??= []
    bySection[row.section]!.push(row)
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold mb-6">Contenido del sitio</h1>

      <div className="space-y-8">
        {Object.entries(bySection).map(([section, sectionRows]) => (
          <div key={section}>
            <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
              {SECTION_LABELS[section] ?? section}
            </h2>
            <div className="border border-white/10 rounded-lg overflow-hidden divide-y divide-white/5">
              {sectionRows?.map(row => {
                const save = updateContent.bind(null, row.id)
                const isLong = row.value_es.length > 80

                return (
                  <form key={row.id} action={save} className="p-4">
                    <p className="text-xs text-white/30 font-mono mb-3">{row.key}</p>
                    <div className={`grid gap-3 ${isLong ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      <div>
                        <label className="block text-xs text-white/40 mb-1">Español</label>
                        {isLong ? (
                          <textarea
                            name="value_es"
                            defaultValue={row.value_es}
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25 resize-y"
                          />
                        ) : (
                          <input
                            name="value_es"
                            defaultValue={row.value_es}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"
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
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25 resize-y"
                          />
                        ) : (
                          <input
                            name="value_en"
                            defaultValue={row.value_en}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"
                          />
                        )}
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="mt-3 px-3 py-1 bg-white/5 text-white/60 text-xs rounded hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Guardar
                    </button>
                  </form>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
