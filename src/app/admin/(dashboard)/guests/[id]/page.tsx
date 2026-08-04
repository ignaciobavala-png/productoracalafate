import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateGuestStatus } from '../actions'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  rejected: 'Rechazado',
}
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function GuestDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: guest }, { data: companions }] = await Promise.all([
    supabase.from('guests').select('*').eq('id', id).single(),
    supabase.from('companions').select('*').eq('guest_id', id),
  ])

  if (!guest) notFound()

  // Signed URLs para fotos privadas (1 hora)
  const signed = async (bucket: string, path: string | null) => {
    if (!path) return null
    const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600)
    return data?.signedUrl ?? null
  }

  const [idPhotoUrl, profilePhotoUrl, paymentProofUrl] = await Promise.all([
    signed('guest-id-photos', guest.id_photo_url),
    signed('guest-profile-photos', guest.profile_photo_url),
    signed('guest-payment-proofs', guest.payment_proof_url),
  ])

  const confirmAction = updateGuestStatus.bind(null, id, 'confirmed')
  const pendingAction = updateGuestStatus.bind(null, id, 'pending')
  const rejectAction  = updateGuestStatus.bind(null, id, 'rejected')

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <a href="/admin/guests" className="text-black/30 hover:text-black/60 text-sm transition-colors">
            ← Registros
          </a>
          <span className="text-black/10">/</span>
          <h1 className="text-xl font-semibold">{guest.full_name}</h1>
          <span className={`inline-block px-2 py-0.5 rounded text-xs ${STATUS_COLOR[guest.status]}`}>
            {STATUS_LABEL[guest.status]}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <form action={confirmAction}>
            <button
              type="submit"
              disabled={guest.status === 'confirmed'}
              className="px-3 py-1.5 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Confirmar
            </button>
          </form>
          <form action={pendingAction}>
            <button
              type="submit"
              disabled={guest.status === 'pending'}
              className="px-3 py-1.5 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Pendiente
            </button>
          </form>
          <form action={rejectAction}>
            <button
              type="submit"
              disabled={guest.status === 'rejected'}
              className="px-3 py-1.5 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Rechazar
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        {/* Datos personales */}
        <Section title="Datos personales">
          <Row label="Email"         value={guest.email} />
          <Row label="Teléfono"      value={guest.phone} />
          <Row label="Nacionalidad"  value={guest.nationality} />
          <Row label="Fecha de nac." value={guest.date_of_birth} />
          <Row label="N° documento"  value={guest.document_number} />
          <Row label="WhatsApp"      value={guest.wants_whatsapp ? 'Sí' : 'No'} />
          <Row label="Viene solo"    value={guest.is_coming_alone ? 'Sí' : 'No'} />
          <Row label="Código inv."   value={guest.invitation_code} />
          <Row label="Registro"      value={new Date(guest.submitted_at).toLocaleString('es-CL')} />
        </Section>

        {/* Método de pago */}
        <Section title="Pago">
          <Row label="Método"     value={guest.payment_method_id} />
          <Row label="Factura"    value={guest.needs_invoice ? 'Sí' : 'No'} />
        </Section>

        {/* Dietética y bio */}
        <Section title="Preferencias y presentación">
          <Row
            label="Restricciones"
            value={guest.dietary_restrictions?.length > 0 ? guest.dietary_restrictions.join(', ') : 'Ninguna'}
          />
          {guest.dietary_details && <Row label="Detalles" value={guest.dietary_details} />}
          {guest.bio && (
            <div className="py-3 border-b border-black/5">
              <p className="text-xs text-black/40 mb-1">Bio</p>
              <p className="text-sm text-black/70 whitespace-pre-wrap">{guest.bio}</p>
            </div>
          )}
        </Section>

        {/* Fotos e identidad — siempre visible, así se ve qué falta */}
        <Section title="Fotos">
          <div className="grid grid-cols-2 gap-4 p-4">
            <PhotoSlot
              label="Documento de identidad"
              url={idPhotoUrl}
              stored={guest.id_photo_url}
            />
            <PhotoSlot
              label="Foto de perfil"
              url={profilePhotoUrl}
              stored={guest.profile_photo_url}
            />
          </div>
        </Section>

        {/* Comprobante de pago */}
        {paymentProofUrl && (
          <Section title="Comprobante de pago">
            <div className="p-4">
              {paymentProofUrl.includes('.pdf') ? (
                <a
                  href={paymentProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 text-black/70 text-sm rounded border border-black/10 hover:bg-black/10 transition-colors"
                >
                  Ver PDF
                </a>
              ) : (
                <a href={paymentProofUrl} target="_blank" rel="noopener noreferrer">
                  <img src={paymentProofUrl} alt="Comprobante" className="max-w-sm rounded border border-black/10 hover:opacity-80 transition-opacity" />
                </a>
              )}
            </div>
          </Section>
        )}

        {/* Acompañante */}
        {companions && companions.length > 0 && companions.map(c => (
          <Section key={c.id} title="Acompañante">
            <Row label="Nombre"       value={c.full_name} />
            <Row label="Email"        value={c.email} />
            <Row label="Teléfono"     value={c.phone} />
            <Row label="Nacionalidad" value={c.nationality} />
            <Row label="Fecha nac."   value={c.date_of_birth} />
            <Row label="N° documento" value={c.document_number} />
            <Row label="WhatsApp"     value={c.wants_whatsapp ? 'Sí' : 'No'} />
          </Section>
        ))}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-black/10 rounded-lg overflow-hidden bg-white">
      <div className="px-4 py-2.5 bg-black/[0.02] border-b border-black/10">
        <h2 className="text-xs font-medium text-black/40 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="divide-y divide-black/5">{children}</div>
    </div>
  )
}

function PhotoSlot({
  label,
  url,
  stored,
}: {
  label: string
  url: string | null
  stored: string | null
}) {
  return (
    <div>
      <p className="text-xs text-black/40 mb-2">{label}</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={label} className="w-full rounded border border-black/10 hover:opacity-80 transition-opacity" />
        </a>
      ) : (
        <div className="flex items-center justify-center h-32 rounded border border-dashed border-black/15 bg-black/[0.02] px-3 text-center">
          <p className="text-xs text-black/30 leading-relaxed">
            {stored
              ? 'El archivo está registrado pero no se pudo abrir. Revisar el bucket en Supabase.'
              : 'Sin subir todavía'}
          </p>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start px-4 py-2.5">
      <span className="text-xs text-black/30 w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-black/70">{value ?? '—'}</span>
    </div>
  )
}
