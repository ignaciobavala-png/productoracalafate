'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  assetKey: string
  assetId: string
  currentUrl: string
  type: 'video' | 'image'
  label: string
}

export function AssetUploader({ assetKey, assetId, currentUrl, type, label }: Props) {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState(currentUrl)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = type === 'video'
    ? 'video/mp4,video/webm'
    : 'image/jpeg,image/png,image/webp'

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? (type === 'video' ? 'mp4' : 'jpg')
      const path = `${assetKey}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(path, file, { upsert: true, cacheControl: '3600' })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(path)

      // Actualizar URL en site_assets
      await supabase.from('site_assets').update({ url: publicUrl }).eq('id', assetId)

      setUrl(publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4 space-y-3">
      <div>
        <p className="text-xs text-white/40 mb-1">URL actual</p>
        <p className="text-xs font-mono text-white/50 break-all">
          {url || <span className="text-white/20 italic">Sin archivo</span>}
        </p>
      </div>

      {url && type === 'image' && (
        <img
          src={url}
          alt={label}
          className="max-h-32 rounded border border-white/10 object-cover"
        />
      )}

      {url && type === 'video' && (
        <video
          src={url}
          className="max-h-32 rounded border border-white/10 w-full object-cover"
          muted
          playsInline
        />
      )}

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-white/90 disabled:opacity-40 transition-colors"
        >
          {uploading ? 'Subiendo…' : `Subir ${type === 'video' ? 'video' : 'imagen'}`}
        </button>
        {uploading && (
          <span className="text-xs text-white/30 animate-pulse">Procesando…</span>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
