import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BaseStore } from './baseStore'
import type { BaseEntity } from './baseStore'
import { useToast } from './toast'
import { api } from '@/utils/api'

// Interfaces específicas para inventario (basadas en el schema real de Prisma)
export interface InventoryItem extends BaseEntity {
  name: string
  description?: string
  quantity: number
  unit: string
  threshold: number
  price?: number
  supplier?: string
  location?: string
  isActive: boolean
}

export interface CreateInventoryItemData {
  name: string
  description?: string
  quantity: number
  unit: string
  threshold: number
  price?: number
  supplier?: string
  location?: string
  isActive?: boolean
}

export interface UpdateInventoryItemData extends Partial<CreateInventoryItemData> {}

export const useInventoryStore = defineStore('inventory', () => {
  const toast = useToast()
  
  // Estado local del store
  const items = ref<InventoryItem[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  
  // Estado específico del inventario
  const stats = ref({
    totalItems: 0,
    activeItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0
  })
  
  // Cargar items desde el backend
  const fetchItems = async () => {
    try {
      loading.value = true
      console.log('📡 Llamando a /inventory...')
      
      const response = await api.get('/inventory')
      console.log('📡 Respuesta recibida:', response.data)
      
      if (response.data.success) {
        // La respuesta tiene la estructura: { data: [...], pagination: {...} }
        items.value = response.data.data || []
        console.log('✅ Items cargados:', items.value.length)
      }
    } catch (error) {
      console.error('❌ Error cargando items:', error)
      toast.show('Error al cargar inventario', 'error')
    } finally {
      loading.value = false
    }
  }
  
  // Cargar estadísticas del inventario
  const loadStats = async () => {
    try {
      console.log('📊 Llamando a /inventory/stats...')
      const response = await api.get('/inventory/stats')
      console.log('📊 Respuesta de stats:', response.data)
      
      if (response.data.success) {
        stats.value = response.data.data
        console.log('✅ Stats actualizados:', stats.value)
      }
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error)
      toast.show('Error al cargar estadísticas del inventario', 'error')
    }
  }
  
  // Métodos específicos del inventario
  const createInventoryItem = async (data: CreateInventoryItemData) => {
    try {
      saving.value = true
      const response = await api.post('/inventory', data)
      
      if (response.data.success) {
        const newItem = response.data.data
        items.value.unshift(newItem)
        await loadStats() // Recargar estadísticas
        toast.show('Item de inventario creado exitosamente', 'success')
        return newItem
      }
    } catch (error) {
      toast.show('Error al crear item de inventario', 'error')
      throw error
    } finally {
      saving.value = false
    }
  }
  
  const updateInventoryItem = async (id: string, data: UpdateInventoryItemData) => {
    try {
      saving.value = true
      const response = await api.put(`/inventory/${id}`, data)
      
      if (response.data.success) {
        const updatedItem = response.data.data
        const index = items.value.findIndex(item => item.id === id)
        if (index !== -1) {
          items.value[index] = updatedItem
        }
        await loadStats() // Recargar estadísticas
        toast.show('Item de inventario actualizado exitosamente', 'success')
        return updatedItem
      }
    } catch (error) {
      toast.show('Error al actualizar item de inventario', 'error')
      throw error
    } finally {
      saving.value = false
    }
  }
  
  const deleteInventoryItem = async (id: string) => {
    try {
      deleting.value = true
      const response = await api.delete(`/inventory/${id}`)
      
      if (response.data.success) {
        items.value = items.value.filter(item => item.id !== id)
        await loadStats() // Recargar estadísticas
        toast.show('Item de inventario eliminado exitosamente', 'success')
        return true
      }
    } catch (error) {
      toast.show('Error al eliminar item de inventario', 'error')
      throw error
    } finally {
      deleting.value = false
    }
  }
  
  const updateQuantity = async (id: string, newQuantity: number) => {
    try {
      const result = await updateInventoryItem(id, { quantity: newQuantity })
      if (result) {
        await loadStats() // Recargar estadísticas
        toast.show('Cantidad actualizada exitosamente', 'success')
      }
      return result
    } catch (error) {
      toast.show('Error al actualizar cantidad', 'error')
      throw error
    }
  }
  
  const restockItem = async (id: string, addQuantity: number) => {
    try {
      const item = items.value.find(item => item.id === id)
      if (item) {
        const newQuantity = item.quantity + addQuantity
        const result = await updateQuantity(id, newQuantity)
        toast.show(`Item reabastecido con ${addQuantity} unidades`, 'success')
        return result
      }
    } catch (error) {
      toast.show('Error al reabastecer item', 'error')
      throw error
    }
  }
  
  const activateItem = async (id: string) => {
    try {
      const result = await updateInventoryItem(id, { isActive: true })
      if (result) {
        toast.show('Item activado exitosamente', 'success')
      }
      return result
    } catch (error) {
      toast.show('Error al activar item', 'error')
      throw error
    }
  }
  
  const deactivateItem = async (id: string) => {
    try {
      const result = await updateInventoryItem(id, { isActive: false })
      if (result) {
        toast.show('Item desactivado exitosamente', 'success')
      }
      return result
    } catch (error) {
      toast.show('Error al desactivar item', 'error')
      throw error
    }
  }
  
  // Override de métodos del BaseStore para lógica específica
  const searchInItem = (item: InventoryItem, query: string): boolean => {
    const searchQuery = query.toLowerCase()
    return (
      item.name.toLowerCase().includes(searchQuery) ||
      item.unit.toLowerCase().includes(searchQuery) ||
      (item.description?.toLowerCase().includes(searchQuery) || false) ||
      (item.location?.toLowerCase().includes(searchQuery) || false) ||
      (item.supplier?.toLowerCase().includes(searchQuery) || false)
    )
  }
  
  const applyFilter = (item: InventoryItem, filters: any): boolean => {
    // Filtro por unidad
    if (filters.unit && filters.unit !== 'all' && item.unit !== filters.unit) {
      return false
    }
    
    // Filtro por estado
    if (filters.status && filters.status !== 'all' && item.isActive !== (filters.status === 'ACTIVE')) {
      return false
    }
    
    // Filtro por cantidad
    if (filters.stock && filters.stock !== 'all') {
      switch (filters.stock) {
        case 'low':
          if (item.quantity > item.threshold) return false
          break
        case 'out':
          if (item.quantity !== 0) return false
          break
      }
    }
    
    return true
  }
  
  // Computed getters específicos del inventario
  const lowStockItems = computed(() => 
    items.value.filter(item => item.quantity <= item.threshold)
  )
  
  const outOfStockItems = computed(() => 
    items.value.filter(item => item.quantity === 0)
  )
  
  const activeItems = computed(() => 
    items.value.filter(item => item.isActive)
  )
  
  const units = computed(() => {
    const uniqueUnits = new Set(items.value.map(item => item.unit))
    return Array.from(uniqueUnits).sort()
  })
  
  const locations = computed(() => {
    const uniqueLocations = new Set(
      items.value
        .map(item => item.location)
        .filter(Boolean)
    )
    return Array.from(uniqueLocations).sort()
  })
  
  // Inicializar store
  const init = async () => {
    console.log('🚀 Iniciando store de inventario...')
    try {
      await fetchItems()
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
    fetchItems,
    loadStats,
    create: createInventoryItem,
    update: updateInventoryItem,
    delete: deleteInventoryItem,
    
    // Métodos específicos del inventario
    updateQuantity,
    restockItem,
    activateItem,
    deactivateItem,
    
    // Computed getters
    lowStockItems,
    outOfStockItems,
    activeItems,
    units,
    locations,
    
    // Inicialización
    init
  }
})
