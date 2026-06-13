import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '../login/actions'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Re-validación de auth en el servidor (no confiar solo en el proxy)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-xs tracking-[0.2em] text-white/40 uppercase">
            Torres del Paine Summit
          </span>
          <nav className="flex items-center gap-1">
            <a
              href="/admin/guests"
              className="px-3 py-1.5 text-sm text-white/60 hover:text-white rounded-md hover:bg-white/5 transition-colors"
            >
              Registros
            </a>
            <a
              href="/admin/invitations"
              className="px-3 py-1.5 text-sm text-white/60 hover:text-white rounded-md hover:bg-white/5 transition-colors"
            >
              Invitaciones
            </a>
            <a
              href="/admin/content"
              className="px-3 py-1.5 text-sm text-white/60 hover:text-white rounded-md hover:bg-white/5 transition-colors"
            >
              Contenido
            </a>
            <a
              href="/admin/settings"
              className="px-3 py-1.5 text-sm text-white/60 hover:text-white rounded-md hover:bg-white/5 transition-colors"
            >
              Ajustes
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-white/30">{user.email}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs text-white/40 hover:text-white/80 transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <main className="p-6">{children}</main>
    </div>
  )
}
