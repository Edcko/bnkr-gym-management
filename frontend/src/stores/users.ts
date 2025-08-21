import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BaseStore } from './baseStore'
import type { BaseEntity } from './baseStore'
import { useToast } from './toast'
import { api } from '@/utils/api'

// Interfaces específicas para usuarios
export interface User extends BaseEntity {
  name: string
  email: string
  role: 'ADMIN' | 'INSTRUCTOR' | 'CLIENT'
  phone?: string
  isActive: boolean
  address?: string
  dateOfBirth?: string
  emergencyContact?: string
  emergencyPhone?: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'INSTRUCTOR' | 'CLIENT'
  phone?: string
  isActive?: boolean
  address?: string
  dateOfBirth?: string
  emergencyContact?: string
  emergencyPhone?: string
}

export interface UpdateUserData extends Partial<Omit<CreateUserData, 'password'>> {
  password?: string
}

export const useUsersStore = defineStore('users', () => {
  const toast = useToast()
  
  // Estado local del store
  const users = ref<User[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  
  // Estado específico de usuarios
  const stats = ref({
    total: 0,
    clients: 0,
    employees: 0,
    admins: 0,
    instructors: 0
  })
  
  // Cargar usuarios desde el backend
  const fetchUsers = async () => {
    try {
      loading.value = true
      console.log('📡 Llamando a /users...')
      
      const response = await api.get('/users')
      console.log('📡 Respuesta recibida:', response.data)
      
      if (response.data.success) {
        // La respuesta tiene la estructura: { users: [...], total: 7, ... }
        users.value = response.data.data.users || []
        console.log('✅ Usuarios cargados:', users.value.length)
      }
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error)
      toast.show('Error al cargar usuarios', 'error')
    } finally {
      loading.value = false
    }
  }
  
  // Cargar estadísticas de usuarios
  const loadStats = async () => {
    try {
      // DEBUG: Extraer token para pruebas manuales
      const token = localStorage.getItem('token')
      console.log('🔑 TOKEN PARA PRUEBAS:', token)
      console.log('🔑 TOKEN COMPLETO:', token ? `Bearer ${token}` : 'No token')
      
      console.log('📊 Llamando a /users/stats...')
      const response = await api.get('/users/stats')
      console.log('📊 Respuesta de stats:', response.data)
      
      if (response.data.success) {
        stats.value = response.data.data
        console.log('✅ Stats actualizados:', stats.value)
      }
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error)
      toast.show('Error al cargar estadísticas de usuarios', 'error')
    }
  }
  
  // Métodos CRUD
  const createUser = async (data: CreateUserData) => {
    try {
      saving.value = true
      const response = await api.post('/users', data)
      
      if (response.data.success) {
        const newUser = response.data.data
        users.value.unshift(newUser)
        await loadStats() // Recargar estadísticas
        toast.show('Usuario creado exitosamente', 'success')
        return newUser
      }
    } catch (error) {
      toast.show('Error al crear usuario', 'error')
      throw error
    } finally {
      saving.value = false
    }
  }
  
  const updateUser = async (id: string, data: UpdateUserData) => {
    try {
      saving.value = true
      const response = await api.put(`/users/${id}`, data)
      
      if (response.data.success) {
        const updatedUser = response.data.data
        const index = users.value.findIndex(u => u.id === id)
        if (index !== -1) {
          users.value[index] = updatedUser
        }
        await loadStats() // Recargar estadísticas
        toast.show('Usuario actualizado exitosamente', 'success')
        return updatedUser
      }
    } catch (error) {
      toast.show('Error al actualizar usuario', 'error')
      throw error
    } finally {
      saving.value = false
    }
  }
  
  const deleteUser = async (id: string) => {
    try {
      deleting.value = true
      const response = await api.delete(`/users/${id}`)
      
      if (response.data.success) {
        users.value = users.value.filter(u => u.id !== id)
        await loadStats() // Recargar estadísticas
        toast.show('Usuario eliminado exitosamente', 'success')
        return true
      }
    } catch (error) {
      toast.show('Error al eliminar usuario', 'error')
      throw error
    } finally {
      deleting.value = false
    }
  }
  
  // Computed getters
  const filteredUsers = computed(() => users.value)
  
  const activeUsers = computed(() =>
    users.value.filter(item => item.isActive)
  )
  
  const inactiveUsers = computed(() =>
    users.value.filter(item => !item.isActive)
  )
  
  const adminUsers = computed(() =>
    users.value.filter(item => item.role === 'ADMIN')
  )
  
  const instructorUsers = computed(() =>
    users.value.filter(item => item.role === 'INSTRUCTOR')
  )
  
  const clientUsers = computed(() =>
    users.value.filter(item => item.role === 'CLIENT')
  )
  
  // Inicializar store
  const init = async () => {
    console.log('🚀 Iniciando store de usuarios...')
    try {
      await fetchUsers()
      await loadStats()
    } catch (error) {
      console.error('❌ Error en init:', error)
      throw error
    }
  }
  
  return {
    // Estado
    users,
    loading,
    saving,
    deleting,
    stats,
    
    // Métodos
    fetchUsers,
    loadStats,
    create: createUser,
    update: updateUser,
    delete: deleteUser,
    
    // Computed getters
    filteredUsers,
    activeUsers,
    inactiveUsers,
    adminUsers,
    instructorUsers,
    clientUsers,
    
    // Inicialización
    init
  }
})
