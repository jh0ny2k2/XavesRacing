import { useState, useEffect } from 'react'
import { useUser } from './hooks/useUser'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Setup from './components/Setup'
import LandingPage from './components/LandingPage'

function App() {
  const [supabaseConfigured, setSupabaseConfigured] = useState(false)
  const [configLoading, setConfigLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' o 'register'
  const [forceRedirect, setForceRedirect] = useState(false)
  const { user, loading, isAuthenticated, reload } = useUser()

  useEffect(() => {
    // Verificar si Supabase está configurado
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl.includes('tu-proyecto') || 
        supabaseKey.includes('tu_clave') ||
        supabaseUrl === 'your_supabase_project_url' ||
        supabaseKey === 'your_supabase_anon_key') {
      setSupabaseConfigured(false)
    } else {
      setSupabaseConfigured(true)
    }
    
    setConfigLoading(false)
  }, [])

  // Escuchar cambios en localStorage para detectar logout
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'session_token' && !e.newValue) {
        reload()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [reload])

  // Detectar cuando el usuario se autentica para activar redirección
  useEffect(() => {
    if (isAuthenticated && !forceRedirect) {
      setForceRedirect(true)
    }
  }, [isAuthenticated, forceRedirect])

  if (configLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  if (!supabaseConfigured) {
    return <Setup />
  }

  const shouldShowDashboard = isAuthenticated || forceRedirect

  return (
    <div className="min-h-screen bg-gray-50">
      {!shouldShowDashboard ? (
        showAuth ? (
          authMode === 'login' ? (
            <Login onSwitchToRegister={() => setAuthMode('register')} />
          ) : (
            <Register onSwitchToLogin={() => setAuthMode('login')} />
          )
        ) : (
          <LandingPage onGetStarted={() => setShowAuth(true)} />
        )
      ) : (
        <Dashboard user={user} />
      )}
    </div>
  )
}

export default App
