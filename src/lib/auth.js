import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

// Generar token de sesión único
const generateSessionToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Registrar nuevo usuario
export const signUp = async (email, password, fullName, username) => {
  try {
    console.log('🔄 Iniciando registro para:', email)

    // Validar datos
    if (!email || !password || !fullName || !username) {
      throw new Error('Todos los campos son obligatorios')
    }

    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres')
    }

    // Verificar si el email ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      throw new Error('Este email ya está registrado')
    }

    // Verificar si el username ya existe
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUsername) {
      throw new Error('Este nombre de usuario ya está en uso')
    }

    // Hashear contraseña
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Generar token de sesión
    const sessionToken = generateSessionToken()
    const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días

    // Crear usuario
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        username,
        session_token: sessionToken,
        session_expires: sessionExpires.toISOString(),
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error al crear usuario:', error)
      throw new Error('Error al crear la cuenta: ' + error.message)
    }

    // Guardar token en localStorage
    localStorage.setItem('session_token', sessionToken)

    console.log('✅ Usuario registrado exitosamente:', newUser.email)
    return { user: newUser, sessionToken }

  } catch (error) {
    console.error('❌ Error en registro:', error.message)
    throw error
  }
}

// Iniciar sesión
export const signIn = async (email, password) => {
  try {
    console.log('🔄 Iniciando login para:', email)

    if (!email || !password) {
      throw new Error('Email y contraseña son obligatorios')
    }

    // Buscar usuario por email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      throw new Error('Email o contraseña incorrectos')
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      throw new Error('Email o contraseña incorrectos')
    }

    // Generar nuevo token de sesión
    const sessionToken = generateSessionToken()
    const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días

    // Actualizar usuario con nuevo token
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        session_token: sessionToken,
        session_expires: sessionExpires.toISOString(),
        last_login: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error al actualizar sesión:', updateError)
      throw new Error('Error al iniciar sesión')
    }

    // Guardar token en localStorage
    localStorage.setItem('session_token', sessionToken)

    console.log('✅ Login exitoso para:', user.email)
    return { user: updatedUser, sessionToken }

  } catch (error) {
    console.error('❌ Error en login:', error.message)
    throw error
  }
}

// Verificar sesión actual
export const getCurrentUser = async () => {
  try {
    const sessionToken = localStorage.getItem('session_token')
    console.log('🔍 Verificando token de sesión:', sessionToken ? 'Token encontrado' : 'No hay token')
    
    if (!sessionToken) {
      console.log('❌ No hay token de sesión')
      return null
    }

    // Buscar usuario por token de sesión
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('❌ Error al buscar usuario por token:', error.message)
      localStorage.removeItem('session_token')
      return null
    }

    if (!user) {
      console.log('❌ No se encontró usuario con este token')
      localStorage.removeItem('session_token')
      return null
    }

    // Verificar si la sesión no ha expirado
    const now = new Date()
    const sessionExpires = new Date(user.session_expires)

    if (now > sessionExpires) {
      console.log('❌ Sesión expirada')
      // Sesión expirada, limpiar
      localStorage.removeItem('session_token')
      await supabase
        .from('users')
        .update({ session_token: null, session_expires: null })
        .eq('id', user.id)
      return null
    }

    console.log('✅ Usuario autenticado:', user.email)
    return user

  } catch (error) {
    console.error('❌ Error al verificar sesión:', error.message)
    localStorage.removeItem('session_token')
    return null
  }
}

// Cerrar sesión
export const signOut = async () => {
  try {
    const sessionToken = localStorage.getItem('session_token')
    
    if (sessionToken) {
      // Limpiar token en la base de datos
      await supabase
        .from('users')
        .update({ session_token: null, session_expires: null })
        .eq('session_token', sessionToken)
    }

    // Limpiar localStorage
    localStorage.removeItem('session_token')
    
    console.log('✅ Sesión cerrada exitosamente')
    return true

  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error.message)
    // Aún así limpiar localStorage
    localStorage.removeItem('session_token')
    return true
  }
}