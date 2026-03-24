import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider'
import { AuthProvider } from './components/AuthProvider'
import { useAuth } from './hooks/useAuth'
import BottomTabBar from './components/BottomTabBar'
import WorkoutPage from './pages/WorkoutPage'
import CalendarPage from './pages/CalendarPage'
import WeightPage from './pages/WeightPage'
import ChartsPage from './pages/ChartsPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'

const queryClient = new QueryClient()

function LoadingScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-white dark:bg-gray-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  )
}

function ProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />

  return (
    <>
      <div className="pb-16">
        <Outlet />
      </div>
      <BottomTabBar />
    </>
  )
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/workout" replace />

  return <>{children}</>
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route
                path="/login"
                element={<PublicRoute><LoginPage /></PublicRoute>}
              />
              <Route
                path="/signup"
                element={<PublicRoute><SignUpPage /></PublicRoute>}
              />
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<Navigate to="/workout" replace />} />
                <Route path="/workout" element={<WorkoutPage />} />
                <Route path="/workout/:date" element={<WorkoutPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/weight" element={<WeightPage />} />
                <Route path="/charts" element={<ChartsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
