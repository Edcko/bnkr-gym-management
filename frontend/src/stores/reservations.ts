import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/utils/api'
import { useToast } from './toast'

export interface Reservation {
  id: string
  userId: string
  classId: string
  instructorId: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  notes?: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    email: string
  }
  class?: {
    id: string
    name: string
    description?: string
    duration: number
    price: number
  }
  instructor?: {
    id: string
    name: string
    email: string
  }
}

export interface CreateReservationData {
  classId: string
  instructorId: string
  startTime: string
  endTime: string
  notes?: string
}

export interface UpdateReservationData {
  startTime?: string
  endTime?: string
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  notes?: string
}

export interface ReservationStats {
  total: number
  pending: number
  confirmed: number
  cancelled: number
  today: number
  thisWeek: number
  thisMonth: number
}

export interface AvailabilityCheck {
  available: boolean
  currentReservations: number
  maxCapacity: number
}

export const useReservationsStore = defineStore('reservations', () => {
  const reservations = ref<Reservation[]>([])
  const currentReservation = ref<Reservation | null>(null)
  const loading = ref(false)
  const totalReservations = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(1)
  const searchQuery = ref('')
  const filterStatus = ref<'all' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'>('all')
  const filterDate = ref<string>('')

  const toast = useToast()

  // Getters
  const filteredReservations = computed(() => {
    let filtered = reservations.value

    // Filtrar por búsqueda
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(reservation =>
        reservation.user?.name.toLowerCase().includes(query) ||
        reservation.class?.name.toLowerCase().includes(query) ||
        reservation.instructor?.name.toLowerCase().includes(query)
      )
    }

    // Filtrar por estado
    if (filterStatus.value !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === filterStatus.value)
    }

    // Filtrar por fecha
    if (filterDate.value) {
      const filterDateObj = new Date(filterDate.value)
      filtered = filtered.filter(reservation => {
        const reservationDate = new Date(reservation.startTime)
        return reservationDate.toDateString() === filterDateObj.toDateString()
      })
    }

    return filtered
  })

  const pendingReservations = computed(() => 
    reservations.value.filter(reservation => reservation.status === 'PENDING')
  )

  const confirmedReservations = computed(() => 
    reservations.value.filter(reservation => reservation.status === 'CONFIRMED')
  )

  const cancelledReservations = computed(() => 
    reservations.value.filter(reservation => reservation.status === 'CANCELLED')
  )

  const upcomingReservations = computed(() => 
    reservations.value.filter(reservation => 
      reservation.status === 'CONFIRMED' && 
      new Date(reservation.startTime) > new Date()
    )
  )

  const pastReservations = computed(() => 
    reservations.value.filter(reservation => 
      new Date(reservation.endTime) < new Date()
    )
  )

  // Actions
  const fetchReservations = async (page: number = 1, limit: number = 10) => {
    try {
      loading.value = true
      const response = await api.get(`/reservations?page=${page}&limit=${limit}`)
      
      if (response.data.success) {
        reservations.value = response.data.data.reservations
        totalReservations.value = response.data.data.total
        totalPages.value = response.data.data.totalPages
        currentPage.value = page
      }
    } catch (error) {
      console.error('Error fetching reservations:', error)
      toast.show('Error al cargar las reservas', 'error')
    } finally {
      loading.value = false
    }
  }

  const fetchAll = async () => {
    try {
      loading.value = true
      console.log('🔄 Fetching all reservations...')
      const response = await api.get('/reservations')
      
      if (response.data.success) {
        reservations.value = response.data.data.reservations || []
        totalReservations.value = response.data.data.total || 0
        console.log('✅ Reservations loaded:', reservations.value.length)
      } else {
        console.error('❌ Error loading reservations:', response.data.message)
      }
    } catch (error) {
      console.error('❌ Error fetching all reservations:', error)
      toast.show('Error al cargar las reservas', 'error')
    } finally {
      loading.value = false
    }
  }

  const fetchUserReservations = async (status?: string) => {
    try {
      loading.value = true
      const url = status ? `/reservations/user?status=${status}` : '/reservations/user'
      const response = await api.get(url)
      
      if (response.data.success) {
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching user reservations:', error)
      toast.show('Error al cargar las reservas del usuario', 'error')
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchUpcomingReservations = async () => {
    try {
      loading.value = true
      const response = await api.get('/reservations/user/upcoming')
      
      if (response.data.success) {
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching upcoming reservations:', error)
      toast.show('Error al cargar las próximas reservas', 'error')
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchPastReservations = async () => {
    try {
      loading.value = true
      const response = await api.get('/reservations/user/past')
      
      if (response.data.success) {
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching past reservations:', error)
      toast.show('Error al cargar el historial de reservas', 'error')
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchReservationById = async (id: string) => {
    try {
      loading.value = true
      const response = await api.get(`/reservations/${id}`)
      
      if (response.data.success) {
        currentReservation.value = response.data.data
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching reservation:', error)
      toast.show('Error al cargar la reserva', 'error')
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchClassReservations = async (classId: string, date?: string) => {
    try {
      loading.value = true
      const url = date ? `/reservations/class/${classId}?date=${date}` : `/reservations/class/${classId}`
      const response = await api.get(url)
      
      if (response.data.success) {
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching class reservations:', error)
      toast.show('Error al cargar las reservas de la clase', 'error')
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchInstructorReservations = async (instructorId: string, date?: string) => {
    try {
      loading.value = true
      const url = date ? `/reservations/instructor/${instructorId}?date=${date}` : `/reservations/instructor/${instructorId}`
      const response = await api.get(url)
      
      if (response.data.success) {
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching instructor reservations:', error)
      toast.show('Error al cargar las reservas del instructor', 'error')
      return []
    } finally {
      loading.value = false
    }
  }

  const createReservation = async (reservationData: CreateReservationData) => {
    try {
      loading.value = true
      const response = await api.post('/reservations', reservationData)
      
      if (response.data.success) {
        const newReservation = response.data.data
        reservations.value.unshift(newReservation)
        totalReservations.value++
        toast.show('Reserva creada exitosamente', 'success')
        return newReservation
      }
    } catch (error: any) {
      console.error('Error creating reservation:', error)
      const errorMessage = error.response?.data?.message || 'Error al crear la reserva'
      toast.show(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateReservation = async (id: string, reservationData: UpdateReservationData) => {
    try {
      loading.value = true
      const response = await api.put(`/reservations/${id}`, reservationData)
      
      if (response.data.success) {
        const updatedReservation = response.data.data
        const index = reservations.value.findIndex(reservation => reservation.id === id)
        if (index !== -1) {
          reservations.value[index] = updatedReservation
        }
        if (currentReservation.value?.id === id) {
          currentReservation.value = updatedReservation
        }
        toast.show('Reserva actualizada exitosamente', 'success')
        return updatedReservation
      }
    } catch (error: any) {
      console.error('Error updating reservation:', error)
      const errorMessage = error.response?.data?.message || 'Error al actualizar la reserva'
      toast.show(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const confirmReservation = async (id: string) => {
    try {
      loading.value = true
      const response = await api.put(`/reservations/${id}/confirm`)
      
      if (response.data.success) {
        const confirmedReservation = response.data.data
        const index = reservations.value.findIndex(reservation => reservation.id === id)
        if (index !== -1) {
          reservations.value[index] = confirmedReservation
        }
        if (currentReservation.value?.id === id) {
          currentReservation.value = confirmedReservation
        }
        toast.show('Reserva confirmada exitosamente', 'success')
        return confirmedReservation
      }
    } catch (error: any) {
      console.error('Error confirming reservation:', error)
      const errorMessage = error.response?.data?.message || 'Error al confirmar la reserva'
      toast.show(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const cancelReservation = async (id: string) => {
    try {
      loading.value = true
      const response = await api.put(`/reservations/${id}/cancel`)
      
      if (response.data.success) {
        const cancelledReservation = response.data.data
        const index = reservations.value.findIndex(reservation => reservation.id === id)
        if (index !== -1) {
          reservations.value[index] = cancelledReservation
        }
        if (currentReservation.value?.id === id) {
          currentReservation.value = cancelledReservation
        }
        toast.show('Reserva cancelada exitosamente', 'success')
        return cancelledReservation
      }
    } catch (error: any) {
      console.error('Error cancelling reservation:', error)
      const errorMessage = error.response?.data?.message || 'Error al cancelar la reserva'
      toast.show(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const getReservationStats = async (): Promise<ReservationStats | null> => {
    try {
      console.log('🔍 DEBUG: Calling api.get with path:', '/reservations/stats')
      console.log('🔍 DEBUG: api baseURL:', (api as any).defaults?.baseURL)
      
      // Verificar si hay token
      const token = localStorage.getItem('token')
      console.log('🔍 DEBUG: Token exists:', !!token)
      console.log('🔍 DEBUG: Token value:', token ? token.substring(0, 20) + '...' : 'No token')
      
      // Usar el patrón exitoso como en classes y users
      const response = await api.get('/reservations/stats')
      
      console.log('✅ DEBUG: Response received:', response.data)
      
      if (response.data.success) {
        return response.data.data
      }
    } catch (error: any) {
      console.error('❌ DEBUG: Error details:', {
        message: error.message,
        type: error.type,
        name: error.name
      })
      toast.show('Error al cargar las estadísticas', 'error')
    }
    return null
  }

  const checkAvailability = async (classId: string, startTime: string, endTime: string): Promise<AvailabilityCheck | null> => {
    try {
      const response = await api.get(`/reservations/availability/${classId}?startTime=${startTime}&endTime=${endTime}`)
      
      if (response.data.success) {
        return response.data.data
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      toast.show('Error al verificar disponibilidad', 'error')
    }
    return null
  }

  const searchReservations = async (query: string) => {
    searchQuery.value = query
  }

  const setFilterStatus = (status: 'all' | 'PENDING' | 'CONFIRMED' | 'CANCELLED') => {
    filterStatus.value = status
  }

  const setFilterDate = (date: string) => {
    filterDate.value = date
  }

  const clearFilters = () => {
    searchQuery.value = ''
    filterStatus.value = 'all'
    filterDate.value = ''
  }

  const getReservationStatusColor = (status: string) => {
    const colors = {
      PENDING: 'warning',
      CONFIRMED: 'success',
      CANCELLED: 'error'
    }
    return colors[status as keyof typeof colors] || 'grey'
  }

  const getReservationStatusText = (status: string) => {
    const texts = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      CANCELLED: 'Cancelada'
    }
    return texts[status as keyof typeof texts] || status
  }

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('es-ES')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return {
    // State
    reservations,
    currentReservation,
    loading,
    totalReservations,
    totalPages,
    currentPage,
    searchQuery,
    filterStatus,
    filterDate,

    // Getters
    filteredReservations,
    pendingReservations,
    confirmedReservations,
    cancelledReservations,
    upcomingReservations,
    pastReservations,

    // Actions
    fetchAll,
    fetchReservations,
    fetchUserReservations,
    fetchUpcomingReservations,
    fetchPastReservations,
    fetchReservationById,
    fetchClassReservations,
    fetchInstructorReservations,
    createReservation,
    updateReservation,
    confirmReservation,
    cancelReservation,
    getReservationStats,
    checkAvailability,
    searchReservations,
    setFilterStatus,
    setFilterDate,
    clearFilters,
    getReservationStatusColor,
    getReservationStatusText,
    formatDateTime,
    formatDate,
    formatTime
  }
}) 