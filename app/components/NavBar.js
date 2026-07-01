'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

const navItems = [
  { label: 'Feed', href: '/feed' },
  { label: 'Post Catch', href: '/post' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Map', href: '/map' },
  { label: 'Profile', href: '/profile' },
]

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const isActive = (href) => pathname === href || (href !== '/' && pathname?.startsWith(href))

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-lg font-bold tracking-wide text-emerald-400">
          <span className="gradient-text">🎣 CastLog</span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`border-b-2 border-transparent text-sm font-medium transition ${isActive(item.href) ? 'border-emerald-500 text-emerald-400' : 'text-gray-400 hover:text-white'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={handleSignOut}
            className="rounded-xl border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-300 transition hover:border-gray-500 hover:text-white"
          >
            Sign out
          </button>
        </div>

        <button
          className="inline-flex items-center rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-gray-300 hover:border-emerald-500 hover:text-white md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className="text-lg">☰</span>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950/95 px-4 py-4">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive(item.href) ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-300 hover:bg-gray-900 hover:text-white'}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false)
                handleSignOut()
              }}
              className="rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-left text-sm text-gray-300 transition hover:border-gray-500 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
