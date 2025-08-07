import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/utils/api'
import { useToast } from './toast'

export interface Membership {
  id: string
  userId: string
  type: 'BASIC' | 'PREMIUM' | 'UNLIMITED'
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  price: number
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    email: string
  }
  payments?: Payment[]
}

export interface Payment {
  id: string
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  description?: string
  createdAt: string
}

export interface CreateMembershipData {
  userId: string
  type: 'BASIC' | 'PREMIUM' | 'UNLIMITED'
  startDate: string
  endDate: string
  price: number
}

export interface UpdateMembershipData {
  type?: 'BASIC' | 'PREMIUM' | 'UNLIMITED'
  startDate?: string
  endDate?: string
  status?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  price?: number
}

export interface MembershipPlan {
  id: string
  name: string
  price: number
  description: string
  features: string[]
}

export const useMembershipsStore = defineStore('memberships', () => {
  const memberships = ref<Membership[]>([])
  const currentMembership = ref<Membership | null>(null)
  const availablePlans = ref<MembershipPlan[]>([])
  const loading = ref(false)
  const totalMemberships = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(1)
  const searchQuery = ref('')
  const filterType = ref<'all' | 'BASIC' | 'PREMIUM' | 'UNLIMITED'>('all')
  const filterStatus = ref<'all' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'>('all')

  const toast = useToast()

  // Getters
  const filteredMemberships = computed(() => {
    let filtered = memberships.value

    // Filtrar por búsqueda
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(membership =>
        membership.user?.name.toLowerCase().includes(query) ||
        membership.user?.email.toLowerCase().includes(query) ||
        membership.type.toLowerCase().includes(query)
      )
    }

    // Filtrar por tipo
    if (filterType.value !== 'all') {
      filtered = filtered.filter(membership => membership.type === filterType.value)
    }

    // Filtrar por estado
    if (filterStatus.value !== 'all') {
      filtered = filtered.filter(membership => membership.status === filterStatus.value)
    }

    return filtered
  })

  const activeMemberships = computed(() => 
    memberships.value.filter(membership => membership.status === 'ACTIVE')
  )

  const expiredMemberships = computed(() => 
    memberships.value.filter(membership => membership.status === 'EXPIRED')
  )

  const cancelledMemberships = computed(() => 
    memberships.value.filter(membership => membership.status === 'CANCELLED')
  )

  const basicMemberships = computed(() => 
    memberships.value.filter(membership => membership.type === 'BASIC')
  )

  const premiumMemberships = computed(() => 
    memberships.value.filter(membership => membership.type === 'PREMIUM')
  )

  const unlimitedMemberships = computed(() => 
    memberships.value.filter(membership => membership.type === 'UNLIMITED')
  )

  // Actions
  const fetchMemberships = async (page: number = 1, limit: number = 10) => {
    try {
      loading.value = true
      const response = await api.get(`/memberships?page=${page}&limit=${limit}`)
      
      if (response.data.success) {
        memberships.value = response.data.data.memberships
        totalMemberships.value = response.data.data.total
        totalPages.value = response.data.data.totalPages
        currentPage.value = page
      }
    } catch (error) {
      console.error('Error fetching memberships:', error)
      toast.showToast('Error al cargar las membresías', 'error')
    } finally {
      loading.value = false
    }
  }

  const fetchMembershipById = async (id: string) => {
    try {
      loading.value = true
      const response = await api.get(`/memberships/${id}`)
      
      if (response.data.success) {
        currentMembership.value = response.data.data
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching membership:', error)
      toast.showToast('Error al cargar la membresía', 'error')
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchUserMemberships = async (userId: string) => {
    try {
      loading.value = true
      const response = await api.get(`/memberships/user`)
      
      if (response.data.success) {
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching user memberships:', error)
      toast.showToast('Error al cargar las membresías del usuario', 'error')
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchActiveMembership = async () => {
    try {
      loading.value = true
      const response = await api.get(`/memberships/active`)
      
      if (response.data.success) {
        currentMembership.value = response.data.data
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching active membership:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchAvailablePlans = async () => {
    try {
      loading.value = true
      const response = await api.get(`/memberships/plans`)
      
      if (response.data.success) {
        availablePlans.value = response.data.data
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching available plans:', error)
      toast.showToast('Error al cargar los planes disponibles', 'error')
    } finally {
      loading.value = false
    }
  }

  const createMembership = async (membershipData: CreateMembershipData) => {
    try {
      loading.value = true
      const response = await api.post('/memberships', membershipData)
      
      if (response.data.success) {
        const newMembership = response.data.data
        memberships.value.unshift(newMembership)
        totalMemberships.value++
        toast.showToast('Membresía creada exitosamente', 'success')
        return newMembership
      }
    } catch (error: any) {
      console.error('Error creating membership:', error)
      const errorMessage = error.response?.data?.message || 'Error al crear la membresía'
      toast.showToast(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateMembership = async (id: string, membershipData: UpdateMembershipData) => {
    try {
      loading.value = true
      const response = await api.put(`/memberships/${id}`, membershipData)
      
      if (response.data.success) {
        const updatedMembership = response.data.data
        const index = memberships.value.findIndex(membership => membership.id === id)
        if (index !== -1) {
          memberships.value[index] = updatedMembership
        }
        if (currentMembership.value?.id === id) {
          currentMembership.value = updatedMembership
        }
        toast.showToast('Membresía actualizada exitosamente', 'success')
        return updatedMembership
      }
    } catch (error: any) {
      console.error('Error updating membership:', error)
      const errorMessage = error.response?.data?.message || 'Error al actualizar la membresía'
      toast.showToast(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const renewMembership = async (id: string, months: number = 1) => {
    try {
      loading.value = true
      const response = await api.put(`/memberships/${id}/renew`, { months })
      
      if (response.data.success) {
        const renewedMembership = response.data.data
        const index = memberships.value.findIndex(membership => membership.id === id)
        if (index !== -1) {
          memberships.value[index] = renewedMembership
        }
        if (currentMembership.value?.id === id) {
          currentMembership.value = renewedMembership
        }
        toast.showToast('Membresía renovada exitosamente', 'success')
        return renewedMembership
      }
    } catch (error: any) {
      console.error('Error renewing membership:', error)
      const errorMessage = error.response?.data?.message || 'Error al renovar la membresía'
      toast.showToast(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const changeMembershipType = async (id: string, newType: 'BASIC' | 'PREMIUM' | 'UNLIMITED') => {
    try {
      loading.value = true
      const response = await api.put(`/memberships/${id}/change-type`, { newType })
      
      if (response.data.success) {
        const updatedMembership = response.data.data
        const index = memberships.value.findIndex(membership => membership.id === id)
        if (index !== -1) {
          memberships.value[index] = updatedMembership
        }
        if (currentMembership.value?.id === id) {
          currentMembership.value = updatedMembership
        }
        toast.showToast('Tipo de membresía cambiado exitosamente', 'success')
        return updatedMembership
      }
    } catch (error: any) {
      console.error('Error changing membership type:', error)
      const errorMessage = error.response?.data?.message || 'Error al cambiar el tipo de membresía'
      toast.showToast(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const cancelMembership = async (id: string) => {
    try {
      loading.value = true
      const response = await api.put(`/memberships/${id}/cancel`)
      
      if (response.data.success) {
        const cancelledMembership = response.data.data
        const index = memberships.value.findIndex(membership => membership.id === id)
        if (index !== -1) {
          memberships.value[index] = cancelledMembership
        }
        if (currentMembership.value?.id === id) {
          currentMembership.value = cancelledMembership
        }
        toast.showToast('Membresía cancelada exitosamente', 'success')
        return cancelledMembership
      }
    } catch (error: any) {
      console.error('Error cancelling membership:', error)
      const errorMessage = error.response?.data?.message || 'Error al cancelar la membresía'
      toast.showToast(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const freezeMembership = async (id: string, freezeUntil: string) => {
    try {
      loading.value = true
      const response = await api.put(`/memberships/${id}/freeze`, { freezeUntil })
      
      if (response.data.success) {
        const frozenMembership = response.data.data
        const index = memberships.value.findIndex(membership => membership.id === id)
        if (index !== -1) {
          memberships.value[index] = frozenMembership
        }
        if (currentMembership.value?.id === id) {
          currentMembership.value = frozenMembership
        }
        toast.showToast('Membresía congelada exitosamente', 'success')
        return frozenMembership
      }
    } catch (error: any) {
      console.error('Error freezing membership:', error)
      const errorMessage = error.response?.data?.message || 'Error al congelar la membresía'
      toast.showToast(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const getMembershipStats = async () => {
    try {
      const response = await api.get('/memberships/stats')
      
      if (response.data.success) {
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching membership stats:', error)
      toast.showToast('Error al cargar las estadísticas', 'error')
    }
  }

  const hasActiveMembership = async () => {
    try {
      const response = await api.get('/memberships/has-active')
      
      if (response.data.success) {
        return response.data.data.hasActive
      }
    } catch (error) {
      console.error('Error checking active membership:', error)
      return false
    }
  }

  const getRemainingDays = async () => {
    try {
      const response = await api.get('/memberships/remaining-days')
      
      if (response.data.success) {
        return response.data.data.remainingDays
      }
    } catch (error) {
      console.error('Error getting remaining days:', error)
      return 0
    }
  }

  const searchMemberships = async (query: string) => {
    searchQuery.value = query
  }

  const setFilterType = (type: 'all' | 'BASIC' | 'PREMIUM' | 'UNLIMITED') => {
    filterType.value = type
  }

  const setFilterStatus = (status: 'all' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED') => {
    filterStatus.value = status
  }

  const clearFilters = () => {
    searchQuery.value = ''
    filterType.value = 'all'
    filterStatus.value = 'all'
  }

  return {
    // State
    memberships,
    currentMembership,
    availablePlans,
    loading,
    totalMemberships,
    totalPages,
    currentPage,
    searchQuery,
    filterType,
    filterStatus,

    // Getters
    filteredMemberships,
    activeMemberships,
    expiredMemberships,
    cancelledMemberships,
    basicMemberships,
    premiumMemberships,
    unlimitedMemberships,

    // Actions
    fetchMemberships,
    fetchMembershipById,
    fetchUserMemberships,
    fetchActiveMembership,
    fetchAvailablePlans,
    createMembership,
    updateMembership,
    renewMembership,
    changeMembershipType,
    cancelMembership,
    freezeMembership,
    getMembershipStats,
    hasActiveMembership,
    getRemainingDays,
    searchMemberships,
    setFilterType,
    setFilterStatus,
    clearFilters
  }
}) 