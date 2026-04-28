import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { useEffect } from 'react'
import { AppRouter } from './AppRouter'
import { useAuth } from './hooks/useAuth'
import { ErrorBoundary } from './components/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
})

// Initialise Firebase auth listener at app root
function AuthInit({ children }: { children: React.ReactNode }) {
  useAuth()
  return <>{children}</>
}

function App() {
  // Register service worker for FCM
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('[SW] Registered:', registration.scope)
        })
        .catch((err) => {
          console.warn('[SW] Registration failed:', err)
        })
    }
  }, [])

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthInit>
            <ErrorBoundary>
              <AppRouter />
            </ErrorBoundary>
          </AuthInit>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App
