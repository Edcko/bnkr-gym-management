import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuth } from '@/stores/auth'

// Guard para verificar autenticación
export const requireAuth = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const auth = useAuth()
  
  // Si no hay token, redirigir al login
  if (!auth.token) {
    next('/login')
    return
  }
  
  // Si no hay usuario, intentar obtener el perfil
  if (!auth.user) {
    try {
      await auth.getProfile()
    } catch (error) {
      console.error('Error getting profile:', error)
      auth.logout()
      next('/login')
      return
    }
  }
  
  next()
}

// Guard para verificar rol de administrador
export const requireAdmin = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const auth = useAuth()
  
  // Primero verificar autenticación
  if (!auth.token || !auth.user) {
    next('/login')
    return
  }
  
  // Verificar si es administrador
  if (!auth.isAdmin) {
    // Redirigir según el rol del usuario
    if (auth.isInstructor) {
      next('/instructor-classes')
    } else if (auth.isClient) {
      next('/dashboard')
    } else {
      next('/login')
    }
    return
  }
  
  next()
}

// Guard para verificar rol de instructor
export const requireInstructor = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const auth = useAuth()
  
  // Primero verificar autenticación
  if (!auth.token || !auth.user) {
    next('/login')
    return
  }
  
  // Verificar si es instructor o administrador
  if (!auth.isInstructor && !auth.isAdmin) {
    // Redirigir según el rol del usuario
    if (auth.isClient) {
      next('/dashboard')
    } else {
      next('/login')
    }
    return
  }
  
  next()
}

// Guard para usuarios autenticados (evitar acceso al login si ya están logueados)
export const requireGuest = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const auth = useAuth()
  
  // Si ya está autenticado, redirigir según su rol
  if (auth.token && auth.user) {
    if (auth.isAdmin) {
      next('/admin')
    } else if (auth.isInstructor) {
      next('/instructor-classes')
    } else {
      next('/dashboard')
    }
    return
  }
  
  next()
}

// Guard para verificar si el usuario puede acceder a una ruta específica
export const canAccessRoute = (allowedRoles: string[]) => {
  return async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const auth = useAuth()
    
    // Si no hay token, redirigir al login
    if (!auth.token || !auth.user) {
      next('/login')
      return
    }
    
    // Verificar si el rol del usuario está permitido
    if (!allowedRoles.includes(auth.user.role)) {
      // Redirigir según el rol del usuario
      if (auth.isAdmin) {
        next('/admin')
      } else if (auth.isInstructor) {
        next('/instructor-classes')
      } else {
        next('/dashboard')
      }
      return
    }
    
    next()
  }
}
