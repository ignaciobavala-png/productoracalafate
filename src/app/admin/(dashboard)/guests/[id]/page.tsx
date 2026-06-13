import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateGuestStatus } from '../actions'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  rejected: 'Rechazado',
}
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  confirmed: 'bg-green-500/10 text-green-400',
  rejected: 'bg-red-500/10 text-red-400',
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
  let idPhotoUrl: string | null = null
  let profilePhotoUrl: string | null = null

  if (guest.id_photo_url) {
    const { data } = await supabase.storage
      .from('guest-id-photos')
      .createSignedUrl(guest.id_photo_url, 3600)
    idPhotoUrl = data?.signedUrl ?? null
  }
  if (guest.profile_photo_url) {
    const { data } = await supabase.storage
      .from('guest-profile-photos')
      .createSignedUrl(guest.profile_photo_url, 3600)
    profilePhotoUrl = data?.signedUrl ?? null
  }

  const confirmAction = updateGuestStatus.bind(null, id, 'confirmed')
  const pendingAction = updateGuestStatus.bind(null, id, 'pending')
  const rejectAction  = updateGuestStatus.bind(null, id, 'rejected')

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <a href="/admin/guests" className="text-white/30 hover:text-white/60 text-sm transition-colors">
            ← Registros
          </a>
          <span className="text-white/10">/</span>
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
              className="px-3 py-1.5 text-xs bg-green-500/10 text-green-400 rounded hover:bg-green-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Confirmar
            </button>
          </form>
          <form action={pendingAction}>
            <button
              type="submit"
              disabled={guest.status === 'pending'}
              className="px-3 py-1.5 text-xs bg-yellow-500/10 text-yellow-400 rounded hover:bg-yellow-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Pendiente
            </button>
          </form>
          <form action={rejectAction}>
            <button
              type="submit"
              disabled={guest.status === 'rejected'}
              className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
            <div className="py-3 border-b border-white/5">
              <p className="text-xs text-white/40 mb-1">Bio</p>
              <p className="text-sm text-white/70 whitespace-pre-wrap">{guest.bio}</p>
            </div>
          )}
        </Section>

        {/* Fotos */}
        {(idPhotoUrl || profilePhotoUrl) && (
          <Section title="Fotos">
            <div className="grid grid-cols-2 gap-4 py-3">
              {idPhotoUrl && (
                <div>
                  <p className="text-xs text-white/40 mb-2">Documento de identidad</p>
                  <a href={idPhotoUrl} target="_blank" rel="noopener noreferrer">
                    <img src={idPhotoUrl} alt="ID" className="w-full rounded border border-white/10 hover:opacity-80 transition-opacity" />
                  </a>
                </div>
              )}
              {profilePhotoUrl && (
                <div>
                  <p className="text-xs text-white/40 mb-2">Foto de perfil</p>
                  <a href={profilePhotoUrl} target="_blank" rel="noopener noreferrer">
                    <img src={profilePhotoUrl} alt="Perfil" className="w-full rounded border border-white/10 hover:opacity-80 transition-opacity" />
                  </a>
                </div>
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
            <Row label="WhatsApp"     value={c.wants_whatsapp ? 'Sí' : 'No'} />
          </Section>
        ))}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/10">
        <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="divide-y divide-white/5">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start px-4 py-2.5">
      <span className="text-xs text-white/30 w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-white/70">{value ?? '—'}</span>
    </div>
  )
}
