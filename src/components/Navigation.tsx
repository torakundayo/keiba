"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calculator, BookOpen, Lightbulb } from 'lucide-react'
import { TbHorse } from 'react-icons/tb'

const navItems = [
  { href: '/', label: '計算ツール', icon: Calculator },
  { href: '/explanation', label: '計算方法', icon: BookOpen },
  { href: '/insight', label: '考察', icon: Lightbulb },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 text-blue-800 font-bold text-lg shrink-0">
            <TbHorse className="h-6 w-6" />
            <span className="hidden sm:inline">3連複計算</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
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
