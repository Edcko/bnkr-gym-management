import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/utils/api'
import type { User, LoginCredentials, RegisterData } from '@/types'

export const useAuth = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const initAuth = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    try {
      const response = await authService.login(credentials)
      const { user: userData, token: tokenData } = response.data.data
      
      user.value = userData
      token.value = tokenData
      
      localStorage.setItem('token', tokenData)
      localStorage.setItem('user', JSON.stringify(userData))
      
      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      // Extraer mensaje de error específico del backend
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.message ||
                          'Credenciales inválidas'
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: RegisterData) => {
    loading.value = true
    try {
      const response = await authService.register(userData)
      const { user: newUser, token: tokenData } = response.data.data
      
      user.value = newUser
      token.value = tokenData
      
      localStorage.setItem('token', tokenData)
      localStorage.setItem('user', JSON.stringify(newUser))
      
      return { success: true }
    } catch (error: any) {
      console.error('Register error:', error)
      // Extraer mensaje de error específico del backend
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.message ||
                          'Error al registrarse'
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const getProfile = async () => {
    try {
      const response = await authService.getProfile()
      user.value = response.data.data
      localStorage.setItem('user', JSON.stringify(response.data.data))
    } catch (error) {
      console.error('Get profile error:', error)
      logout()
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    initAuth,
    login,
    register,
    logout,
    getProfile
  }
}) 