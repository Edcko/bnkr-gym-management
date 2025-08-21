import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from './toast'
import { api } from '@/utils/api'

// Interfaces específicas para clientes
export interface Client {
  id: string
  name: string
  email: string
  role: 'CLIENT'
  phone?: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateClientData {
  name: string
  email: string
  password: string
  phone?: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  isActive?: boolean
}

export interface UpdateClientData extends Partial<CreateClientData> {
  password?: string
}

export const useClientsStore = defineStore('clients', () => {
  const toast = useToast()
  
  // Estado local para clientes
  const clients = ref<Client[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalClients = ref(0)
  const searchQuery = ref('')
  const filterStatus = ref<'all' | 'active' | 'inactive'>('all')
  
  // Estado específico de clientes
  const stats = ref({
    totalClients: 0,
    activeClients: 0,
    newClientsThisMonth: 0
  })
  
  // Getters computados
  const allItems = computed(() => {
    console.log('🔍 allItems computed llamado, clients.value:', clients.value)
    return clients.value
  })
  
  const filteredItems = computed(() => {
    console.log('🔍 filteredItems computed llamado, clients.value:', clients.value)
    let filtered = clients.value

    // Verificar que clients.value sea un array
    if (!Array.isArray(clients.value)) {
      console.error('❌ clients.value no es un array:', clients.value)
      return []
    }

    // Filtrar por búsqueda
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone?.toLowerCase().includes(query)
      )
    }

    // Filtrar por estado
    if (filterStatus.value !== 'all') {
      filtered = filtered.filter(client => 
        filterStatus.value === 'active' ? client.isActive : !client.isActive
      )
    }

    return filtered
  })

  const activeClients = computed(() => {
    console.log('🔍 activeClients computed llamado, clients.value:', clients.value)
    if (!Array.isArray(clients.value)) {
      console.error('❌ clients.value no es un array en activeClients:', clients.value)
      return []
    }
    return clients.value.filter(client => client.isActive)
  })

  const inactiveClients = computed(() => {
    console.log('🔍 inactiveClients computed llamado, clients.value:', clients.value)
    if (!Array.isArray(clients.value)) {
      console.error('❌ clients.value no es un array en inactiveClients:', clients.value)
      return []
    }
    return clients.value.filter(client => !client.isActive)
  })

  // Cargar estadísticas de clientes
  const loadStats = async () => {
    try {
      console.log('📊 Llamando a /clients/stats...')
      const response = await api.get('/clients/stats')
      console.log('📊 Respuesta de stats:', response.data)
      
      if (response.data.success) {
        stats.value = response.data.data
        console.log('✅ Stats actualizados:', stats.value)
      }
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error)
      toast.show('Error al cargar estadísticas de clientes', 'error')
    }
  }
  
  // Métodos para cargar clientes
  const fetchAll = async (page: number = 1, limit: number = 10) => {
    try {
      loading.value = true
      const response = await api.get(`/clients?page=${page}&limit=${limit}`)
      
      if (response.data.success) {
        console.log('📡 Respuesta recibida:', response.data)
        
        // Verificar si la respuesta tiene el formato esperado
        if (response.data.data?.users) {
          // Formato: { users: Array, total: number, totalPages: number, currentPage: number, limit: number }
          clients.value = response.data.data.users
          totalClients.value = response.data.data.total
          totalPages.value = response.data.data.totalPages
          currentPage.value = response.data.data.currentPage
          console.log('✅ Clientes cargados (formato paginado):', clients.value.length)
        } else if (Array.isArray(response.data.data)) {
          // Formato simple: Array directo
          clients.value = response.data.data
          totalClients.value = response.data.data.length
          totalPages.value = 1
          currentPage.value = 1
          console.log('✅ Clientes cargados (formato simple):', clients.value.length)
        } else {
          console.error('❌ Formato de respuesta no reconocido:', response.data.data)
          clients.value = []
          totalClients.value = 0
          totalPages.value = 1
          currentPage.value = 1
        }
      }
    } catch (error) {
      console.error('❌ Error cargando clientes:', error)
      toast.show('Error al cargar clientes', 'error')
      clients.value = []
      totalClients.value = 0
      totalPages.value = 1
      currentPage.value = 1
    } finally {
      loading.value = false
    }
  }

  // Métodos específicos de clientes
  const createClient = async (data: CreateClientData) => {
    try {
      saving.value = true
      console.log('📡 createClient - Llamando a POST /clients')
      console.log('📡 createClient - Datos enviados:', data)
      const response = await api.post('/clients', data)
      
      if (response.data.success) {
        const newClient = response.data.data
        clients.value.unshift(newClient)
        totalClients.value++
        await loadStats() // Recargar estadísticas
        toast.show('Cliente creado exitosamente', 'success')
        return newClient
      }
    } catch (error: any) {
      console.error('❌ createClient - Error completo:', error)
      console.error('❌ createClient - Response data:', error.response?.data)
      console.error('❌ createClient - Status:', error.response?.status)
      toast.show('Error al crear cliente', 'error')
      throw error
    } finally {
      saving.value = false
    }
  }
  
  const updateClient = async (id: string, data: UpdateClientData) => {
    try {
      saving.value = true
      console.log('📡 updateClient - Llamando a PUT /clients/' + id)
      console.log('📡 updateClient - Datos enviados:', data)
      const response = await api.put(`/clients/${id}`, data)
      
      if (response.data.success) {
        const updatedClient = response.data.data
        const index = clients.value.findIndex(client => client.id === id)
        if (index !== -1) {
          clients.value[index] = updatedClient
        }
        await loadStats() // Recargar estadísticas
        toast.show('Cliente actualizado exitosamente', 'success')
        return updatedClient
      }
    } catch (error: any) {
      console.error('❌ updateClient - Error completo:', error)
      console.error('❌ updateClient - Response data:', error.response?.data)
      console.error('❌ updateClient - Status:', error.response?.status)
      toast.show('Error al actualizar cliente', 'error')
      throw error
    } finally {
      saving.value = false
    }
  }
  
  const deleteClient = async (id: string) => {
    try {
      deleting.value = true
      const response = await api.delete(`/clients/${id}`)
      
      if (response.data.success) {
        // Remove from local state
        const index = clients.value.findIndex(client => client.id === id)
        if (index !== -1) {
          clients.value.splice(index, 1)
          totalClients.value--
        }
        await loadStats() // Recargar estadísticas
        toast.show('Cliente eliminado exitosamente', 'success')
        return true
      }
    } catch (error) {
      toast.show('Error al eliminar cliente', 'error')
      throw error
    } finally {
      deleting.value = false
    }
  }

  // Métodos de filtrado y búsqueda
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setFilter = (key: string, value: any) => {
    if (key === 'isActive') {
      filterStatus.value = value ? 'active' : 'inactive'
    }
  }

  const clearFilters = () => {
    searchQuery.value = ''
    filterStatus.value = 'all'
  }
  
  const activateClient = async (id: string) => {
    try {
      const response = await api.put(`/clients/${id}`, { isActive: true })
      if (response.data.success) {
        const updatedClient = response.data.data
        const index = clients.value.findIndex(client => client.id === id)
        if (index !== -1) {
          clients.value[index] = updatedClient
        }
        toast.show('Cliente activado exitosamente', 'success')
        return updatedClient
      }
    } catch (error) {
      toast.show('Error al activar cliente', 'error')
      throw error
    }
  }
  
  const deactivateClient = async (id: string) => {
    try {
      const response = await api.put(`/clients/${id}`, { isActive: false })
      if (response.data.success) {
        const updatedClient = response.data.data
        const index = clients.value.findIndex(client => client.id === id)
        if (index !== -1) {
          clients.value[index] = updatedClient
        }
        toast.show('Cliente desactivado exitosamente', 'success')
        return updatedClient
      }
    } catch (error) {
      toast.show('Error al desactivar cliente', 'error')
      throw error
    }
  }
  
  // Inicializar store
  const init = async () => {
    await fetchAll()
    await loadStats()
  }
  
  return {
    // Estado
    clients,
    loading,
    saving,
    deleting,
    currentPage,
    totalPages,
    totalClients,
    searchQuery,
    filterStatus,
    stats,
    
    // Getters
    allItems,
    filteredItems,
    activeClients,
    inactiveClients,
    
    // Métodos
    fetchAll,
    createClient,
    updateClient,
    deleteClient,
    activateClient,
    deactivateClient,
    
    // Métodos de filtrado y búsqueda
    setSearchQuery,
    setFilter,
    clearFilters,
    
    // Inicialización
    init
  }
}) 