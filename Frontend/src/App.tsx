import AppRoutes from './AppRoutes'
import AppProviders from './providers/AppProviders'
import { GlobalErrorBoundary } from './components/feedback/GlobalErrorBoundary'

function App() {
  return (
    <GlobalErrorBoundary>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </GlobalErrorBoundary>
  )
}

export default App
