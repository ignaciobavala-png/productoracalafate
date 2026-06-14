import { loginAction } from './actions'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <p className="text-xs tracking-[0.25em] text-black/30 uppercase mb-2">
            Torres del Paine Summit 2026
          </p>
          <h1 className="text-2xl font-semibold text-black">Panel de administración</h1>
        </div>

        <form action={loginAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs text-black/50 mb-1.5 tracking-wide">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full bg-white border border-black/10 rounded-md px-4 py-2.5 text-black text-sm placeholder:text-black/20 focus:outline-none focus:border-black/30 transition-colors"
              placeholder="admin@calafate.cl"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs text-black/50 mb-1.5 tracking-wide">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full bg-white border border-black/10 rounded-md px-4 py-2.5 text-black text-sm placeholder:text-black/20 focus:outline-none focus:border-black/30 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              Credenciales incorrectas. Intenta nuevamente.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-black text-white font-semibold py-2.5 rounded-md text-sm hover:bg-black/80 transition-colors mt-2"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}
