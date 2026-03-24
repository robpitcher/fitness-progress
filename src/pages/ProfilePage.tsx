import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignOut() {
    setError(null)
    setSigningOut(true)
    try {
      await signOut()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out')
      setSigningOut(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-white px-4 dark:bg-gray-950">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Profile
      </h1>

      {user && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {user.email}
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-950"
      >
        <LogOut className="h-4 w-4" />
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}
