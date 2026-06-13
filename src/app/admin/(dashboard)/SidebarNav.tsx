'use client'

import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  badge?: number
}

interface Props {
  items: NavItem[]
}

export function SidebarNav({ items }: Props) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {items.map(item => {
        const active = pathname.startsWith(item.href)
        return (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors ${
              active
                ? 'bg-white text-zinc-900 font-medium'
                : 'text-white/60 hover:text-white hover:bg-white/8'
            }`}
          >
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums ${
                active ? 'bg-zinc-900/15 text-zinc-900' : 'bg-white/10 text-white/50'
              }`}>
                {item.badge}
              </span>
            )}
          </a>
        )
      })}
    </nav>
  )
}
