import { useEffect, useState } from 'react'
import { Check, LogOut, Monitor, Moon, Sun } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useProfile } from '../hooks/useProfile'

type Theme = 'light' | 'dark' | 'system'

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { profile, isLoading, updateProfile, isUpdating } = useProfile()

  const [displayName, setDisplayName] = useState<string | undefined>(undefined)
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Auto-dismiss saved indicator after 3 seconds
  useEffect(() => {
    if (!saved) return
    const timer = setTimeout(() => setSaved(false), 3000)
    return () => clearTimeout(timer)
  }, [saved])

  // Show local edit value once user types; otherwise show server value
  const shownName = displayName ?? profile?.display_name ?? ''
  const nameChanged = displayName !== undefined && displayName !== (profile?.display_name ?? '')

  function handleSaveName() {
    if (!user || !nameChanged) return
    setSaved(false)
    updateProfile(
      { id: user.id, display_name: shownName || null },
      {
        onSuccess: () => {
          setSaved(true)
          setDisplayName(undefined)
        },
        onError: (err) =>
          setError(err instanceof Error ? err.message : 'Failed to save'),
      },
    )
  }

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
    <div className="min-h-svh bg-white px-4 pb-4 pt-6 dark:bg-gray-950">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Settings
      </h1>

      {error && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Account section */}
      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Account
        </h2>

        <div className="mt-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {user?.email}
          </p>
        </div>

        <div className="mt-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
          <label
            htmlFor="display-name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Display Name
          </label>

          {isLoading ? (
            <div className="mt-2 h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          ) : (
            <div className="mt-2 flex gap-2">
              <input
                id="display-name"
                type="text"
                value={shownName}
                onChange={(e) => {
                  setDisplayName(e.target.value)
                  setSaved(false)
                }}
                placeholder="Enter your name"
                className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              />
              <button
                onClick={handleSaveName}
                disabled={!nameChanged || isUpdating}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-900"
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved
                  </>
                ) : isUpdating ? (
                  'Saving…'
                ) : (
                  'Save'
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Appearance section */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Appearance
        </h2>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {themeOptions.map(({ value, label, icon: Icon }) => {
            const active = theme === value
            return (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex min-h-[44px] flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950 ${
                  active
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            )
          })}
        </div>
      </section>

      {/* Sign out */}
      <section className="mt-8">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-950"
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </section>
    </div>
  )
}
