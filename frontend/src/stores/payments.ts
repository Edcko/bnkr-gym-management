import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BaseStore } from './baseStore'
import type { BaseEntity } from './baseStore'
import { useToast } from './toast'
import { api } from '@/utils/api'

// Interfaces específicas para pagos
export interface Payment extends BaseEntity {
  membershipId?: string
  userId: string
  amount: number
  method: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  stripePaymentId?: string
  description?: string
  user?: {
    id: string
    name: string
    email: string
  }
  membership?: {
    id: string
    type: string
    price: number
  }
}

export interface CreatePaymentData {
  membershipId: string
  userId: string
  amount: number
  method: string
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  stripePaymentId?: string
  description?: string
}

export interface UpdatePaymentData extends Partial<CreatePaymentData> {}

export const usePaymentsStore = defineStore('payments', () => {
  const toast = useToast()
  
  // Estado local del store
  const items = ref<Payment[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  
  // Estado específico de pagos
  const stats = ref({
    totalPayments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
    failedPayments: 0,
    successRate: 0
  })
  
  // Cargar pagos desde el backend
  const fetchPayments = async () => {
    try {
      loading.value = true
      console.log('📡 Llamando a /payments...')
      
      const response = await api.get('/payments')
      console.log('📡 Respuesta recibida:', response.data)
      
      if (response.data.success) {
        // La respuesta tiene la estructura: { data: [...], pagination: {...} }
        items.value = response.data.data || []
        console.log('✅ Pagos cargados:', items.value.length)
      }
    } catch (error) {
      console.error('❌ Error cargando pagos:', error)
      toast.show('Error al cargar pagos', 'error')
    } finally {
      loading.value = false
    }
  }
  
  // Cargar estadísticas de pagos
  const loadStats = async () => {
    try {
      console.log('📊 Llamando a /payments/stats...')
      const response = await api.get('/payments/stats')
      console.log('📊 Respuesta de stats:', response.data)
      
      if (response.data.success) {
        stats.value = response.data.data
        console.log('✅ Stats actualizados:', stats.value)
      }
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error)
      toast.show('Error al cargar estadísticas de pagos', 'error')
    }
  }
  
  // Métodos específicos de pagos
  const createPayment = async (data: CreatePaymentData) => {
    try {
      saving.value = true
      const response = await api.post('/payments', data)
      
      if (response.data.success) {
        const newPayment = response.data.data
        items.value.unshift(newPayment)
        await loadStats() // Recargar estadísticas
        toast.show('Pago creado exitosamente', 'success')
        return newPayment
      }
    } catch (error) {
      toast.show('Error al crear pago', 'error')
      throw error
    } finally {
      saving.value = false
    }
  }
  
  const updatePayment = async (id: string, data: UpdatePaymentData) => {
    try {
      saving.value = true
      const response = await api.put(`/payments/${id}`, data)
      
      if (response.data.success) {
        const updatedPayment = response.data.data
        const index = items.value.findIndex(payment => payment.id === id)
        if (index !== -1) {
          items.value[index] = updatedPayment
        }
        await loadStats() // Recargar estadísticas
        toast.show('Pago actualizado exitosamente', 'success')
        return updatedPayment
      }
    } catch (error) {
      toast.show('Error al actualizar pago', 'error')
      throw error
    } finally {
      saving.value = false
    }
  }
  
  const deletePayment = async (id: string) => {
    try {
      deleting.value = true
      const response = await api.delete(`/payments/${id}`)
      
      if (response.data.success) {
        items.value = items.value.filter(payment => payment.id !== id)
        await loadStats() // Recargar estadísticas
        toast.show('Pago eliminado exitosamente', 'success')
        return true
      }
    } catch (error) {
      toast.show('Error al eliminar pago', 'error')
      throw error
    } finally {
      deleting.value = false
    }
  }
  
  const confirmPayment = async (id: string) => {
    try {
      const result = await updatePayment(id, { status: 'COMPLETED' })
      if (result) {
        toast.show('Pago confirmado exitosamente', 'success')
      }
      return result
    } catch (error) {
      toast.show('Error al confirmar pago', 'error')
      throw error
    }
  }
  
  const failPayment = async (id: string) => {
    try {
      const result = await updatePayment(id, { status: 'FAILED' })
      if (result) {
        toast.show('Pago marcado como fallido', 'success')
      }
      return result
    } catch (error) {
      toast.show('Error al marcar pago como fallido', 'error')
      throw error
    }
  }
  
  const refundPayment = async (id: string) => {
    try {
      const result = await updatePayment(id, { status: 'REFUNDED' })
      if (result) {
        toast.show('Pago reembolsado exitosamente', 'success')
      }
      return result
    } catch (error) {
      toast.show('Error al reembolsar pago', 'error')
      throw error
    }
  }
  
  // Override de métodos del BaseStore para lógica específica
  const searchInItem = (item: Payment, query: string): boolean => {
    const searchQuery = query.toLowerCase()
    return (
      (item.user?.name.toLowerCase().includes(searchQuery) || false) ||
      (item.user?.email.toLowerCase().includes(searchQuery) || false) ||
      item.status.toLowerCase().includes(searchQuery) ||
      (item.description?.toLowerCase().includes(searchQuery) || false) ||
      item.amount.toString().includes(searchQuery)
    )
  }
  
  const applyFilter = (item: Payment, filters: any): boolean => {
    // Filtro por estado
    if (filters.status && filters.status !== 'all' && item.status !== filters.status) {
      return false
    }
    
    // Filtro por método de pago
    if (filters.method && filters.method !== 'all') {
      // Aquí podrías agregar lógica para filtrar por método de pago
    }
    
    return true
  }
  
  // Computed getters específicos de pagos
  const pendingPayments = computed(() =>
    items.value.filter(item => item.status === 'PENDING')
  )
  
  const completedPayments = computed(() =>
    items.value.filter(item => item.status === 'COMPLETED')
  )
  
  const failedPayments = computed(() =>
    items.value.filter(item => item.status === 'FAILED')
  )
  
  const refundedPayments = computed(() =>
    items.value.filter(item => item.status === 'REFUNDED')
  )
  
  const totalRevenue = computed(() =>
    items.value
      .filter(item => item.status === 'COMPLETED')
      .reduce((sum, item) => sum + item.amount, 0)
  )
  
  const statuses = computed(() => {
    const uniqueStatuses = new Set(items.value.map(item => item.status))
    return Array.from(uniqueStatuses).sort()
  })
  
  // Inicializar store
  const init = async () => {
    console.log('🚀 Iniciando store de pagos...')
    try {
      await fetchPayments()
      await loadStats()
    } catch (error) {
      console.error('❌ Error en init:', error)
      throw error
    }
  }
  
  return {
    // Estado
    items,
    loading,
    saving,
    deleting,
    stats,
    
    // Métodos
    fetchPayments,
    loadStats,
    create: createPayment,
    update: updatePayment,
    delete: deletePayment,
    
    // Métodos específicos de pagos
    confirmPayment,
    failPayment,
    refundPayment,
    
    // Computed getters
    pendingPayments,
    completedPayments,
    failedPayments,
    refundedPayments,
    totalRevenue,
    statuses,
    
    // Inicialización
    init
  }
}) 