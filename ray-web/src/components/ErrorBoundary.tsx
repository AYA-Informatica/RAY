import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4 text-center">
            <span className="text-6xl">⚠️</span>
            <h1 className="font-display font-bold text-2xl text-text-primary">
              Something went wrong
            </h1>
            <p className="text-sm text-text-secondary font-sans max-w-sm">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-colors font-sans"
            >
              Reload page
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
