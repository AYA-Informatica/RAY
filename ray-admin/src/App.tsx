import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AdminRouter } from './AdminRouter'
import { ErrorBoundary } from './components/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 2 },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <AdminRouter />
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#242424',
              color: '#fff',
              border: '1px solid #2E2E2E',
              borderRadius: 12,
              fontSize: 14,
              fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#22C55E', secondary: '#242424' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#242424' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
