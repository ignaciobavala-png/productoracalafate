import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '../login/actions'
import { SidebarNav } from './SidebarNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const [{ count: totalGuests }, { count: pending }, { count: unusedCodes }] = await Promise.all([
    supabase.from('guests').select('*', { count: 'exact', head: true }),
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('invitations').select('*', { count: 'exact', head: true }).is('used_by', null),
  ])

  const navItems = [
    { href: '/admin/guests',      label: 'Registros',    badge: pending ?? 0 },
    { href: '/admin/invitations', label: 'Invitaciones', badge: unusedCodes ?? 0 },
    { href: '/admin/content',     label: 'Contenido' },
    { href: '/admin/settings',    label: 'Métodos de pago' },
  ]

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-black flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-black/10 flex flex-col sticky top-0 h-screen bg-white">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-black/10">
          <p className="text-[10px] tracking-[0.25em] text-black/30 uppercase mb-0.5">Admin</p>
          <p className="text-sm font-semibold text-black leading-tight">Torres del Paine<br/>Summit 2026</p>
        </div>

        {/* Stats rápidas */}
        <div className="px-4 py-4 border-b border-black/10 grid grid-cols-2 gap-2">
          <div className="bg-[#eef0f3] rounded-md px-3 py-2">
            <p className="text-[10px] text-black/30 uppercase tracking-wider">Total</p>
            <p className="text-xl font-semibold tabular-nums">{totalGuests ?? 0}</p>
          </div>
          <div className="bg-yellow-100 rounded-md px-3 py-2">
            <p className="text-[10px] text-yellow-700/60 uppercase tracking-wider">Pendientes</p>
            <p className="text-xl font-semibold tabular-nums text-yellow-700">{pending ?? 0}</p>
          </div>
        </div>

        {/* Navegación */}
        <div className="py-3 flex-1">
          <SidebarNav items={navItems} />
        </div>

        {/* Usuario */}
        <div className="px-4 py-4 border-t border-black/10">
          <p className="text-[11px] text-black/30 truncate mb-2">{user.email}</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full text-left text-xs text-black/40 hover:text-black transition-colors py-1"
            >
              Cerrar sesión →
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 min-w-0 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
