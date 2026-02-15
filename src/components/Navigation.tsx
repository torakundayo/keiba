"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calculator, BookOpen, Lightbulb, FlaskConical } from 'lucide-react'

const navItems = [
  { href: '/analysis', label: '買い目分析', icon: Calculator },
  { href: '/explanation', label: '計算方法', icon: BookOpen },
  { href: '/backtest', label: '検証', icon: FlaskConical },
  { href: '/insight', label: '考察', icon: Lightbulb },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between h-12">
          <Link href="/" className="text-sm font-semibold text-slate-800">
            3連複 確率構造分析
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors
                    ${isActive
                      ? 'bg-slate-100 text-slate-800'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
