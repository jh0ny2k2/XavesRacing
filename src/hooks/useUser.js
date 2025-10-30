import { useState, useEffect } from 'react'
import { getCurrentUser, signOut as authSignOut } from '../lib/auth'

export const useUser = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Función para cargar el usuario actual
  const loadUser = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const currentUser = await getCurrentUser()
      console.log('🔍 Usuario cargado:', currentUser ? currentUser.email : 'No autenticado')
      setUser(currentUser)
      
    } catch (err) {
      console.error('❌ Error al cargar usuario:', err.message)
      setError(err.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Función para cerrar sesión
  const signOut = async () => {
    try {
      setLoading(true)
      await authSignOut()
      setUser(null)
      setError(null)
      console.log('✅ Sesión cerrada desde useUser')
      
      // Forzar recarga de la página para limpiar todo el estado
      window.location.reload()
    } catch (err) {
      console.error('❌ Error al cerrar sesión:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Función para actualizar el usuario después de login/registro
  const updateUser = (newUser) => {
    console.log('🔄 Actualizando usuario:', newUser ? newUser.email : 'null')
    setUser(newUser)
    setError(null)
  }

  // Cargar usuario al montar el componente
  useEffect(() => {
    loadUser()
  }, [])

  // Escuchar cambios en localStorage para detectar login/logout en otras pestañas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'session_token') {
        console.log('🔄 Token de sesión cambió, recargando usuario...')
        loadUser()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return {
    user,
    loading,
    error,
    signOut,
    updateUser,
    reload: loadUser,
    isAuthenticated: !!user && !!user.id
  }
}