'use client'

import { useTransition, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { compressImage, formatBytes } from '@/lib/compress-image'
import {
  updateProgramDay,
  updateProgramItem,
  addProgramItem,
  deleteProgramItem,
  addProgramDay,
  deleteProgramDay,
  updateDayPhoto,
} from './program-actions'

export interface ProgramItemRow {
  day_photo_url: string;
  id: string
  day_number: number
  day_label_es: string
  day_label_en: string
  day_subtitle_es: string
  day_subtitle_en: string
  title_es: string
  title_en: string
  description_es: string
  description_en: string
  sort_order: number
}

interface Props {
  tripId: string
  tripSlug: string
  items: ProgramItemRow[]
}

export function ProgramAdmin({ tripId, tripSlug, items }: Props) {
  // Agrupar por día
  const days = new Map<number, ProgramItemRow[]>()
  for (const item of items) {
    if (!days.has(item.day_number)) days.set(item.day_number, [])
    days.get(item.day_number)!.push(item)
  }
  const sortedDays = Array.from(days.entries()).sort(([a], [b]) => a - b)

  return (
    <details className="group border border-black/10 rounded-lg overflow-hidden bg-white">
      <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer bg-black/[0.02] hover:bg-black/[0.04] transition-colors list-none">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-black/20 w-4">P</span>
          <div>
            <span className="text-sm font-medium">Programa</span>
            <span className="text-xs text-black/30 ml-2">— días y agenda dinámica</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-black/20">{sortedDays.length} días · {items.length} items</span>
          <span className="text-black/30 text-xs group-open:rotate-180 transition-transform duration-200">▼</span>
        </div>
      </summary>

      <div className="border-t border-black/10 p-4 space-y-6">
        {sortedDays.map(([dayNum, dayItems]) => (
          <DayGroup
            key={dayNum}
            tripId={tripId}
            tripSlug={tripSlug}
            dayNumber={dayNum}
            items={dayItems}
            canDelete={sortedDays.length > 1}
          />
        ))}

        {/* Agregar día */}
        <AddDayButton tripId={tripId} tripSlug={tripSlug} />
      </div>
    </details>
  )
}

function DayGroup({
  tripId,
  tripSlug,
  dayNumber,
  items,
  canDelete,
}: {
  tripId: string
  tripSlug: string
  dayNumber: number
  items: ProgramItemRow[]
  canDelete: boolean
}) {
  const [pending, start] = useTransition()
  const first = items[0]

  return (
    <div className="border border-black/8 rounded-lg overflow-hidden">
      {/* Header del día */}
      <div className="bg-black/[0.03] px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-mono font-medium text-black/50">DÍA {dayNumber}</span>
        {canDelete && (
          <button
            type="button"
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
            disabled={pending}
            onClick={() => start(() => deleteProgramDay(tripId, dayNumber, tripSlug))}
          >
            Eliminar día
          </button>
        )}
      </div>

      {/* Foto del día */}
      <div className="p-4 border-b border-black/8">
        <p className="text-xs text-black/30 mb-3">Foto cinematográfica del día</p>
        <DayPhotoUploader
          tripId={tripId}
          dayNumber={dayNumber}
          tripSlug={tripSlug}
          currentUrl={first.day_photo_url}
        />
      </div>

      {/* Formulario del encabezado del día */}
      <form
        className="p-4 border-b border-black/8"
        action={updateProgramDay.bind(null, tripId, dayNumber, tripSlug)}
      >
        <p className="text-xs text-black/30 mb-3">Encabezado del día</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-black/40 mb-1">Label ES</label>
            <input name="day_label_es" defaultValue={first.day_label_es}
              className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-black/30" />
          </div>
          <div>
            <label className="block text-xs text-black/40 mb-1">Label EN</label>
            <input name="day_label_en" defaultValue={first.day_label_en}
              className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-black/30" />
          </div>
          <div>
            <label className="block text-xs text-black/40 mb-1">Subtítulo ES</label>
            <input name="day_subtitle_es" defaultValue={first.day_subtitle_es}
              className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-black/30" />
          </div>
          <div>
            <label className="block text-xs text-black/40 mb-1">Subtítulo EN</label>
            <input name="day_subtitle_en" defaultValue={first.day_subtitle_en}
              className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-black/30" />
          </div>
        </div>
        <button type="submit"
          className="px-3 py-1.5 bg-black/8 text-black/70 text-xs rounded hover:bg-black/15 hover:text-black transition-colors">
          Guardar encabezado
        </button>
      </form>

      {/* Items de agenda */}
      <div className="divide-y divide-black/5">
        {items.map((item, i) => (
          <ItemForm
            key={item.id}
            item={item}
            index={i}
            tripSlug={tripSlug}
            canDelete={items.length > 1}
          />
        ))}
      </div>

      {/* Agregar item */}
      <AddItemButton tripId={tripId} tripSlug={tripSlug} dayNumber={dayNumber} />
    </div>
  )
}

function ItemForm({
  item,
  index,
  tripSlug,
  canDelete,
}: {
  item: ProgramItemRow
  index: number
  tripSlug: string
  canDelete: boolean
}) {
  const [pending, start] = useTransition()

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono text-black/25 uppercase tracking-widest">Item {index + 1}</span>
        {canDelete && (
          <button
            type="button"
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
            disabled={pending}
            onClick={() => start(() => deleteProgramItem(item.id, tripSlug))}
          >
            Eliminar
          </button>
        )}
      </div>
      <form action={updateProgramItem.bind(null, item.id, tripSlug)}>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-black/40 mb-1">Título ES</label>
            <input name="title_es" defaultValue={item.title_es}
              className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-black/30" />
          </div>
          <div>
            <label className="block text-xs text-black/40 mb-1">Título EN</label>
            <input name="title_en" defaultValue={item.title_en}
              className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-black/30" />
          </div>
          <div>
            <label className="block text-xs text-black/40 mb-1">Descripción ES</label>
            <textarea name="description_es" defaultValue={item.description_es} rows={3}
              className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm resize-y focus:outline-none focus:border-black/30" />
          </div>
          <div>
            <label className="block text-xs text-black/40 mb-1">Descripción EN</label>
            <textarea name="description_en" defaultValue={item.description_en} rows={3}
              className="w-full bg-[#f7f7f7] border border-black/10 rounded px-3 py-2 text-sm resize-y focus:outline-none focus:border-black/30" />
          </div>
        </div>
        <button type="submit"
          className="px-3 py-1.5 bg-black/8 text-black/70 text-xs rounded hover:bg-black/15 hover:text-black transition-colors">
          Guardar
        </button>
      </form>
    </div>
  )
}

function AddItemButton({ tripId, tripSlug, dayNumber }: { tripId: string; tripSlug: string; dayNumber: number }) {
  const [pending, start] = useTransition()
  return (
    <div className="p-3 bg-black/[0.01]">
      <button
        type="button"
        disabled={pending}
        className="text-xs text-black/40 hover:text-black transition-colors disabled:opacity-40"
        onClick={() => start(() => addProgramItem(tripId, dayNumber, tripSlug))}
      >
        {pending ? 'Agregando…' : '+ Agregar item al día'}
      </button>
    </div>
  )
}

function DayPhotoUploader({
  tripId,
  dayNumber,
  tripSlug,
  currentUrl,
}: {
  tripId: string
  dayNumber: number
  tripSlug: string
  currentUrl: string
}) {
  const [url, setUrl] = useState(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [sizeInfo, setSizeInfo] = useState<{ original: number; compressed: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    setSizeInfo(null)
    try {
      const compressed = await compressImage(file)
      setSizeInfo({ original: file.size, compressed: compressed.size })

      const supabase = createClient()
      const path = `program/${tripId}/day-${dayNumber}.webp`
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(path, compressed, { upsert: true, cacheControl: '3600', contentType: 'image/webp' })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(path)
      await updateDayPhoto(tripId, dayNumber, publicUrl, tripSlug)
      setUrl(publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {url && (
        <img src={url} alt="" className="h-24 w-full object-cover rounded border border-black/10" />
      )}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded hover:bg-black/80 disabled:opacity-40 transition-colors"
        >
          {uploading ? 'Subiendo…' : url ? 'Cambiar foto' : 'Subir foto'}
        </button>
        {sizeInfo && !uploading && (
          <span className="text-xs text-emerald-600 font-mono">
            {formatBytes(sizeInfo.original)} → {formatBytes(sizeInfo.compressed)}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

function AddDayButton({ tripId, tripSlug }: { tripId: string; tripSlug: string }) {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      className="w-full py-2.5 border border-dashed border-black/15 rounded-lg text-xs text-black/40 hover:border-black/30 hover:text-black transition-colors disabled:opacity-40"
      onClick={() => start(() => addProgramDay(tripId, tripSlug))}
    >
      {pending ? 'Creando día…' : '+ Agregar día al programa'}
    </button>
  )
}
