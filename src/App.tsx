import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider'
import BottomTabBar from './components/BottomTabBar'
import WorkoutPage from './pages/WorkoutPage'
import CalendarPage from './pages/CalendarPage'
import WeightPage from './pages/WeightPage'
import ChartsPage from './pages/ChartsPage'
import ProfilePage from './pages/ProfilePage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="pb-16">
            <Routes>
              <Route path="/" element={<Navigate to="/workout" replace />} />
              <Route path="/workout" element={<WorkoutPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/weight" element={<WeightPage />} />
              <Route path="/charts" element={<ChartsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </div>
          <BottomTabBar />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
