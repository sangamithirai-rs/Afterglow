import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { NotFoundPage } from './pages/NotFoundPage'

// Everything except the landing page is loaded on demand so first paint isn't
// blocked on the (large) editor and public-viewer bundles.
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
)
const CreateExperiencePage = lazy(() =>
  import('./pages/CreateExperiencePage').then((m) => ({
    default: m.CreateExperiencePage,
  }))
)
const EditExperiencePage = lazy(() =>
  import('./pages/EditExperiencePage').then((m) => ({
    default: m.EditExperiencePage,
  }))
)
const PublicExperiencePage = lazy(() =>
  import('./pages/PublicExperiencePage').then((m) => ({
    default: m.PublicExperiencePage,
  }))
)
const PrivacyPolicyPage = lazy(() =>
  import('./pages/PrivacyPolicyPage').then((m) => ({
    default: m.PrivacyPolicyPage,
  }))
)
const TermsPage = lazy(() =>
  import('./pages/TermsPage').then((m) => ({ default: m.TermsPage }))
)

function PageFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-bg text-ink-soft"
      role="status"
      aria-live="polite"
    >
      Loading...
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/privacy" element={<PrivacyPolicyPage />} />

          <Route path="/terms" element={<TermsPage />} />

          <Route path="/not-found" element={<NotFoundPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/experiences/new"
            element={
              <ProtectedRoute>
                <CreateExperiencePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/experiences/:id/edit"
            element={
              <ProtectedRoute>
                <EditExperiencePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/experience/:slug"
            element={<PublicExperiencePage />}
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
