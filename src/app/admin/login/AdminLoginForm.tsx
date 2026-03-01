'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function AdminLoginForm() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // List of authorized admin emails
  const ADMIN_EMAILS = [
    'mtosic0450@gmail.com',
    'apartmanijovca@gmail.com'
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  // Create a browser-side supabase client that handles cookies automatically
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔵 Login attempt started')
    setLoading(true)
    setError('')

    try {
      console.log('🔵 Calling Supabase signInWithPassword...')
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('❌ Login error:', authError)
        setError(authError.message)
      } else if (data.user) {
        console.log('✅ User logged in:', data.user.email)
        
        // Check if user email is in the authorized admin list
        if (ADMIN_EMAILS.includes(data.user.email || '')) {
          console.log('✅ Admin email verified, session handled by SSR client')
          
          // Small delay to ensure cookies are written before redirect
          await new Promise(resolve => setTimeout(resolve, 500))
          
          console.log('🚀 Redirecting to /admin')
          // Using window.location.assign for a fresh reload to pick up server cookies
          window.location.assign('/admin')
        } else {
          console.warn('⚠️ Unauthorized email:', data.user.email)
          setError('Unauthorized access - not an admin account')
          await supabase.auth.signOut()
        }
      }
    } catch (err) {
      console.error('💥 Unexpected login error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
      console.log('🔵 Login attempt finished')
    }
  }

  if (!mounted) return null

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm -space-y-px text-black">
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mb-2"
            placeholder="Email address"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Password"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm text-center border border-red-100">
          {error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all shadow-md"
        >
          {loading ? 'Signing in...' : 'Enter Admin Panel'}
        </button>
      </div>
    </form>
  )
}
