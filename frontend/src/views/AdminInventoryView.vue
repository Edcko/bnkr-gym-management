<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">📦 Gestión de Inventario</h1>
        
        <!-- Estadísticas rápidas -->
        <v-row class="mb-6">
          <v-col cols="12" md="3">
            <v-card class="pa-4 text-center">
              <v-icon size="48" color="primary" class="mb-3">mdi-package-variant</v-icon>
              <h3 class="text-h5">{{ stats.totalItems || 0 }}</h3>
              <p class="text-body-2">Total de Items</p>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-card class="pa-4 text-center">
              <v-icon size="48" color="success" class="mb-3">mdi-check-circle</v-icon>
              <h3 class="text-h5">{{ stats.activeItems || 0 }}</h3>
              <p class="text-body-2">Items Activos</p>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-card class="pa-4 text-center">
              <v-icon size="48" color="warning" class="mb-3">mdi-alert</v-icon>
              <h3 class="text-h5">{{ stats.lowStockItems || 0 }}</h3>
              <p class="text-body-2">Stock Bajo</p>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-card class="pa-4 text-center">
              <v-icon size="48" color="error" class="mb-3">mdi-close-circle</v-icon>
              <h3 class="text-h5">{{ stats.outOfStockItems || 0 }}</h3>
              <p class="text-body-2">Sin Stock</p>
            </v-card>
          </v-col>
        </v-row>

        <!-- Barra de herramientas -->
        <v-card class="mb-6">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="searchQuery"
                  label="Buscar items..."
                  prepend-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  @input="handleSearch"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="2">
                <v-select
                  v-model="unitFilter"
                  label="Unidad"
                  :items="unitOptions"
                  variant="outlined"
                  density="compact"
                  @update:model-value="handleFilter"
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="2">
                <v-select
                  v-model="statusFilter"
                  label="Estado"
                  :items="statusOptions"
                  variant="outlined"
                  density="compact"
                  @update:model-value="handleFilter"
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="2">
                <v-select
                  v-model="stockFilter"
                  label="Stock"
                  :items="stockOptions"
                  variant="outlined"
                  density="compact"
                  @update:model-value="handleFilter"
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="3" class="text-right">
                <v-btn
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="openCreateDialog"
                >
                  Nuevo Item
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Tabla de inventario -->
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Lista de Inventario</span>
            <v-chip color="primary">{{ filteredItems.length }} items</v-chip>
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="filteredItems"
            :loading="loading"
            :search="searchQuery"
            class="elevation-1"
          >
            <!-- Columna de cantidad -->
            <template v-slot:item.quantity="{ item }">
              <v-chip
                :color="getStockColor(item.quantity, item.threshold)"
                size="small"
              >
                {{ item.quantity }}
              </v-chip>
            </template>

            <!-- Columna de precio -->
            <template v-slot:item.price="{ item }">
              ${{ (Number(item.price) || 0).toFixed(2) }}
            </template>

            <!-- Columna de estado -->
            <template v-slot:item.isActive="{ item }">
              <v-chip
                :color="getStatusColor(item.isActive)"
                size="small"
              >
                {{ getStatusLabel(item.isActive) }}
              </v-chip>
            </template>

            <!-- Columna de acciones -->
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon="mdi-eye"
                size="small"
                color="info"
                variant="text"
                @click="viewItem(item)"
                class="mr-2"
              ></v-btn>
              
              <v-btn
                icon="mdi-pencil"
                size="small"
                color="warning"
                variant="text"
                @click="editItem(item)"
                class="mr-2"
              ></v-btn>
              
              <v-btn
                icon="mdi-delete"
                size="small"
                color="error"
                variant="text"
                @click="deleteItem(item)"
              ></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo para crear/editar item -->
    <v-dialog v-model="showItemDialog" max-width="800px" persistent>
      <v-card>
        <v-card-title class="text-h5">
          {{ editingItem ? 'Editar Item' : 'Crear Nuevo Item' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="saveItem">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name"
                  label="Nombre del item"
                  required
                  variant="outlined"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-textarea
                  v-model="formData.description"
                  label="Descripción"
                  variant="outlined"
                  rows="3"
                ></v-textarea>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.quantity"
                  label="Cantidad"
                  type="number"
                  min="0"
                  required
                  variant="outlined"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.threshold"
                  label="Umbral mínimo"
                  type="number"
                  min="0"
                  required
                  variant="outlined"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.unit"
                  label="Unidad"
                  :items="unitOptions"
                  required
                  variant="outlined"
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.price"
                  label="Precio"
                  type="number"
                  step="0.01"
                  min="0"
                  variant="outlined"
                  prepend-icon="mdi-currency-usd"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.supplier"
                  label="Proveedor"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.location"
                  label="Ubicación"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-switch
                  v-model="formData.isActive"
                  label="Activo"
                  color="success"
                  inset
                ></v-switch>
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Descripción"
                  variant="outlined"
                  rows="3"
                ></v-textarea>
              </v-col>
              

            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="closeItemDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="saveItem"
            :loading="saving"
          >
            {{ editingItem ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación para eliminar -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Confirmar eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que quieres eliminar el item 
          <strong>{{ itemToDelete?.name }}</strong>?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showDeleteDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDelete"
            :loading="deleting"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useToast } from '@/stores/toast'

// Stores
const inventoryStore = useInventoryStore()
const toast = useToast()

// Estado
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const unitFilter = ref('all')
const statusFilter = ref('all')
const stockFilter = ref('all')
const showItemDialog = ref(false)
const showDeleteDialog = ref(false)
const editingItem = ref<any>(null)
const itemToDelete = ref<any>(null)

// Referencia del formulario
const formRef = ref()

// Datos del formulario - NUEVA ESTRUCTURA
const formData = ref({
  name: '',
  description: '',
  quantity: 0,
  unit: '',
  threshold: 0,
  price: 0,
  supplier: '',
  location: '',
  isActive: true
})

// Formulario original (mantener para compatibilidad temporal)
const itemForm = ref({
  name: '',
  description: '',
  quantity: 0,
  unit: '',
  threshold: 0,
  price: 0,
  supplier: '',
  location: '',
  isActive: true
})

// Usar datos del store de inventario
const items = computed(() => {
  console.log('🔍 items computed llamado, inventoryStore.items:', inventoryStore.items)
  if (inventoryStore.items.length > 0) {
    console.log('🔍 Primer item estructura:', inventoryStore.items[0])
    console.log('🔍 Primer item price:', inventoryStore.items[0].price, 'tipo:', typeof inventoryStore.items[0].price)
  }
  return inventoryStore.items
})

// Headers de la tabla
const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Cantidad', key: 'quantity', sortable: true },
  { title: 'Unidad', key: 'unit', sortable: true },
  { title: 'Precio', key: 'price', sortable: true },
  { title: 'Estado', key: 'isActive', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false }
]

// Opciones de filtros
const unitOptions = [
  { title: 'Todas las unidades', value: 'all' },
  { title: 'Unidades', value: 'units' },
  { title: 'Pares', value: 'pairs' },
  { title: 'Kilogramos', value: 'kg' },
  { title: 'Litros', value: 'l' }
]

// Opciones para el formulario (sin 'all')
const formUnitOptions = [
  { title: 'Unidades', value: 'units' },
  { title: 'Pares', value: 'pairs' },
  { title: 'Kilogramos', value: 'kg' },
  { title: 'Litros', value: 'l' }
]

const statusOptions = [
  { title: 'Todos los estados', value: 'all' },
  { title: 'Activo', value: true },
  { title: 'Inactivo', value: false }
]

const stockOptions = [
  { title: 'Todo el stock', value: 'all' },
  { title: 'Stock bajo', value: 'low' },
  { title: 'Sin stock', value: 'out' }
]

// Computed
const filteredItems = computed(() => {
  let filtered = items.value

  // Filtro por unidad
  if (unitFilter.value !== 'all') {
    filtered = filtered.filter((item: any) => item.unit === unitFilter.value)
  }

  // Filtro por estado
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter((item: any) => item.isActive === statusFilter.value)
  }

  // Filtro por cantidad
  if (stockFilter.value !== 'all') {
    switch (stockFilter.value) {
      case 'low':
        filtered = filtered.filter((item: any) => item.quantity <= item.threshold)
        break
      case 'out':
        filtered = filtered.filter((item: any) => item.quantity === 0)
        break
    }
  }

  // Filtro por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((item: any) =>
      item.name.toLowerCase().includes(query) ||
      item.unit.toLowerCase().includes(query) ||
      (item.description?.toLowerCase().includes(query) || false) ||
      (item.location?.toLowerCase().includes(query) || false) ||
      (item.supplier?.toLowerCase().includes(query) || false)
    )
  }

  return filtered
})

const stats = computed(() => ({
  totalItems: items.value.length,
  activeItems: items.value.filter((i: any) => i.isActive).length,
  lowStockItems: items.value.filter((i: any) => i.quantity <= i.threshold).length,
  outOfStockItems: items.value.filter((i: any) => i.quantity === 0).length
}))

// Métodos
const getStockColor = (quantity: number, threshold: number) => {
  if (quantity === 0) return 'error'
  if (quantity <= threshold) return 'warning'
  return 'success'
}

const getStatusColor = (isActive: boolean) => {
  return isActive ? 'success' : 'warning'
}

const getStatusLabel = (isActive: boolean) => {
  return isActive ? 'Activo' : 'Inactivo'
}

const handleSearch = () => {
  // La búsqueda se actualiza automáticamente con computed
}

const handleFilter = () => {
  // Los filtros se actualizan automáticamente con computed
}

const openCreateDialog = () => {
  console.log('🔍 openCreateDialog - Abriendo diálogo de creación')
  editingItem.value = null
  clearForm()
  showItemDialog.value = true
}

const editItem = (item: any) => {
  console.log('🔍 editItem - Editando item:', item)
  editingItem.value = item
  // Llenar el formulario con los datos del item
  formData.value = { ...item }
  showItemDialog.value = true
}

const clearForm = () => {
  console.log('🧹 clearForm - Limpiando formulario')
  formData.value = {
    name: '',
    description: '',
    quantity: 0,
    unit: '',
    threshold: 0,
    price: 0,
    supplier: '',
    location: '',
    isActive: true
  }
  console.log('🧹 clearForm - Formulario limpio:', formData.value)
}

const viewItem = (item: any) => {
  // Implementar vista detallada del item
  toast.show(`Viendo item: ${item.name}`, 'info')
}

const deleteItem = (item: any) => {
  itemToDelete.value = item
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!itemToDelete.value) return
  
  try {
    deleting.value = true
    // Eliminar usando el store
    await inventoryStore.delete(itemToDelete.value.id)
    
    toast.show('Item eliminado exitosamente', 'success')
    showDeleteDialog.value = false
    itemToDelete.value = null
  } catch (error) {
    toast.show('Error al eliminar item', 'error')
  } finally {
    deleting.value = false
  }
}

const saveItem = async () => {
  try {
    saving.value = true
    
    console.log('📝 saveItem - Datos del formulario:', formData.value)
    
    if (editingItem.value) {
      // Actualizar item existente usando el store
      await inventoryStore.update(editingItem.value.id, formData.value)
      toast.show('Item actualizado exitosamente', 'success')
    } else {
      // Crear nuevo item usando el store
      await inventoryStore.create(formData.value)
      toast.show('Item creado exitosamente', 'success')
    }
    
    // Limpiar formulario después de guardar exitosamente
    clearForm()
    closeItemDialog()
  } catch (error: any) {
    console.error('❌ Error en saveItem:', error)
    
    // Mostrar mensaje de error más específico
    if (error.response?.data?.message) {
      toast.show(`Error: ${error.response.data.message}`, 'error')
    } else if (error.message) {
      toast.show(`Error: ${error.message}`, 'error')
    } else {
      toast.show('Error al guardar item', 'error')
    }
  } finally {
    saving.value = false
  }
}

const closeItemDialog = () => {
  showItemDialog.value = false
  editingItem.value = null
  // No resetear automáticamente al cerrar
  // resetItemForm()
}

const resetItemForm = () => {
  itemForm.value = {
    name: '',
    description: '',
    quantity: 0,
    unit: '',
    threshold: 0,
    price: 0,
    supplier: '',
    location: '',
    isActive: true
  }
}

// Lifecycle
onMounted(async () => {
  try {
    loading.value = true
    console.log('🚀 onMounted - Iniciando carga de inventario...')
    console.log('🚀 onMounted - inventoryStore antes de init:', inventoryStore)
    
    await inventoryStore.init()
    
    console.log('✅ onMounted - init completado')
    console.log('✅ onMounted - inventoryStore después de init:', inventoryStore)
    console.log('✅ onMounted - inventoryStore.items:', inventoryStore.items)
    console.log('✅ onMounted - items.value:', items.value)
    
  } catch (error) {
    console.error('❌ onMounted - Error:', error)
    toast.show('Error al cargar inventario', 'error')
  } finally {
    loading.value = false
  }
})
</script>
