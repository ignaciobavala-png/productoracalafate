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
                ? 'bg-black text-white font-medium'
                : 'text-black/50 hover:text-black hover:bg-black/5'
            }`}
          >
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums ${
                active ? 'bg-white/20 text-white' : 'bg-black/10 text-black/50'
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
