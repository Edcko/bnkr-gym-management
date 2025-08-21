import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from './toast'
import { api } from '@/utils/api'

// Interfaces específicas para empleados
export interface Employee {
  id: string
  name: string
  email: string
  role: 'INSTRUCTOR' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN'
  phone?: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeeData {
  name: string
  email: string
  password: string
  role: 'INSTRUCTOR' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN'
  phone?: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  isActive?: boolean
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  password?: string
}

export const useEmployeesStore = defineStore('employees', () => {
  const toast = useToast()
  
  // Estado local para empleados
  const employees = ref<Employee[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalEmployees = ref(0)
  const searchQuery = ref('')
  const filterRole = ref<'all' | 'INSTRUCTOR' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN'>('all')
  const filterStatus = ref<'all' | 'active' | 'inactive'>('all')
  
  // Estado específico de empleados
  const stats = ref({
    totalEmployees: 0,
    activeEmployees: 0,
    instructors: 0,
    supervisors: 0,
    managers: 0,
    admins: 0
  })
  
  // Getters computados
  const allItems = computed(() => {
    console.log('🔍 allItems computed llamado, employees.value:', employees.value)
    return employees.value
  })
  
  const filteredItems = computed(() => {
    console.log('🔍 filteredItems computed llamado, employees.value:', employees.value)
    let filtered = employees.value

    // Verificar que employees.value sea un array
    if (!Array.isArray(employees.value)) {
      console.error('❌ employees.value no es un array:', employees.value)
      return []
    }

    // Filtrar por búsqueda
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(employee =>
        employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.phone?.toLowerCase().includes(query)
      )
    }

    // Filtrar por rol
    if (filterRole.value !== 'all') {
      filtered = filtered.filter(employee => employee.role === filterRole.value)
    }

    // Filtrar por estado
    if (filterStatus.value !== 'all') {
      filtered = filtered.filter(employee => 
        filterStatus.value === 'active' ? employee.isActive : !employee.isActive
      )
    }

    return filtered
  })

  const activeEmployees = computed(() => {
    console.log('🔍 activeEmployees computed llamado, employees.value:', employees.value)
    if (!Array.isArray(employees.value)) {
      console.error('❌ employees.value no es un array en activeEmployees:', employees.value)
      return []
    }
    return employees.value.filter(employee => employee.isActive)
  })

  const supervisors = computed(() => {
    console.log('🔍 supervisors computed llamado, employees.value:', employees.value)
    if (!Array.isArray(employees.value)) {
      console.error('❌ employees.value no es un array en supervisors:', employees.value)
      return []
    }
    return employees.value.filter(employee => employee.role === 'SUPERVISOR')
  })

  const managers = computed(() => {
    console.log('🔍 managers computed llamado, employees.value:', employees.value)
    if (!Array.isArray(employees.value)) {
      console.error('❌ employees.value no es un array en managers:', employees.value)
      return []
    }
    return employees.value.filter(employee => employee.role === 'MANAGER')
  })

  const admins = computed(() => {
    console.log('🔍 admins computed llamado, employees.value:', employees.value)
    if (!Array.isArray(employees.value)) {
      console.error('❌ employees.value no es un array en admins:', employees.value)
      return []
    }
    return employees.value.filter(employee => employee.role === 'ADMIN')
  })

  const instructors = computed(() => {
    console.log('🔍 instructors computed llamado, employees.value:', employees.value)
    if (!Array.isArray(employees.value)) {
      console.error('❌ employees.value no es un array en instructors:', employees.value)
      return []
    }
    return employees.value.filter(employee => employee.role === 'INSTRUCTOR')
  })

  // Cargar estadísticas de empleados
  const loadStats = async () => {
    try {
      console.log('📊 Llamando a /users/stats...')
      const response = await api.get('/users/stats')
      console.log('📊 Respuesta de stats:', response.data)
      
      if (response.data.success) {
        // Calcular estadísticas específicas de empleados desde los datos de usuarios
        const allUsers = employees.value
        const instructorUsers = allUsers.filter(user => user.role === 'INSTRUCTOR')
        const supervisorUsers = allUsers.filter(user => user.role === 'SUPERVISOR')
        const managerUsers = allUsers.filter(user => user.role === 'MANAGER')
        const adminUsers = allUsers.filter(user => user.role === 'ADMIN')
        
        stats.value = {
          totalEmployees: allUsers.length,
          activeEmployees: allUsers.filter(user => user.isActive).length,
          instructors: instructorUsers.length,
          supervisors: supervisorUsers.length,
          managers: managerUsers.length,
          admins: adminUsers.length
        }
        console.log('✅ Stats actualizados:', stats.value)
      }
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error)
      toast.show('Error al cargar estadísticas de empleados', 'error')
    }
  }
  
  // Métodos para cargar empleados
  const fetchAll = async (page: number = 1, limit: number = 10) => {
    try {
      loading.value = true
      // Cargar todos los usuarios y filtrar por rol INSTRUCTOR o EMPLOYEE
      const response = await api.get(`/users?page=${page}&limit=${limit}`)
      
      if (response.data.success) {
        console.log('📡 Respuesta recibida:', response.data)
        
        // Verificar si la respuesta tiene el formato esperado
        if (response.data.data?.users) {
          // Formato: { users: Array, total: number, totalPages: number, currentPage: number, limit: number }
          // Filtrar solo usuarios con roles de empleados del gym
          const allUsers = response.data.data.users as any[]
          const filteredUsers = allUsers.filter((user: any) => 
            user.role === 'INSTRUCTOR' || 
            user.role === 'SUPERVISOR' || 
            user.role === 'MANAGER' || 
            user.role === 'ADMIN'
          )
          
          employees.value = filteredUsers
          totalEmployees.value = filteredUsers.length
          totalPages.value = response.data.data.totalPages
          currentPage.value = response.data.data.currentPage
          console.log('✅ Empleados cargados (formato paginado):', employees.value.length)
        } else if (Array.isArray(response.data.data)) {
          // Formato simple: Array directo
          const filteredUsers = (response.data.data as any[]).filter((user: any) => 
            user.role === 'INSTRUCTOR' || 
            user.role === 'SUPERVISOR' || 
            user.role === 'MANAGER' || 
            user.role === 'ADMIN'
          )
          employees.value = filteredUsers
          totalEmployees.value = filteredUsers.length
          totalPages.value = 1
          currentPage.value = 1
          console.log('✅ Empleados cargados (formato simple):', employees.value.length)
        } else {
          console.error('❌ Formato de respuesta no reconocido:', response.data.data)
          employees.value = []
          totalEmployees.value = 0
          totalPages.value = 1
          currentPage.value = 1
        }
      }
    } catch (error) {
      console.error('❌ Error cargando empleados:', error)
      toast.show('Error al cargar empleados', 'error')
      employees.value = []
      totalEmployees.value = 0
      totalPages.value = 1
      currentPage.value = 1
    } finally {
      loading.value = false
    }
  }

  // Métodos específicos de empleados
  const createEmployee = async (data: CreateEmployeeData) => {
    try {
      saving.value = true
      console.log('📡 createEmployee - Llamando a POST /users')
      console.log('📡 createEmployee - Datos enviados:', data)
      const response = await api.post('/users', data)
      
      if (response.data.success) {
        const newEmployee = response.data.data
        employees.value.unshift(newEmployee)
        totalEmployees.value++
        await loadStats() // Recargar estadísticas
        toast.show('Empleado creado exitosamente', 'success')
        return newEmployee
      }
    } catch (error: any) {
      console.error('❌ createEmployee - Error completo:', error)
      console.error('❌ createEmployee - Response data:', error.response?.data)
      console.error('❌ createEmployee - Status:', error.response?.status)
      toast.show('Error al crear empleado', 'error')
      throw error
    } finally {
      saving.value = false
    }
  }
  
  const updateEmployee = async (id: string, data: UpdateEmployeeData) => {
    try {
      saving.value = true
      console.log('📡 updateEmployee - Llamando a PUT /users/' + id)
      console.log('📡 updateEmployee - Datos enviados:', data)
      const response = await api.put(`/users/${id}`, data)
      
      if (response.data.success) {
        const updatedEmployee = response.data.data
        const index = employees.value.findIndex(employee => employee.id === id)
        if (index !== -1) {
          employees.value[index] = updatedEmployee
        }
        await loadStats() // Recargar estadísticas
        toast.show('Empleado actualizado exitosamente', 'success')
        return updatedEmployee
      }
    } catch (error: any) {
      console.error('❌ updateEmployee - Error completo:', error)
      console.error('❌ updateEmployee - Response data:', error.response?.data)
      console.error('❌ updateEmployee - Status:', error.response?.status)
      toast.show('Error al actualizar empleado', 'error')
      throw error
    } finally {
      saving.value = false
    }
  }
  
  const deleteEmployee = async (id: string) => {
    try {
      deleting.value = true
      const response = await api.delete(`/users/${id}`)
      
      if (response.data.success) {
        // Remove from local state
        const index = employees.value.findIndex(employee => employee.id === id)
        if (index !== -1) {
          employees.value.splice(index, 1)
          totalEmployees.value--
        }
        await loadStats() // Recargar estadísticas
        toast.show('Empleado eliminado exitosamente', 'success')
        return true
      }
    } catch (error: any) {
      console.error('❌ deleteEmployee - Error completo:', error)
      console.error('❌ deleteEmployee - Response data:', error.response?.data)
      console.error('❌ deleteEmployee - Status:', error.response?.status)
      toast.show('Error al eliminar empleado', 'error')
      throw error
    } finally {
      deleting.value = false
    }
  }
  
  const activateEmployee = async (id: string) => {
    try {
      const response = await api.put(`/users/${id}`, { isActive: true })
      if (response.data.success) {
        const updatedEmployee = response.data.data
        const index = employees.value.findIndex(employee => employee.id === id)
        if (index !== -1) {
          employees.value[index] = updatedEmployee
        }
        toast.show('Empleado activado exitosamente', 'success')
        return updatedEmployee
      }
    } catch (error: any) {
      console.error('❌ activateEmployee - Error completo:', error)
      console.error('❌ activateEmployee - Response data:', error.response?.data)
      console.error('❌ activateEmployee - Status:', error.response?.status)
      toast.show('Error al activar empleado', 'error')
      throw error
    }
  }
  
  const deactivateEmployee = async (id: string) => {
    try {
      const response = await api.put(`/users/${id}`, { isActive: false })
      if (response.data.success) {
        const updatedEmployee = response.data.data
        const index = employees.value.findIndex(employee => employee.id === id)
        if (index !== -1) {
          employees.value[index] = updatedEmployee
        }
        toast.show('Empleado desactivado exitosamente', 'success')
        return updatedEmployee
      }
    } catch (error: any) {
      console.error('❌ deactivateEmployee - Error completo:', error)
      console.error('❌ deactivateEmployee - Response data:', error.response?.data)
      console.error('❌ deactivateEmployee - Status:', error.response?.status)
      toast.show('Error al desactivar empleado', 'error')
      throw error
    }
  }

  // Métodos de filtrado y búsqueda
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setFilter = (key: string, value: any) => {
    if (key === 'role') {
      // Permitir todos los roles válidos del schema
      if (value === 'INSTRUCTOR' || value === 'SUPERVISOR' || value === 'MANAGER' || value === 'ADMIN' || value === 'all') {
        filterRole.value = value
      }
    } else if (key === 'isActive') {
      filterStatus.value = value ? 'active' : 'inactive'
    }
  }

  const clearFilters = () => {
    searchQuery.value = ''
    filterRole.value = 'all'
    filterStatus.value = 'all'
  }

  // Computed getters adicionales
  const roles = computed(() => {
    if (!Array.isArray(employees.value)) {
      return []
    }
    // Retornar todos los roles válidos del schema
    return ['INSTRUCTOR', 'SUPERVISOR', 'MANAGER', 'ADMIN']
  })
  
  // Inicializar store
  const init = async () => {
    await fetchAll()
    await loadStats()
  }
  
  return {
    // Estado
    employees,
    loading,
    saving,
    deleting,
    currentPage,
    totalPages,
    totalEmployees,
    searchQuery,
    filterRole,
    filterStatus,
    stats,
    
    // Getters
    allItems,
    filteredItems,
    activeEmployees,
    instructors,
    supervisors,
    managers,
    admins,
    roles,
    
    // Métodos
    fetchAll,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    activateEmployee,
    deactivateEmployee,
    
    // Métodos de filtrado y búsqueda
    setSearchQuery,
    setFilter,
    clearFilters,
    
    // Inicialización
    init
  }
}) 