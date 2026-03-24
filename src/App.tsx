import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'

const queryClient = new QueryClient()

function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-white dark:bg-gray-950">
      <Dumbbell className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
      <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Fitness Progress
      </h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Track your workouts, visualize your gains.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
