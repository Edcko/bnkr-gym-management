import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

interface Instructor {
  id: string
  name: string
  email: string
}

interface Class {
  id: string
  name: string
  description?: string
  duration: number
  maxCapacity: number
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  instructor: Instructor
  _count?: {
    reservations: number
  }
}

interface ClassSchedule {
  id: string
  classId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ClassStats {
  totalReservations: number
  confirmedReservations: number
  cancelledReservations: number
  utilizationRate: number
  availableSpots: number
}

interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface PaginatedResponse<T> {
  classes: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const useClassesStore = defineStore('classes', () => {
  // Estado
  const classes = ref<Class[]>([])
  const currentClass = ref<Class | null>(null)
  const classSchedule = ref<ClassSchedule[]>([])
  const classStats = ref<ClassStats | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  // Getters
  const availableClasses = computed(() => 
    classes.value.filter(c => c._count && c._count.reservations < c.maxCapacity)
  )

  const classesByInstructor = computed(() => (instructorId: string) =>
    classes.value.filter(c => c.instructor.id === instructorId)
  )

  // Actions
  const fetchClasses = async (params: PaginationParams = {}) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await axios.get('/api/classes', { params })
      const data: PaginatedResponse<Class> = response.data.data

      classes.value = data.classes
      pagination.value = data.pagination

      return data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener clases'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchAvailableClasses = async (params: PaginationParams = {}) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await axios.get('/api/classes/available', { params })
      const data: PaginatedResponse<Class> = response.data.data

      classes.value = data.classes
      pagination.value = data.pagination

      return data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener clases disponibles'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchClassById = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await axios.get(`/api/classes/${id}`)
      currentClass.value = response.data.data

      return currentClass.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener la clase'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createClass = async (classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt' | 'instructor' | '_count'>) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await axios.post('/api/classes', classData)
      const newClass = response.data.data

      // Agregar a la lista
      classes.value.unshift(newClass)

      return newClass
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear la clase'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateClass = async (id: string, classData: Partial<Class>) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await axios.put(`/api/classes/${id}`, classData)
      const updatedClass = response.data.data

      // Actualizar en la lista
      const index = classes.value.findIndex(c => c.id === id)
      if (index !== -1) {
        classes.value[index] = updatedClass
      }

      // Actualizar clase actual si es la misma
      if (currentClass.value?.id === id) {
        currentClass.value = updatedClass
      }

      return updatedClass
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar la clase'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteClass = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null

      await axios.delete(`/api/classes/${id}`)

      // Remover de la lista
      classes.value = classes.value.filter(c => c.id !== id)

      // Limpiar clase actual si es la misma
      if (currentClass.value?.id === id) {
        currentClass.value = null
      }

      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar la clase'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchClassesByInstructor = async (instructorId: string, params: PaginationParams = {}) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await axios.get(`/api/classes/instructor/${instructorId}`, { params })
      const data: PaginatedResponse<Class> = response.data.data

      classes.value = data.classes
      pagination.value = data.pagination

      return data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener clases del instructor'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchClassSchedule = async (classId: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await axios.get(`/api/classes/${classId}/schedule`)
      classSchedule.value = response.data.data

      return classSchedule.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener horarios de la clase'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createClassSchedule = async (classId: string, scheduleData: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
  }>) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await axios.post(`/api/classes/${classId}/schedule`, { scheduleData })
      const schedules = response.data.data

      // Actualizar horarios
      classSchedule.value = [...classSchedule.value, ...schedules]

      return schedules
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear horarios'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateClassSchedule = async (scheduleId: string, scheduleData: Partial<ClassSchedule>) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await axios.put(`/api/classes/schedule/${scheduleId}`, scheduleData)
      const updatedSchedule = response.data.data

      // Actualizar en la lista
      const index = classSchedule.value.findIndex(s => s.id === scheduleId)
      if (index !== -1) {
        classSchedule.value[index] = updatedSchedule
      }

      return updatedSchedule
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar horario'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteClassSchedule = async (scheduleId: string) => {
    try {
      isLoading.value = true
      error.value = null

      await axios.delete(`/api/classes/schedule/${scheduleId}`)

      // Remover de la lista
      classSchedule.value = classSchedule.value.filter(s => s.id !== scheduleId)

      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar horario'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchClassStats = async (classId: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await axios.get(`/api/classes/${classId}/stats`)
      classStats.value = response.data.data

      return classStats.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener estadísticas de la clase'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentClass = () => {
    currentClass.value = null
    classSchedule.value = []
    classStats.value = null
  }

  return {
    // Estado
    classes,
    currentClass,
    classSchedule,
    classStats,
    isLoading,
    error,
    pagination,

    // Getters
    availableClasses,
    classesByInstructor,

    // Actions
    fetchClasses,
    fetchAvailableClasses,
    fetchClassById,
    createClass,
    updateClass,
    deleteClass,
    fetchClassesByInstructor,
    fetchClassSchedule,
    createClassSchedule,
    updateClassSchedule,
    deleteClassSchedule,
    fetchClassStats,
    clearError,
    clearCurrentClass
  }
}) 