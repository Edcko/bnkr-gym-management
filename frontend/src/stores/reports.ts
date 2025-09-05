import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from './toast'
import { api } from '@/utils/api'

// Interfaces
interface ReportPeriod {
  start: string
  end: string
}

interface UserStats {
  total: number
  active: number
  growth: number
}

interface ClassStats {
  total: number
  active: number
  instructors: number
  growth: number
}

interface ReservationStats {
  total: number
  pending: number
  confirmed: number
  cancelled: number
  today: number
  thisWeek: number
  thisMonth: number
}

interface MembershipStats {
  total: number
  active: number
  expired: number
  growth: number
}

interface RevenueStats {
  total: number
  monthly: number
  growth: number
}

interface OverviewReport {
  period: ReportPeriod
  users: UserStats
  classes: ClassStats
  reservations: ReservationStats
  memberships: MembershipStats
  revenue: RevenueStats
}

interface RevenueReport {
  period: ReportPeriod
  totalRevenue: number
  monthlyRevenue: number
  growth: number
  topProducts: Array<{ id: string; name: string; sales: number; revenue: number }>
  paymentMethods: Array<{ method: string; count: number; total: number }>
}

export const useReportsStore = defineStore('reports', () => {
  const toast = useToast()
  
  // Estado
  const overviewReport = ref<OverviewReport | null>(null)
  const revenueReport = ref<RevenueReport | null>(null)
  const membershipReport = ref<any>(null)
  const classReport = ref<any>(null)
  const userReport = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters
  const hasOverviewData = computed(() => !!overviewReport.value)
  const hasRevenueData = computed(() => !!revenueReport.value)
  
  // Actions
  const fetchOverviewReport = async (startDate?: string, endDate?: string) => {
    try {
      loading.value = true
      error.value = null
      
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const response = await api.get(`/reports/overview?${params.toString()}`)
      
      if (response.data.success) {
        overviewReport.value = response.data.data
        console.log('✅ Overview report loaded:', overviewReport.value)
      } else {
        throw new Error(response.data.message || 'Error al cargar reporte general')
      }
    } catch (err: any) {
      console.error('❌ Error fetching overview report:', err)
      const errorMessage = err.response?.data?.message || 'Error al cargar reporte general'
      error.value = errorMessage
      toast.show(errorMessage, 'error')
    } finally {
      loading.value = false
    }
  }
  
  const fetchRevenueReport = async (startDate?: string, endDate?: string) => {
    try {
      loading.value = true
      error.value = null
      
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const response = await api.get(`/reports/revenue?${params.toString()}`)
      
      if (response.data.success) {
        revenueReport.value = response.data.data
        console.log('✅ Revenue report loaded:', revenueReport.value)
      } else {
        throw new Error(response.data.message || 'Error al cargar reporte de ingresos')
      }
    } catch (err: any) {
      console.error('❌ Error fetching revenue report:', err)
      const errorMessage = err.response?.data?.message || 'Error al cargar reporte de ingresos'
      error.value = errorMessage
      toast.show(errorMessage, 'error')
    } finally {
      loading.value = false
    }
  }
  
  const fetchMembershipReport = async () => {
    try {
      const response = await api.get('/reports/memberships')
      
      if (response.data.success) {
        membershipReport.value = response.data.data
        console.log('✅ Membership report loaded:', membershipReport.value)
      }
    } catch (err: any) {
      console.error('❌ Error fetching membership report:', err)
    }
  }
  
  const fetchClassReport = async () => {
    try {
      const response = await api.get('/reports/classes')
      
      if (response.data.success) {
        classReport.value = response.data.data
        console.log('✅ Class report loaded:', classReport.value)
      }
    } catch (err: any) {
      console.error('❌ Error fetching class report:', err)
    }
  }
  
  const fetchUserReport = async () => {
    try {
      const response = await api.get('/reports/users')
      
      if (response.data.success) {
        userReport.value = response.data.data
        console.log('✅ User report loaded:', userReport.value)
      }
    } catch (err: any) {
      console.error('❌ Error fetching user report:', err)
    }
  }
  
  const clearError = () => {
    error.value = null
  }
  
  return {
    // State
    overviewReport,
    revenueReport,
    membershipReport,
    classReport,
    userReport,
    loading,
    error,
    
    // Getters
    hasOverviewData,
    hasRevenueData,
    
    // Actions
    fetchOverviewReport,
    fetchRevenueReport,
    fetchMembershipReport,
    fetchClassReport,
    fetchUserReport,
    clearError
  }
})


