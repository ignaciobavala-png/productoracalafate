import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

let ffmpegInstance: FFmpeg | null = null

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance

  const ffmpeg = new FFmpeg()

  const baseURL = '/ffmpeg'
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  })

  ffmpegInstance = ffmpeg
  return ffmpeg
}

export async function compressVideo(
  file: File,
  onProgress?: (ratio: number) => void
): Promise<File> {
  const ffmpeg = await getFFmpeg()

  const inputName = 'input' + file.name.substring(file.name.lastIndexOf('.'))
  const outputName = 'output.webm'

  ffmpeg.on('progress', ({ progress }) => {
    onProgress?.(Math.max(0, Math.min(1, progress)))
  })

  await ffmpeg.writeFile(inputName, await fetchFile(file))

  await ffmpeg.exec([
    '-i', inputName,
    '-c:v', 'libvpx-vp9',
    '-crf', '35',
    '-b:v', '0',
    '-vf', 'scale=1280:-2',
    '-an',
    '-deadline', 'realtime',
    '-cpu-used', '8',
    outputName,
  ])

  const data = await ffmpeg.readFile(outputName)
  const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data as string)
  const regularBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  const blob = new Blob([regularBuffer], { type: 'video/webm' })

  await ffmpeg.deleteFile(inputName)
  await ffmpeg.deleteFile(outputName)

  return new File([blob], file.name.replace(/\.[^.]+$/, '.webm'), { type: 'video/webm' })
}
