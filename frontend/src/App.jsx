import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Landing from './routes/Landing'
import Login from './routes/Login'
import Register from './routes/Register'
import Dashboard from './routes/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import VantaFogBackground from './components/VantaFogBackground'

export default function App() {
  return (
    <ThemeProvider>
      <div className="app-shell">
        <VantaFogBackground />
        <div className="app-background-veil" />
        <div className="app-content">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </ThemeProvider>
  )
}
