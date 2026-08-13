import { createClient } from '@/lib/supabase/client'

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const supabase = createClient()
  const { error } = await supabase.storage
    .from(bucket)
    // upsert: false a propósito. Con upsert el storage-api pide además permiso
    // de UPDATE sobre storage.objects, que las policies de los buckets de
    // invitados no dan (y no conviene darlo: habilitaría pisar archivos ajenos).
    // Las rutas llevan el uuid del guest, así que nunca colisionan.
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  return path
}
