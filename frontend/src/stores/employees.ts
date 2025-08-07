import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/utils/api'
import { useToast } from './toast'

export interface Employee {
  id: string
  name: string
  email: string
  phone?: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  isActive: boolean
  role: 'ADMIN' | 'INSTRUCTOR'
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeeData {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'INSTRUCTOR'
  phone?: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
}

export interface UpdateEmployeeData {
  name?: string
  email?: string
  role?: 'ADMIN' | 'INSTRUCTOR'
  phone?: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  isActive?: boolean
}

export const useEmployeesStore = defineStore('employees', () => {
  const employees = ref<Employee[]>([])
  const currentEmployee = ref<Employee | null>(null)
  const loading = ref(false)
  const totalEmployees = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(1)
  const searchQuery = ref('')
  const filterRole = ref<'all' | 'ADMIN' | 'INSTRUCTOR'>('all')
  const filterStatus = ref<'all' | 'active' | 'inactive'>('all')

  const toast = useToast()

  // Getters
  const filteredEmployees = computed(() => {
    let filtered = employees.value

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

  const admins = computed(() => 
    employees.value.filter(employee => employee.role === 'ADMIN')
  )

  const instructors = computed(() => 
    employees.value.filter(employee => employee.role === 'INSTRUCTOR')
  )

  const activeEmployees = computed(() => 
    employees.value.filter(employee => employee.isActive)
  )

  const inactiveEmployees = computed(() => 
    employees.value.filter(employee => !employee.isActive)
  )

  // Actions
            const fetchEmployees = async (page: number = 1, limit: number = 10) => {
            try {
              loading.value = true
              const response = await api.get(`/users?role=ADMIN,INSTRUCTOR&page=${page}&limit=${limit}`)
              
              if (response.data.success) {
                employees.value = response.data.data.users
                totalEmployees.value = response.data.data.total
                totalPages.value = response.data.data.totalPages
                currentPage.value = page
              }
            } catch (error) {
              console.error('Error fetching employees:', error)
              toast.show('Error al cargar los empleados', 'error')
            } finally {
              loading.value = false
            }
          }

  const fetchEmployeeById = async (id: string) => {
    try {
      loading.value = true
      const response = await api.get(`/users/${id}`)
      
      if (response.data.success) {
        currentEmployee.value = response.data.data
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching employee:', error)
      toast.showToast('Error al cargar el empleado', 'error')
      return null
    } finally {
      loading.value = false
    }
  }

            const createEmployee = async (employeeData: CreateEmployeeData) => {
            try {
              loading.value = true
              const response = await api.post('/users', {
                ...employeeData,
                role: employeeData.role
              })
              
              if (response.data.success) {
                const newEmployee = response.data.data
                employees.value.unshift(newEmployee)
                totalEmployees.value++
                toast.show('Empleado creado exitosamente', 'success')
                return newEmployee
              }
            } catch (error: any) {
              console.error('Error creating employee:', error)
              const errorMessage = error.response?.data?.message || 'Error al crear el empleado'
              toast.show(errorMessage, 'error')
              throw error
            } finally {
              loading.value = false
            }
          }

  const updateEmployee = async (id: string, employeeData: UpdateEmployeeData) => {
    try {
      loading.value = true
      const response = await api.put(`/users/${id}`, employeeData)
      
      if (response.data.success) {
        const updatedEmployee = response.data.data
        const index = employees.value.findIndex(employee => employee.id === id)
        if (index !== -1) {
          employees.value[index] = updatedEmployee
        }
        if (currentEmployee.value?.id === id) {
          currentEmployee.value = updatedEmployee
        }
        toast.showToast('Empleado actualizado exitosamente', 'success')
        return updatedEmployee
      }
    } catch (error: any) {
      console.error('Error updating employee:', error)
      const errorMessage = error.response?.data?.message || 'Error al actualizar el empleado'
      toast.showToast(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteEmployee = async (id: string) => {
    try {
      loading.value = true
      const response = await api.delete(`/users/${id}`)
      
      if (response.data.success) {
        employees.value = employees.value.filter(employee => employee.id !== id)
        totalEmployees.value--
        if (currentEmployee.value?.id === id) {
          currentEmployee.value = null
        }
        toast.showToast('Empleado eliminado exitosamente', 'success')
        return true
      }
    } catch (error: any) {
      console.error('Error deleting employee:', error)
      const errorMessage = error.response?.data?.message || 'Error al eliminar el empleado'
      toast.showToast(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const toggleEmployeeStatus = async (id: string) => {
    try {
      const employee = employees.value.find(e => e.id === id)
      if (!employee) return

      const response = await api.put(`/users/${id}`, {
        isActive: !employee.isActive
      })
      
      if (response.data.success) {
        const updatedEmployee = response.data.data
        const index = employees.value.findIndex(e => e.id === id)
        if (index !== -1) {
          employees.value[index] = updatedEmployee
        }
        if (currentEmployee.value?.id === id) {
          currentEmployee.value = updatedEmployee
        }
        toast.showToast(
          `Empleado ${updatedEmployee.isActive ? 'activado' : 'desactivado'} exitosamente`,
          'success'
        )
        return updatedEmployee
      }
    } catch (error: any) {
      console.error('Error toggling employee status:', error)
      const errorMessage = error.response?.data?.message || 'Error al cambiar el estado del empleado'
      toast.showToast(errorMessage, 'error')
      throw error
    }
  }

  const changeEmployeeRole = async (id: string, newRole: 'ADMIN' | 'INSTRUCTOR') => {
    try {
      const response = await api.put(`/users/${id}`, {
        role: newRole
      })
      
      if (response.data.success) {
        const updatedEmployee = response.data.data
        const index = employees.value.findIndex(e => e.id === id)
        if (index !== -1) {
          employees.value[index] = updatedEmployee
        }
        if (currentEmployee.value?.id === id) {
          currentEmployee.value = updatedEmployee
        }
        toast.showToast(`Rol cambiado a ${newRole} exitosamente`, 'success')
        return updatedEmployee
      }
    } catch (error: any) {
      console.error('Error changing employee role:', error)
      const errorMessage = error.response?.data?.message || 'Error al cambiar el rol del empleado'
      toast.showToast(errorMessage, 'error')
      throw error
    }
  }

  const searchEmployees = async (query: string) => {
    searchQuery.value = query
  }

  const setFilterRole = (role: 'all' | 'ADMIN' | 'INSTRUCTOR') => {
    filterRole.value = role
  }

  const setFilterStatus = (status: 'all' | 'active' | 'inactive') => {
    filterStatus.value = status
  }

  const clearFilters = () => {
    searchQuery.value = ''
    filterRole.value = 'all'
    filterStatus.value = 'all'
  }

  const getEmployeeStats = () => {
    return {
      total: employees.value.length,
      admins: admins.value.length,
      instructors: instructors.value.length,
      active: activeEmployees.value.length,
      inactive: inactiveEmployees.value.length
    }
  }

  return {
    // State
    employees,
    currentEmployee,
    loading,
    totalEmployees,
    totalPages,
    currentPage,
    searchQuery,
    filterRole,
    filterStatus,

    // Getters
    filteredEmployees,
    admins,
    instructors,
    activeEmployees,
    inactiveEmployees,

    // Actions
    fetchEmployees,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeStatus,
    changeEmployeeRole,
    searchEmployees,
    setFilterRole,
    setFilterStatus,
    clearFilters,
    getEmployeeStats
  }
}) 