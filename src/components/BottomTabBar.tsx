import { NavLink } from 'react-router-dom'
import { Dumbbell, Calendar, Scale, TrendingUp, User } from 'lucide-react'

const tabs = [
  { to: '/workout', label: 'Workout', icon: Dumbbell },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/weight', label: 'Weight', icon: Scale },
  { to: '/charts', label: 'Charts', icon: TrendingUp },
  { to: '/profile', label: 'Profile', icon: User },
] as const

export default function BottomTabBar() {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset ${
                isActive
                  ? 'font-semibold text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className="h-6 w-6"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
