import { ref, computed, type Ref } from 'vue'
import { api } from '@/utils/api'
import { useToast } from './toast'

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  total: number
  totalPages: number
  currentPage: number
  limit: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    items: T[]
    meta: PaginationMeta
  }
  message?: string
}

export class BaseStore<T extends BaseEntity> {
  protected items = ref<T[]>([])
  protected currentItem = ref<T | null>(null)
  protected loading = ref(false)
  protected saving = ref(false)
  protected deleting = ref(false)
  protected searchQuery = ref('')
  protected filters = ref<Record<string, any>>({})
  protected pagination = ref<PaginationMeta>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10
  })

  protected toast = useToast()
  protected endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  // Getters
  get allItems() { return this.items.value }
  get current() { return this.currentItem.value }
  get isLoading() { return this.loading.value }
  get isSaving() { return this.saving.value }
  get isDeleting() { return this.deleting.value }
  get search() { return this.searchQuery.value }
  get currentFilters() { return this.filters.value }
  get paginationMeta() { return this.pagination.value }

  // Computed para items filtrados
  get filteredItems() {
    let filtered = this.items.value

    // Aplicar búsqueda
    if (this.searchQuery.value) {
      const query = this.searchQuery.value.toLowerCase()
      filtered = filtered.filter((item: any) => 
        this.searchInItem(item, query)
      )
    }

    // Aplicar filtros
    Object.entries(this.filters.value).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter((item: any) => 
          this.applyFilter(item, key, value)
        )
      }
    })

    return filtered
  }

  // Métodos abstractos que deben implementar las clases hijas
  protected searchInItem(item: T, query: string): boolean {
    // Implementación por defecto - buscar en propiedades comunes
    return (
      (item as any).name?.toLowerCase().includes(query) ||
      (item as any).email?.toLowerCase().includes(query) ||
      (item as any).description?.toLowerCase().includes(query)
    )
  }

  protected applyFilter(item: T, key: string, value: any): boolean {
    // Implementación por defecto
    return (item as any)[key] === value
  }

  // Métodos CRUD
  async fetchAll(page = 1, limit = 10, additionalFilters = {}) {
    try {
      this.loading.value = true
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...additionalFilters
      })

      console.log(`🔍 BaseStore: Llamando a ${this.endpoint}?${params}`)
      const response = await api.get(`${this.endpoint}?${params}`)
      console.log(`📡 BaseStore: Respuesta recibida:`, response.data)
      
      if (response.data.success) {
        // Manejar diferentes formatos de respuesta
        console.log(`🔍 BaseStore: Verificando formato de respuesta...`)
        console.log(`🔍 BaseStore: response.data.data es Array?`, Array.isArray(response.data.data))
        console.log(`🔍 BaseStore: response.data.data tiene items?`, !!response.data.data?.items)
        console.log(`🔍 BaseStore: response.data.data tiene users?`, !!response.data.data?.users)
        
        if (response.data.data && Array.isArray(response.data.data)) {
          // Formato simple: data es un array
          console.log(`📦 BaseStore: Formato simple, ${response.data.data.length} items`)
          this.items.value = response.data.data
          this.pagination.value = {
            total: response.data.data.length,
            totalPages: 1,
            currentPage: 1,
            limit: response.data.data.length
          }
        } else if (response.data.data && response.data.data.items) {
          // Formato paginado: data.items y data.meta
          console.log(`📦 BaseStore: Formato paginado, ${response.data.data.items.length} items`)
          this.items.value = response.data.data.items
          this.pagination.value = response.data.data.meta
        } else {
          // Formato alternativo - buscar array de items en diferentes propiedades
          console.log(`📦 BaseStore: Formato alternativo, data:`, response.data.data)
          
          // Buscar array de items en diferentes propiedades comunes
          let itemsArray = []
          if (response.data.data?.users) {
            itemsArray = response.data.data.users
            console.log(`📦 BaseStore: Encontrado array en 'users':`, itemsArray.length)
          } else if (response.data.data?.items) {
            itemsArray = response.data.data.items
            console.log(`📦 BaseStore: Encontrado array en 'items':`, itemsArray.length)
          } else if (response.data.data?.data) {
            itemsArray = response.data.data.data
            console.log(`📦 BaseStore: Encontrado array en 'data':`, itemsArray.length)
          } else if (Array.isArray(response.data.data)) {
            itemsArray = response.data.data
            console.log(`📦 BaseStore: Data es directamente un array:`, itemsArray.length)
          }
          
          this.items.value = itemsArray
          this.pagination.value = {
            total: response.data.data?.total || response.data.total || itemsArray.length || 0,
            totalPages: response.data.data?.totalPages || response.data.totalPages || 1,
            currentPage: response.data.data?.currentPage || response.data.page || 1,
            limit: response.data.data?.limit || response.data.limit || itemsArray.length || 10
          }
        }
        console.log(`✅ BaseStore: Items asignados:`, this.items.value)
        return this.items.value
      }
    } catch (error: any) {
      console.error(`❌ BaseStore: Error fetching ${this.endpoint}:`, error)
      const errorMessage = error.response?.data?.message || `Error al cargar ${this.endpoint}`
      this.toast.show(errorMessage, 'error')
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async fetchById(id: string) {
    try {
      this.loading.value = true
      const response = await api.get(`${this.endpoint}/${id}`)
      
      if (response.data.success) {
        this.currentItem.value = response.data.data
        return response.data.data
      }
    } catch (error: any) {
      console.error(`Error fetching ${this.endpoint} by id:`, error)
      const errorMessage = error.response?.data?.message || `Error al cargar ${this.endpoint}`
      this.toast.show(errorMessage, 'error')
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async create(data: Partial<T>) {
    try {
      this.saving.value = true
      const response = await api.post(this.endpoint, data)
      
      if (response.data.success) {
        const newItem = response.data.data
        this.items.value.unshift(newItem)
        this.pagination.value.total++
        this.toast.show(`${this.endpoint} creado exitosamente`, 'success')
        return newItem
      }
    } catch (error: any) {
      console.error(`Error creating ${this.endpoint}:`, error)
      const errorMessage = error.response?.data?.message || `Error al crear ${this.endpoint}`
      this.toast.show(errorMessage, 'error')
      throw error
    } finally {
      this.saving.value = false
    }
  }

  async update(id: string, data: Partial<T>) {
    try {
      this.saving.value = true
      const response = await api.put(`${this.endpoint}/${id}`, data)
      
      if (response.data.success) {
        const updatedItem = response.data.data
        const index = this.items.value.findIndex(item => item.id === id)
        if (index !== -1) {
          this.items.value[index] = updatedItem
        }
        if (this.currentItem.value?.id === id) {
          this.currentItem.value = updatedItem
        }
        this.toast.show(`${this.endpoint} actualizado exitosamente`, 'success')
        return updatedItem
      }
    } catch (error: any) {
      console.error(`Error updating ${this.endpoint}:`, error)
      const errorMessage = error.response?.data?.message || `Error al actualizar ${this.endpoint}`
      this.toast.show(errorMessage, 'error')
      throw error
    } finally {
      this.saving.value = false
    }
  }

  async delete(id: string) {
    try {
      this.deleting.value = true
      const response = await api.delete(`${this.endpoint}/${id}`)
      
      if (response.data.success) {
        this.items.value = this.items.value.filter(item => item.id !== id)
        this.pagination.value.total--
        if (this.currentItem.value?.id === id) {
          this.currentItem.value = null
        }
        this.toast.show(`${this.endpoint} eliminado exitosamente`, 'success')
        return true
      }
    } catch (error: any) {
      console.error(`Error deleting ${this.endpoint}:`, error)
      const errorMessage = error.response?.data?.message || `Error al eliminar ${this.endpoint}`
      this.toast.show(errorMessage, 'error')
      throw error
    } finally {
      this.deleting.value = false
    }
  }

  // Métodos de utilidad
  setSearchQuery(query: string) {
    this.searchQuery.value = query
  }

  setFilter(key: string, value: any) {
    this.filters.value[key] = value
  }

  clearFilters() {
    this.filters.value = {}
  }

  setCurrentItem(item: T | null) {
    this.currentItem.value = item
  }

  resetState() {
    this.items.value = []
    this.currentItem.value = null
    this.searchQuery.value = ''
    this.filters.value = {}
    this.pagination.value = {
      total: 0,
      totalPages: 0,
      currentPage: 1,
      limit: 10
    }
  }
} 