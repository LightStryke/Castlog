'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { containsProfanity } from '../lib/filter'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')

    if (!isLogin && containsProfanity(username)) {
      setMessage("That username isn't allowed. Please choose another.")
      setLoading(false)
      return
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else window.location.href = '/feed'
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage(error.message)
      } else {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username: username.trim(),
          xp: 0,
          rank: 'Minnow',
          reputation: 0,
        })
        setMessage('Account created! You can now log in.')
        setIsLogin(true)
      }
    }
    setLoading(false)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-6 text-white">
      <div className="mb-8 text-center">
        <h1 className="gradient-text text-3xl font-bold">🎣 CastLog</h1>
        <p className="mt-1 text-gray-400">The angler&apos;s arena</p>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-8">
        <h2 className="mb-6 text-xl font-bold">{isLogin ? 'Welcome back' : 'Create account'}</h2>

        {!isLogin && (
          <div className="mb-4">
            <label className="mb-1 block text-sm text-gray-400">Username</label>
            <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="e.g. basshunter99" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none" />
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-400">Email</label>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none" />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm text-gray-400">Password</label>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none" />
        </div>

        {message ? <p className="mb-4 text-sm text-emerald-400">{message}</p> : null}

        <button onClick={handleAuth} disabled={loading} className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-black transition hover:bg-emerald-400 disabled:opacity-50">
          {loading ? 'Loading...' : isLogin ? 'Log in' : 'Create account'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-emerald-400 hover:underline">
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </main>
  )
}