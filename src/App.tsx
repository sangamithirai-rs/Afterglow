import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { DashboardPage } from './pages/DashboardPage'
import { CreateExperiencePage } from './pages/CreateExperiencePage'
import { EditExperiencePage } from './pages/EditExperiencePage'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
      </Routes>
    </BrowserRouter>
  )
}

export default App