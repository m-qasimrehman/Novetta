import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

const isDev = import.meta.env.DEV

export class GlobalErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-center">
          <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-10 shadow-card">
            <h1 className="text-2xl font-bold text-gray-800">Something went wrong</h1>
            {isDev && this.state.error && (
              <pre className="mt-4 rounded-lg bg-red-50 p-4 text-left text-xs text-red-700 overflow-auto max-h-60">
                {this.state.error.message}{'\n'}{this.state.error.stack}
              </pre>
            )}
            <p className="mt-3 text-sm text-gray-500">
              {isDev ? 'Error details shown above (dev mode).' : 'An unexpected issue occurred. Please refresh the page.'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: undefined }); window.location.href = '/' }}
              className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Go to Home
            </button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
