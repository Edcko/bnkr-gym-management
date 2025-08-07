import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/utils/api'
import { useToast } from './toast'

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  isActive: boolean
  role: 'CLIENT'
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
}

export interface UpdateClientData {
  name?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  isActive?: boolean
}

export const useClientsStore = defineStore('clients', () => {
  const clients = ref<Client[]>([])
  const currentClient = ref<Client | null>(null)
  const loading = ref(false)
  const totalClients = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(1)
  const searchQuery = ref('')
  const filterStatus = ref<'all' | 'active' | 'inactive'>('all')

  const toast = useToast()

  // Getters
  const filteredClients = computed(() => {
    let filtered = clients.value

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

  const activeClients = computed(() => 
    clients.value.filter(client => client.isActive)
  )

  const inactiveClients = computed(() => 
    clients.value.filter(client => !client.isActive)
  )

  // Actions
            const fetchClients = async (page: number = 1, limit: number = 10) => {
            try {
              loading.value = true
              const response = await api.get(`/users/role/CLIENT?page=${page}&limit=${limit}`)
              
              if (response.data.success) {
                clients.value = response.data.data.users
                totalClients.value = response.data.data.total
                totalPages.value = response.data.data.totalPages
                currentPage.value = page
              }
            } catch (error) {
              console.error('Error fetching clients:', error)
              toast.show('Error al cargar los clientes', 'error')
            } finally {
              loading.value = false
            }
          }

  const fetchClientById = async (id: string) => {
    try {
      loading.value = true
      const response = await api.get(`/users/${id}`)
      
      if (response.data.success) {
        currentClient.value = response.data.data
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching client:', error)
                    toast.show('Error al cargar el cliente', 'error')
      return null
    } finally {
      loading.value = false
    }
  }

            const createClient = async (clientData: CreateClientData) => {
            try {
              loading.value = true
              const response = await api.post('/users', {
                ...clientData,
                role: 'CLIENT'
              })
              
              if (response.data.success) {
                const newClient = response.data.data
                clients.value.unshift(newClient)
                totalClients.value++
                toast.show('Cliente creado exitosamente', 'success')
                return newClient
              }
            } catch (error: any) {
              console.error('Error creating client:', error)
              const errorMessage = error.response?.data?.message || 'Error al crear el cliente'
              toast.show(errorMessage, 'error')
              throw error
            } finally {
              loading.value = false
            }
          }

  const updateClient = async (id: string, clientData: UpdateClientData) => {
    try {
      loading.value = true
      const response = await api.put(`/users/${id}`, clientData)
      
      if (response.data.success) {
        const updatedClient = response.data.data
        const index = clients.value.findIndex(client => client.id === id)
        if (index !== -1) {
          clients.value[index] = updatedClient
        }
        if (currentClient.value?.id === id) {
          currentClient.value = updatedClient
        }
                        toast.show('Cliente actualizado exitosamente', 'success')
        return updatedClient
      }
    } catch (error: any) {
      console.error('Error updating client:', error)
                    const errorMessage = error.response?.data?.message || 'Error al actualizar el cliente'
              toast.show(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteClient = async (id: string) => {
    try {
      loading.value = true
      const response = await api.delete(`/users/${id}`)
      
      if (response.data.success) {
        clients.value = clients.value.filter(client => client.id !== id)
        totalClients.value--
        if (currentClient.value?.id === id) {
          currentClient.value = null
        }
                        toast.show('Cliente eliminado exitosamente', 'success')
        return true
      }
    } catch (error: any) {
      console.error('Error deleting client:', error)
                    const errorMessage = error.response?.data?.message || 'Error al eliminar el cliente'
              toast.show(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const toggleClientStatus = async (id: string) => {
    try {
      const client = clients.value.find(c => c.id === id)
      if (!client) return

      const response = await api.put(`/users/${id}`, {
        isActive: !client.isActive
      })
      
      if (response.data.success) {
        const updatedClient = response.data.data
        const index = clients.value.findIndex(c => c.id === id)
        if (index !== -1) {
          clients.value[index] = updatedClient
        }
        if (currentClient.value?.id === id) {
          currentClient.value = updatedClient
        }
                        toast.show(
                  `Cliente ${updatedClient.isActive ? 'activado' : 'desactivado'} exitosamente`,
                  'success'
                )
        return updatedClient
      }
    } catch (error: any) {
      console.error('Error toggling client status:', error)
                    const errorMessage = error.response?.data?.message || 'Error al cambiar el estado del cliente'
              toast.show(errorMessage, 'error')
      throw error
    }
  }

  const searchClients = async (query: string) => {
    searchQuery.value = query
    // La búsqueda se hace localmente con el computed filteredClients
  }

  const setFilterStatus = (status: 'all' | 'active' | 'inactive') => {
    filterStatus.value = status
  }

  const clearFilters = () => {
    searchQuery.value = ''
    filterStatus.value = 'all'
  }

  const getClientStats = () => {
    return {
      total: clients.value.length,
      active: activeClients.value.length,
      inactive: inactiveClients.value.length
    }
  }

  return {
    // State
    clients,
    currentClient,
    loading,
    totalClients,
    totalPages,
    currentPage,
    searchQuery,
    filterStatus,

    // Getters
    filteredClients,
    activeClients,
    inactiveClients,

    // Actions
    fetchClients,
    fetchClientById,
    createClient,
    updateClient,
    deleteClient,
    toggleClientStatus,
    searchClients,
    setFilterStatus,
    clearFilters,
    getClientStats
  }
}) 