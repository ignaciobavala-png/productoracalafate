import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmailForm, PasswordForm } from './AccountForms'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-6">Cuenta</h1>

      <div className="space-y-4">
        {/* Email */}
        <div className="border border-black/10 rounded-lg overflow-hidden bg-white">
          <div className="px-4 py-3 bg-black/[0.02] border-b border-black/10">
            <span className="text-sm font-medium">Correo electrónico</span>
          </div>
          <div className="p-4">
            <EmailForm currentEmail={user.email ?? ''} />
          </div>
        </div>

        {/* Contraseña */}
        <div className="border border-black/10 rounded-lg overflow-hidden bg-white">
          <div className="px-4 py-3 bg-black/[0.02] border-b border-black/10">
            <span className="text-sm font-medium">Contraseña</span>
          </div>
          <div className="p-4">
            <PasswordForm />
          </div>
        </div>
      </div>
    </div>
  )
}
