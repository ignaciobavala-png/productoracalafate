'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { compressImage, formatBytes } from '@/lib/compress-image'

interface Props {
  assetKey: string
  assetId: string
  currentUrl: string
  type: 'video' | 'image'
  label: string
}

interface SizeInfo {
  original: number
  compressed: number
}

export function AssetUploader({ assetKey, assetId, currentUrl, type, label }: Props) {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState(currentUrl)
  const [error, setError] = useState<string | null>(null)
  const [sizeInfo, setSizeInfo] = useState<SizeInfo | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = type === 'video'
    ? 'video/mp4,video/webm'
    : 'image/jpeg,image/png,image/webp'

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    setSizeInfo(null)

    try {
      const supabase = createClient()

      let fileToUpload = file
      let ext = file.name.split('.').pop() ?? (type === 'video' ? 'mp4' : 'jpg')

      if (type === 'image') {
        fileToUpload = await compressImage(file)
        ext = 'webp'
        setSizeInfo({ original: file.size, compressed: fileToUpload.size })
      }

      const path = `${assetKey}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(path, fileToUpload, { upsert: true, cacheControl: '3600', contentType: fileToUpload.type })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(path)

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
        <p className="text-xs text-black/40 mb-1">URL actual</p>
        <p className="text-xs font-mono text-black/50 break-all">
          {url || <span className="text-black/20 italic">Sin archivo</span>}
        </p>
      </div>

      {url && type === 'image' && (
        <img
          src={url}
          alt={label}
          className="max-h-32 rounded border border-black/10 object-cover"
        />
      )}

      {url && type === 'video' && (
        <video
          src={url}
          className="max-h-32 rounded border border-black/10 w-full object-cover"
          muted
          playsInline
        />
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-black/80 disabled:opacity-40 transition-colors"
        >
          {uploading ? 'Subiendo…' : `Subir ${type === 'video' ? 'video' : 'imagen'}`}
        </button>

        {uploading && (
          <span className="text-xs text-black/30 animate-pulse">
            {type === 'image' ? 'Comprimiendo y subiendo…' : 'Procesando…'}
          </span>
        )}

        {sizeInfo && !uploading && (
          <span className="text-xs text-emerald-600 font-mono">
            {formatBytes(sizeInfo.original)} → {formatBytes(sizeInfo.compressed)}
            {' '}
            <span className="text-black/30">
              ({Math.round((1 - sizeInfo.compressed / sizeInfo.original) * 100)}% menos)
            </span>
          </span>
        )}
      </div>

      {type === 'image' && (
        <p className="text-[11px] text-black/25">
          Las imágenes se convierten automáticamente a WebP y se redimensionan a máx. 1920px.
        </p>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
