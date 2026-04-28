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
          <div
            style={{
              minHeight: '100vh',
              backgroundColor: '#0E0E0E',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              padding: 32,
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 48 }}>⚠️</span>
            <h1
              style={{
                color: '#fff',
                fontFamily: 'Syne, sans-serif',
                fontSize: 22,
                fontWeight: 700,
                margin: 0,
              }}
            >
              Admin panel error
            </h1>
            <p
              style={{
                color: '#A0A0A0',
                fontSize: 14,
                maxWidth: 360,
                margin: 0,
              }}
            >
              {this.state.error?.message ?? 'Something went wrong in the admin panel.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#E8390E',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Reload
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
