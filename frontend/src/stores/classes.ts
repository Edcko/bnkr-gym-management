import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from './toast'
import { api } from '@/utils/api'

// Interfaces
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
  instructorId: string
  instructor: Instructor
  _count?: {
    reservations: number
  }
}

interface CreateClassData {
  name: string
  description?: string
  duration: number
  maxCapacity: number
  price: number
  instructorId: string
}

interface UpdateClassData extends Partial<CreateClassData> {
  isActive?: boolean
}

interface ClassStats {
  total: number
  active: number
  instructors: number
  reservations: number
}

export const useClassesStore = defineStore('classes', () => {
  const toast = useToast()
  
  // Estado
  const classes = ref<Class[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  const stats = ref<ClassStats | null>(null)
  const error = ref<string | null>(null)

  // Getters
  const activeClasses = computed(() => 
    classes.value.filter(c => c.isActive)
  )

  const inactiveClasses = computed(() => 
    classes.value.filter(c => !c.isActive)
  )

  const classesByInstructor = computed(() => (instructorId: string) =>
    classes.value.filter(c => c.instructorId === instructorId)
  )

  // Actions
  const fetchAll = async () => {
    try {
      loading.value = true
      error.value = null

      console.log('🔄 Fetching classes...')
      const response = await api.get('/classes')
      
      if (response.data.success) {
        classes.value = response.data.data.classes || []
        console.log('✅ Classes loaded:', classes.value.length)
      } else {
        console.error('❌ Error loading classes:', response.data.message)
        error.value = response.data.message || 'Error desconocido'
      }
    } catch (err: any) {
      console.error('❌ Error fetching classes:', err)
      const errorMessage = err.response?.data?.message || 'Error al cargar las clases'
      error.value = errorMessage
      toast.show(errorMessage, 'error')
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    try {
      // DEBUG: Extraer token para pruebas manuales
      const token = localStorage.getItem('token')
      console.log('🔑 TOKEN PARA PRUEBAS:', token)
      console.log('🔑 TOKEN COMPLETO:', token ? `Bearer ${token}` : 'No token')
      
      console.log('🔄 Fetching class stats...')
      const response = await api.get('/classes/stats')
      
      if (response.data.success) {
        stats.value = response.data.data
        console.log('✅ Class stats loaded:', stats.value)
      } else {
        console.error('❌ Error loading stats:', response.data.message)
      }
    } catch (err: any) {
      console.error('❌ Error fetching class stats:', err)
      // No mostrar toast para stats, solo log
    }
  }

  const createClass = async (classData: CreateClassData) => {
    try {
      saving.value = true
      error.value = null

      console.log('🔄 Creating class:', classData)
      const response = await api.post('/classes', classData)
      
      if (response.data.success) {
        const newClass = response.data.data
        classes.value.unshift(newClass)
        console.log('✅ Class created:', newClass)
        toast.show('Clase creada exitosamente', 'success')
        return newClass
      } else {
        throw new Error(response.data.message || 'Error desconocido')
      }
    } catch (err: any) {
      console.error('❌ Error creating class:', err)
      const errorMessage = err.response?.data?.message || 'Error al crear la clase'
      error.value = errorMessage
      toast.show(errorMessage, 'error')
      throw err
    } finally {
      saving.value = false
    }
  }

  const updateClass = async (id: string, classData: UpdateClassData) => {
    try {
      saving.value = true
      error.value = null

      console.log('🔄 Updating class:', id, classData)
      const response = await api.put(`/classes/${id}`, classData)
      
      if (response.data.success) {
        const updatedClass = response.data.data
        
        // Actualizar en la lista
        const index = classes.value.findIndex(c => c.id === id)
        if (index !== -1) {
          classes.value[index] = updatedClass
        }
        
        console.log('✅ Class updated:', updatedClass)
        toast.show('Clase actualizada exitosamente', 'success')
        return updatedClass
      } else {
        throw new Error(response.data.message || 'Error desconocido')
      }
    } catch (err: any) {
      console.error('❌ Error updating class:', err)
      const errorMessage = err.response?.data?.message || 'Error al actualizar la clase'
      error.value = errorMessage
      toast.show(errorMessage, 'error')
      throw err
    } finally {
      saving.value = false
    }
  }

  const deleteClass = async (id: string) => {
    try {
      deleting.value = true
      error.value = null

      console.log('🔄 Deleting class:', id)
      const response = await api.delete(`/classes/${id}`)
      
      if (response.data.success) {
        // Remover de la lista
        classes.value = classes.value.filter(c => c.id !== id)
        console.log('✅ Class deleted:', id)
        toast.show('Clase eliminada exitosamente', 'success')
        return true
      } else {
        throw new Error(response.data.message || 'Error desconocido')
      }
    } catch (err: any) {
      console.error('❌ Error deleting class:', err)
      const errorMessage = err.response?.data?.message || 'Error al eliminar la clase'
      error.value = errorMessage
      toast.show(errorMessage, 'error')
      throw err
    } finally {
      deleting.value = false
    }
  }

  const toggleClassStatus = async (id: string) => {
    try {
      const classItem = classes.value.find(c => c.id === id)
      if (!classItem) throw new Error('Clase no encontrada')

      const newStatus = !classItem.isActive
      console.log('🔄 Toggling class status:', id, 'to', newStatus)
      
      await updateClass(id, { isActive: newStatus })
      
      console.log('✅ Class status toggled:', id, 'to', newStatus)
      return true
    } catch (err: any) {
      console.error('❌ Error toggling class status:', err)
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // Estado
    classes,
    loading,
    saving,
    deleting,
    stats,
    error,

    // Getters
    activeClasses,
    inactiveClasses,
    classesByInstructor,

    // Actions
    fetchAll,
    fetchStats,
    createClass,
    updateClass,
    deleteClass,
    toggleClassStatus,
    clearError
  }
}) 