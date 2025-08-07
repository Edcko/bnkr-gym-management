<template>
  <div class="admin-classes">
    <v-container fluid>
      <!-- Header -->
      <v-row>
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <h1 class="text-h4 font-weight-bold">Gestión de Clases</h1>
              <p class="text-subtitle-1 text-medium-emphasis">
                Administra todas las clases del gimnasio
              </p>
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateDialog"
              :loading="loading"
            >
              Nueva Clase
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Stats Cards -->
      <v-row>
        <v-col cols="12" sm="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon color="primary" size="large" class="mr-3">mdi-dumbbell</v-icon>
                <div>
                  <div class="text-h6">{{ stats?.total || 0 }}</div>
                  <div class="text-caption">Total Clases</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon color="success" size="large" class="mr-3">mdi-check-circle</v-icon>
                <div>
                  <div class="text-h6">{{ stats?.active || 0 }}</div>
                  <div class="text-caption">Clases Activas</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon color="warning" size="large" class="mr-3">mdi-account-group</v-icon>
                <div>
                  <div class="text-h6">{{ stats?.instructors || 0 }}</div>
                  <div class="text-caption">Instructores</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon color="info" size="large" class="mr-3">mdi-calendar-check</v-icon>
                <div>
                  <div class="text-h6">{{ stats?.reservations || 0 }}</div>
                  <div class="text-caption">Reservas Hoy</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Filters and Search -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="searchQuery"
                    prepend-inner-icon="mdi-magnify"
                    label="Buscar clases..."
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:model-value="searchClasses"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filterInstructor"
                    :items="instructors"
                    item-title="name"
                    item-value="id"
                    label="Instructor"
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:model-value="filterByInstructor"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filterStatus"
                    :items="statusOptions"
                    label="Estado"
                    variant="outlined"
                    density="compact"
                    @update:model-value="filterByStatus"
                  />
                </v-col>
                <v-col cols="12" md="2">
                  <v-btn
                    variant="outlined"
                    @click="clearFilters"
                    prepend-icon="mdi-filter-remove"
                  >
                    Limpiar
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Classes Table -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-data-table
              :headers="headers"
              :items="filteredClasses"
              :loading="loading"
              :items-per-page="10"
              class="elevation-1"
            >
              <!-- Instructor Column -->
              <template v-slot:item.instructor="{ item }">
                <div v-if="item.instructor">
                  <div class="font-weight-medium">{{ item.instructor.name }}</div>
                  <div class="text-caption">{{ item.instructor.email }}</div>
                </div>
              </template>

              <!-- Duration Column -->
              <template v-slot:item.duration="{ item }">
                <div class="font-weight-medium">{{ item.duration }} min</div>
              </template>

              <!-- Capacity Column -->
              <template v-slot:item.maxCapacity="{ item }">
                <div class="font-weight-medium">{{ item.maxCapacity }} personas</div>
              </template>

              <!-- Price Column -->
              <template v-slot:item.price="{ item }">
                <div class="font-weight-medium">${{ item.price }}</div>
              </template>

              <!-- Status Column -->
              <template v-slot:item.isActive="{ item }">
                <v-chip
                  :color="item.isActive ? 'success' : 'error'"
                  :text="item.isActive ? 'Activa' : 'Inactiva'"
                  size="small"
                />
              </template>

              <!-- Actions Column -->
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon="mdi-eye"
                  variant="text"
                  size="small"
                  color="primary"
                  @click="viewClass(item)"
                />
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  size="small"
                  color="warning"
                  @click="editClass(item)"
                />
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-dots-vertical"
                      variant="text"
                      size="small"
                      v-bind="props"
                    />
                  </template>
                  <v-list>
                    <v-list-item @click="toggleClassStatus(item)">
                      <template v-slot:prepend>
                        <v-icon :color="item.isActive ? 'error' : 'success'">
                          {{ item.isActive ? 'mdi-pause' : 'mdi-play' }}
                        </v-icon>
                      </template>
                      <v-list-item-title>
                        {{ item.isActive ? 'Desactivar' : 'Activar' }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="viewSchedule(item)">
                      <template v-slot:prepend>
                        <v-icon color="info">mdi-calendar</v-icon>
                      </template>
                      <v-list-item-title>Ver Horarios</v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item @click="deleteClass(item)" color="error">
                      <template v-slot:prepend>
                        <v-icon color="error">mdi-delete</v-icon>
                      </template>
                      <v-list-item-title class="text-error">Eliminar</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- Pagination -->
      <v-row v-if="totalPages > 1">
        <v-col cols="12" class="d-flex justify-center">
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            @update:model-value="loadClasses"
          />
        </v-col>
      </v-row>
    </v-container>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ isEditing ? 'Editar Clase' : 'Nueva Clase' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.name"
                  label="Nombre de la clase"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.instructorId"
                  :items="instructors"
                  item-title="name"
                  item-value="id"
                  label="Instructor"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.description"
                  label="Descripción"
                  variant="outlined"
                  rows="3"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.duration"
                  label="Duración (minutos)"
                  type="number"
                  variant="outlined"
                  :rules="[rules.required, rules.duration]"
                  required
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.maxCapacity"
                  label="Capacidad máxima"
                  type="number"
                  variant="outlined"
                  :rules="[rules.required, rules.capacity]"
                  required
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.price"
                  label="Precio"
                  type="number"
                  step="0.01"
                  variant="outlined"
                  :rules="[rules.required, rules.price]"
                  required
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="closeDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="saveClass"
            :loading="loading"
            :disabled="!formValid"
          >
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Class Dialog -->
    <v-dialog v-model="showViewDialog" max-width="500px">
      <v-card v-if="selectedClass">
        <v-card-title>
          Detalles de la Clase
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-dumbbell</v-icon>
              </template>
              <v-list-item-title>{{ selectedClass.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ selectedClass.description }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-account-tie</v-icon>
              </template>
              <v-list-item-title>{{ selectedClass.instructor?.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ selectedClass.instructor?.email }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-clock</v-icon>
              </template>
              <v-list-item-title>{{ selectedClass.duration }} minutos</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-account-group</v-icon>
              </template>
              <v-list-item-title>{{ selectedClass.maxCapacity }} personas</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-currency-usd</v-icon>
              </template>
              <v-list-item-title>${{ selectedClass.price }}</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-circle</v-icon>
              </template>
              <v-list-item-title>
                <v-chip
                  :color="selectedClass.isActive ? 'success' : 'error'"
                  :text="selectedClass.isActive ? 'Activa' : 'Inactiva'"
                  size="small"
                />
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            @click="showViewDialog = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que quieres eliminar la clase "{{ selectedClass?.name }}"?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showDeleteDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDelete"
            :loading="loading"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/stores/toast'
import { api } from '@/utils/api'

const toast = useToast()

// Reactive data
const loading = ref(false)
const showDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const selectedClass = ref<any>(null)
const formValid = ref(false)
const searchQuery = ref('')
const filterInstructor = ref('')
const filterStatus = ref<'all' | 'active' | 'inactive'>('all')
const currentPage = ref(1)
const totalPages = ref(0)
const classes = ref<any[]>([])
const instructors = ref<any[]>([])
const stats = ref<any>(null)

// Form data
const form = ref({
  name: '',
  description: '',
  duration: 60,
  maxCapacity: 10,
  price: 0,
  instructorId: ''
})

// Table headers
const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Instructor', key: 'instructor', sortable: true },
  { title: 'Duración', key: 'duration', sortable: true },
  { title: 'Capacidad', key: 'maxCapacity', sortable: true },
  { title: 'Precio', key: 'price', sortable: true },
  { title: 'Estado', key: 'isActive', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false }
]

// Status options
const statusOptions = [
  { title: 'Todas', value: 'all' },
  { title: 'Activas', value: 'active' },
  { title: 'Inactivas', value: 'inactive' }
]

// Validation rules
const rules = {
  required: (value: string) => !!value || 'Este campo es requerido',
  duration: (value: number) => value >= 15 && value <= 180 || 'La duración debe estar entre 15 y 180 minutos',
  capacity: (value: number) => value >= 1 && value <= 50 || 'La capacidad debe estar entre 1 y 50',
  price: (value: number) => value >= 0 || 'El precio debe ser positivo'
}

// Computed
const filteredClasses = computed(() => {
  let filtered = classes.value

  if (filterInstructor.value) {
    filtered = filtered.filter(cls => cls.instructorId === filterInstructor.value)
  }

  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(cls => 
      filterStatus.value === 'active' ? cls.isActive : !cls.isActive
    )
  }

  return filtered
})

// Methods
const loadClasses = async () => {
  try {
    loading.value = true
    const response = await api.get(`/classes?page=${currentPage.value}&limit=10`)
    
    if (response.data.success) {
      classes.value = response.data.data.classes
      totalPages.value = response.data.data.pagination.pages
    }
  } catch (error) {
    console.error('Error loading classes:', error)
    toast.show('Error al cargar las clases', 'error')
  } finally {
    loading.value = false
  }
}

const loadInstructors = async () => {
  try {
    const response = await api.get('/users/active/INSTRUCTOR')
    
    if (response.data.success) {
      instructors.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading instructors:', error)
  }
}

const loadStats = async () => {
  try {
    const response = await api.get('/classes/stats')
    
    if (response.data.success) {
      stats.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const openCreateDialog = () => {
  isEditing.value = false
  resetForm()
  showDialog.value = true
}

const editClass = (cls: any) => {
  isEditing.value = true
  selectedClass.value = cls
  form.value = {
    name: cls.name,
    description: cls.description || '',
    duration: cls.duration,
    maxCapacity: cls.maxCapacity,
    price: cls.price,
    instructorId: cls.instructorId
  }
  showDialog.value = true
}

const viewClass = (cls: any) => {
  selectedClass.value = cls
  showViewDialog.value = true
}

const toggleClassStatus = async (cls: any) => {
  try {
    loading.value = true
    const response = await api.put(`/classes/${cls.id}`, {
      isActive: !cls.isActive
    })
    
    if (response.data.success) {
      const updatedClass = response.data.data
      const index = classes.value.findIndex(c => c.id === cls.id)
      if (index !== -1) {
        classes.value[index] = updatedClass
      }
      toast.show(`Clase ${updatedClass.isActive ? 'activada' : 'desactivada'} exitosamente`, 'success')
    }
  } catch (error) {
    console.error('Error toggling class status:', error)
    toast.show('Error al cambiar el estado de la clase', 'error')
  } finally {
    loading.value = false
  }
}

const viewSchedule = (cls: any) => {
  // Implementar vista de horarios
  toast.show('Funcionalidad de horarios en desarrollo', 'info')
}

const deleteClass = (cls: any) => {
  selectedClass.value = cls
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedClass.value) return
  
  try {
    loading.value = true
    const response = await api.delete(`/classes/${selectedClass.value.id}`)
    
    if (response.data.success) {
      classes.value = classes.value.filter(c => c.id !== selectedClass.value.id)
      showDeleteDialog.value = false
      selectedClass.value = null
      toast.show('Clase eliminada exitosamente', 'success')
    }
  } catch (error) {
    console.error('Error deleting class:', error)
    toast.show('Error al eliminar la clase', 'error')
  } finally {
    loading.value = false
  }
}

const saveClass = async () => {
  if (!formValid.value) return

  try {
    loading.value = true
    
    if (isEditing.value && selectedClass.value) {
      const response = await api.put(`/classes/${selectedClass.value.id}`, form.value)
      
      if (response.data.success) {
        const updatedClass = response.data.data
        const index = classes.value.findIndex(c => c.id === selectedClass.value.id)
        if (index !== -1) {
          classes.value[index] = updatedClass
        }
        toast.show('Clase actualizada exitosamente', 'success')
      }
    } else {
      const response = await api.post('/classes', form.value)
      
      if (response.data.success) {
        const newClass = response.data.data
        classes.value.unshift(newClass)
        toast.show('Clase creada exitosamente', 'success')
      }
    }
    
    closeDialog()
  } catch (error: any) {
    console.error('Error saving class:', error)
    const errorMessage = error.response?.data?.message || 'Error al guardar la clase'
    toast.show(errorMessage, 'error')
  } finally {
    loading.value = false
  }
}

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    duration: 60,
    maxCapacity: 10,
    price: 0,
    instructorId: ''
  }
  selectedClass.value = null
}

const searchClasses = async () => {
  // Implementar búsqueda
  await loadClasses()
}

const filterByInstructor = async () => {
  // Los filtros se aplican en el computed
}

const filterByStatus = async () => {
  // Los filtros se aplican en el computed
}

const clearFilters = () => {
  searchQuery.value = ''
  filterInstructor.value = ''
  filterStatus.value = 'all'
}

// Lifecycle
onMounted(() => {
  Promise.all([
    loadClasses(),
    loadInstructors(),
    loadStats()
  ])
})
</script>

<style scoped>
.admin-classes {
  padding: 20px 0;
}
</style> 