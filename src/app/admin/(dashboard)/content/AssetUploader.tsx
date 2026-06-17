'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { compressImage, formatBytes } from '@/lib/compress-image'
import { compressVideo } from '@/lib/compress-video'

interface Props {
  assetKey: string
  assetId: string
  currentUrl: string
  type: 'video' | 'image' | 'media'
  label: string
  compact?: boolean
}

interface SizeInfo {
  original: number
  compressed: number
}

export function AssetUploader({ assetKey, assetId, currentUrl, type, label, compact }: Props) {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState(currentUrl)
  const [error, setError] = useState<string | null>(null)
  const [sizeInfo, setSizeInfo] = useState<SizeInfo | null>(null)
  const [videoProgress, setVideoProgress] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = type === 'video'
    ? 'video/mp4,video/webm,video/ogg'
    : type === 'media'
      ? 'video/mp4,video/webm,video/ogg,image/jpeg,image/png,image/webp'
      : 'image/jpeg,image/png,image/webp'

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    setSizeInfo(null)
    setVideoProgress(null)

    try {
      const supabase = createClient()

      let fileToUpload = file
      let ext = file.name.split('.').pop() ?? (type === 'video' ? 'mp4' : 'jpg')

      const fileIsVideo = file.type.startsWith('video/')
      const fileIsImage = file.type.startsWith('image/')

      if (fileIsImage) {
        fileToUpload = await compressImage(file)
        ext = 'webp'
        setSizeInfo({ original: file.size, compressed: fileToUpload.size })
      } else if (fileIsVideo) {
        setVideoProgress(0)
        fileToUpload = await compressVideo(file, (ratio) => setVideoProgress(ratio))
        ext = 'webm'
        setSizeInfo({ original: file.size, compressed: fileToUpload.size })
        setVideoProgress(null)
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

  async function handleRemove() {
    if (!confirm('¿Eliminar este archivo?')) return
    const supabase = createClient()
    await supabase.from('site_assets').update({ url: '' }).eq('id', assetId)
    setUrl('')
    setSizeInfo(null)
  }

  const fileInput = (
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
  )

  if (compact) {
    return (
      <div className="space-y-1.5">
        <div className="relative group">
          {url ? (
            <img src={url} alt={label} className="w-full aspect-video object-cover rounded border border-black/10" />
          ) : (
            <div className="w-full aspect-video bg-black/[0.03] rounded border border-dashed border-black/15 flex items-center justify-center">
              <span className="text-[10px] text-black/20">Sin foto</span>
            </div>
          )}
          {url && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-600 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150"
              title="Eliminar"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 2l6 6M8 2l-6 6" />
              </svg>
            </button>
          )}
        </div>
        {fileInput}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full py-1.5 bg-black/8 text-black/60 text-xs rounded hover:bg-black/15 hover:text-black disabled:opacity-40 transition-colors"
        >
          {uploading ? 'Subiendo…' : url ? 'Cambiar' : 'Subir foto'}
        </button>
        <p className="text-[10px] text-black/30 truncate font-mono">{label}</p>
        {sizeInfo && !uploading && (
          <p className="text-[10px] text-emerald-600 font-mono">
            {formatBytes(sizeInfo.original)} → {formatBytes(sizeInfo.compressed)}
          </p>
        )}
        {error && <p className="text-[10px] text-red-400">{error}</p>}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      <div>
        <p className="text-xs text-black/40 mb-1">URL actual</p>
        <p className="text-xs font-mono text-black/50 break-all">
          {url || <span className="text-black/20 italic">Sin archivo</span>}
        </p>
      </div>

      {url && (type === 'image' || (type === 'media' && !url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i))) && (
        <div className="relative group inline-block">
          <img src={url} alt={label} className="max-h-32 rounded border border-black/10 object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-600 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150"
            title="Eliminar"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 2l6 6M8 2l-6 6" />
            </svg>
          </button>
        </div>
      )}

      {url && (type === 'video' || (type === 'media' && url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i))) && (
        <div className="relative group">
          <video src={url} className="max-h-32 rounded border border-black/10 w-full object-cover" muted playsInline />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-600 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150"
            title="Eliminar"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 2l6 6M8 2l-6 6" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        {fileInput}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-black/80 disabled:opacity-40 transition-colors"
        >
          {uploading
            ? (videoProgress !== null ? 'Comprimiendo…' : 'Subiendo…')
            : `Subir ${type === 'video' ? 'video' : type === 'media' ? 'foto o video' : 'imagen'}`
          }
        </button>

        {uploading && videoProgress === null && (
          <span className="text-xs text-black/30 animate-pulse">
            {type === 'image' ? 'Comprimiendo y subiendo…' : 'Subiendo…'}
          </span>
        )}

        {videoProgress !== null && (
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 h-1.5 bg-black/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-300 rounded-full"
                style={{ width: `${Math.round(videoProgress * 100)}%` }}
              />
            </div>
            <span className="text-xs text-black/40 tabular-nums shrink-0">
              {videoProgress < 0.02 ? 'Cargando FFmpeg…' : `${Math.round(videoProgress * 100)}%`}
            </span>
          </div>
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
