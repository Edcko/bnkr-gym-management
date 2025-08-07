import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/utils/api'
import { useToast } from './toast'

export interface Payment {
  id: string
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  paymentMethod: 'STRIPE' | 'PAYPAL' | 'CASH'
  description?: string
  membershipId?: string
  reservationId?: string
  userId: string
  stripePaymentIntentId?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentData {
  amount: number
  currency: string
  paymentMethod: 'STRIPE' | 'PAYPAL' | 'CASH'
  description?: string
  membershipId?: string
  reservationId?: string
}

export interface StripePaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  client_secret: string
}

export interface PaymentStats {
  total: number
  completed: number
  pending: number
  failed: number
  refunded: number
  totalAmount: number
  thisMonth: number
  lastMonth: number
}

export const usePaymentsStore = defineStore('payments', () => {
  const payments = ref<Payment[]>([])
  const currentPayment = ref<Payment | null>(null)
  const loading = ref(false)
  const totalPayments = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(1)
  const searchQuery = ref('')
  const filterStatus = ref<'all' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'>('all')
  const filterMethod = ref<'all' | 'STRIPE' | 'PAYPAL' | 'CASH'>('all')

  const toast = useToast()

  // Getters
  const filteredPayments = computed(() => {
    let filtered = payments.value

    // Filtrar por búsqueda
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(payment =>
        payment.description?.toLowerCase().includes(query) ||
        payment.id.toLowerCase().includes(query)
      )
    }

    // Filtrar por estado
    if (filterStatus.value !== 'all') {
      filtered = filtered.filter(payment => payment.status === filterStatus.value)
    }

    // Filtrar por método de pago
    if (filterMethod.value !== 'all') {
      filtered = filtered.filter(payment => payment.paymentMethod === filterMethod.value)
    }

    return filtered
  })

  const completedPayments = computed(() => 
    payments.value.filter(payment => payment.status === 'COMPLETED')
  )

  const pendingPayments = computed(() => 
    payments.value.filter(payment => payment.status === 'PENDING')
  )

  const failedPayments = computed(() => 
    payments.value.filter(payment => payment.status === 'FAILED')
  )

  const refundedPayments = computed(() => 
    payments.value.filter(payment => payment.status === 'REFUNDED')
  )

  // Actions
  const fetchPayments = async (page: number = 1, limit: number = 10) => {
    try {
      loading.value = true
      const response = await api.get(`/payments?page=${page}&limit=${limit}`)
      
      if (response.data.success) {
        payments.value = response.data.data.payments
        totalPayments.value = response.data.data.total
        totalPages.value = response.data.data.totalPages
        currentPage.value = page
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.show('Error al cargar los pagos', 'error')
    } finally {
      loading.value = false
    }
  }

  const fetchUserPayments = async () => {
    try {
      loading.value = true
      const response = await api.get('/payments/user')
      
      if (response.data.success) {
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching user payments:', error)
      toast.show('Error al cargar los pagos del usuario', 'error')
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchPaymentById = async (id: string) => {
    try {
      loading.value = true
      const response = await api.get(`/payments/${id}`)
      
      if (response.data.success) {
        currentPayment.value = response.data.data
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching payment:', error)
      toast.show('Error al cargar el pago', 'error')
      return null
    } finally {
      loading.value = false
    }
  }

  const createPayment = async (paymentData: CreatePaymentData) => {
    try {
      loading.value = true
      const response = await api.post('/payments', paymentData)
      
      if (response.data.success) {
        const newPayment = response.data.data
        payments.value.unshift(newPayment)
        totalPayments.value++
        toast.show('Pago creado exitosamente', 'success')
        return newPayment
      }
    } catch (error: any) {
      console.error('Error creating payment:', error)
      const errorMessage = error.response?.data?.message || 'Error al crear el pago'
      toast.show(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const createStripePaymentIntent = async (amount: number, currency: string = 'usd', description?: string) => {
    try {
      loading.value = true
      const response = await api.post('/payments/stripe/create-intent', {
        amount,
        currency,
        description
      })
      
      if (response.data.success) {
        return response.data.data as StripePaymentIntent
      }
    } catch (error: any) {
      console.error('Error creating Stripe payment intent:', error)
      const errorMessage = error.response?.data?.message || 'Error al crear el intent de pago'
      toast.show(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const confirmStripePayment = async (paymentIntentId: string) => {
    try {
      loading.value = true
      const response = await api.post('/payments/stripe/confirm', {
        paymentIntentId
      })
      
      if (response.data.success) {
        const confirmedPayment = response.data.data
        const index = payments.value.findIndex(payment => payment.id === confirmedPayment.id)
        if (index !== -1) {
          payments.value[index] = confirmedPayment
        }
        if (currentPayment.value?.id === confirmedPayment.id) {
          currentPayment.value = confirmedPayment
        }
        toast.show('Pago confirmado exitosamente', 'success')
        return confirmedPayment
      }
    } catch (error: any) {
      console.error('Error confirming Stripe payment:', error)
      const errorMessage = error.response?.data?.message || 'Error al confirmar el pago'
      toast.show(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const refundPayment = async (id: string, amount?: number) => {
    try {
      loading.value = true
      const response = await api.post(`/payments/${id}/refund`, { amount })
      
      if (response.data.success) {
        const refundedPayment = response.data.data
        const index = payments.value.findIndex(payment => payment.id === id)
        if (index !== -1) {
          payments.value[index] = refundedPayment
        }
        if (currentPayment.value?.id === id) {
          currentPayment.value = refundedPayment
        }
        toast.show('Pago reembolsado exitosamente', 'success')
        return refundedPayment
      }
    } catch (error: any) {
      console.error('Error refunding payment:', error)
      const errorMessage = error.response?.data?.message || 'Error al reembolsar el pago'
      toast.show(errorMessage, 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const getPaymentStats = async (): Promise<PaymentStats | null> => {
    try {
      const response = await api.get('/payments/stats')
      
      if (response.data.success) {
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error)
      toast.show('Error al cargar las estadísticas de pagos', 'error')
    }
    return null
  }

  const searchPayments = async (query: string) => {
    searchQuery.value = query
  }

  const setFilterStatus = (status: 'all' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED') => {
    filterStatus.value = status
  }

  const setFilterMethod = (method: 'all' | 'STRIPE' | 'PAYPAL' | 'CASH') => {
    filterMethod.value = method
  }

  const clearFilters = () => {
    searchQuery.value = ''
    filterStatus.value = 'all'
    filterMethod.value = 'all'
  }

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      PENDING: 'warning',
      COMPLETED: 'success',
      FAILED: 'error',
      REFUNDED: 'info'
    }
    return colors[status as keyof typeof colors] || 'grey'
  }

  const getPaymentStatusText = (status: string) => {
    const texts = {
      PENDING: 'Pendiente',
      COMPLETED: 'Completado',
      FAILED: 'Fallido',
      REFUNDED: 'Reembolsado'
    }
    return texts[status as keyof typeof texts] || status
  }

  const getPaymentMethodText = (method: string) => {
    const texts = {
      STRIPE: 'Tarjeta',
      PAYPAL: 'PayPal',
      CASH: 'Efectivo'
    }
    return texts[method as keyof typeof texts] || method
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100) // Stripe amounts are in cents
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  return {
    // State
    payments,
    currentPayment,
    loading,
    totalPayments,
    totalPages,
    currentPage,
    searchQuery,
    filterStatus,
    filterMethod,

    // Getters
    filteredPayments,
    completedPayments,
    pendingPayments,
    failedPayments,
    refundedPayments,

    // Actions
    fetchPayments,
    fetchUserPayments,
    fetchPaymentById,
    createPayment,
    createStripePaymentIntent,
    confirmStripePayment,
    refundPayment,
    getPaymentStats,
    searchPayments,
    setFilterStatus,
    setFilterMethod,
    clearFilters,
    getPaymentStatusColor,
    getPaymentStatusText,
    getPaymentMethodText,
    formatCurrency,
    formatDate
  }
}) 