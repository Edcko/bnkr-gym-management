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
              :loading="classesStore.saving"
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
                  <div class="text-h6">{{ classesStore.stats?.total || 0 }}</div>
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
                  <div class="text-h6">{{ classesStore.stats?.active || 0 }}</div>
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
                  <div class="text-h6">{{ classesStore.stats?.instructors || 0 }}</div>
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
                  <div class="text-h6">{{ classesStore.stats?.reservations || 0 }}</div>
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
                    label="Filtrar por instructor"
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
                    item-title="title"
                    item-value="value"
                    label="Filtrar por estado"
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:model-value="filterByStatus"
                  />
                </v-col>
                <v-col cols="12" md="2">
                  <v-btn
                    variant="outlined"
                    @click="clearFilters"
                    :disabled="!hasActiveFilters"
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
              :key="tableKey"
              :headers="headers"
              :items="filteredClasses"
              :loading="classesStore.loading"
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
    </v-container>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          {{ isEditing ? 'Editar Clase' : 'Nueva Clase' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="formValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.name"
                  label="Nombre de la clase"
                  variant="outlined"
                  :rules="[rules.required]"
                  clearable
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Descripción"
                  variant="outlined"
                  rows="3"
                  clearable
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="formData.duration"
                  label="Duración (minutos)"
                  variant="outlined"
                  type="number"
                  :rules="[rules.required, rules.duration]"
                  clearable
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="formData.maxCapacity"
                  label="Capacidad máxima"
                  variant="outlined"
                  type="number"
                  :rules="[rules.required, rules.capacity]"
                  clearable
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="formData.price"
                  label="Precio"
                  variant="outlined"
                  type="number"
                  :rules="[rules.required, rules.price]"
                  clearable
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="formData.instructorId"
                  :items="instructors"
                  item-title="name"
                  item-value="id"
                  label="Instructor"
                  variant="outlined"
                  :rules="[rules.required]"
                  clearable
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
            :disabled="classesStore.saving"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="saveClass"
            :loading="classesStore.saving"
            :disabled="!formValid"
          >
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Class Dialog -->
    <v-dialog v-model="showViewDialog" max-width="600px">
      <v-card>
        <v-card-title>Detalles de la Clase</v-card-title>
        <v-card-text v-if="selectedClass">
          <v-row>
            <v-col cols="12">
              <h3>{{ selectedClass.name }}</h3>
              <p class="text-body-2">{{ selectedClass.description || 'Sin descripción' }}</p>
            </v-col>
            <v-col cols="6">
              <strong>Duración:</strong> {{ selectedClass.duration }} minutos
            </v-col>
            <v-col cols="6">
              <strong>Capacidad:</strong> {{ selectedClass.maxCapacity }} personas
            </v-col>
            <v-col cols="6">
              <strong>Precio:</strong> ${{ selectedClass.price }}
            </v-col>
            <v-col cols="6">
              <strong>Estado:</strong>
              <v-chip
                :color="selectedClass.isActive ? 'success' : 'error'"
                :text="selectedClass.isActive ? 'Activa' : 'Inactiva'"
                size="small"
                class="ml-2"
              />
            </v-col>
            <v-col cols="12">
              <strong>Instructor:</strong> {{ selectedClass.instructor?.name }}
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
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
            :loading="classesStore.deleting"
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
import { useClassesStore } from '@/stores/classes'
import { api } from '@/utils/api'

const toast = useToast()
const classesStore = useClassesStore()

// Reactive data
const showDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const selectedClass = ref<any>(null)
const formValid = ref(false)
const searchQuery = ref('')
const filterInstructor = ref('')
const filterStatus = ref<'all' | 'active' | 'inactive'>('all')
const instructors = ref<any[]>([])
const tableKey = ref(0)

// Form data
const formData = ref({
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
  let filtered = classesStore.classes

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(cls => 
      cls.name.toLowerCase().includes(query) ||
      cls.description?.toLowerCase().includes(query)
    )
  }

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

const hasActiveFilters = computed(() => {
  return searchQuery.value || filterInstructor.value || filterStatus.value !== 'all'
})

// Methods
const loadInstructors = async () => {
  try {
    console.log('🔄 Loading instructors...')
    const response = await api.get('/users/role/INSTRUCTOR')
    
    if (response.data.success) {
      instructors.value = response.data.data.users || []
      console.log('✅ Instructors loaded:', instructors.value.length)
    }
  } catch (error) {
    console.error('❌ Error loading instructors:', error)
    toast.show('Error al cargar instructores', 'error')
  }
}

const openCreateDialog = () => {
  isEditing.value = false
  clearForm()
  showDialog.value = true
}

const editClass = (cls: any) => {
  isEditing.value = true
  selectedClass.value = cls
  formData.value = {
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
    console.log('🔄 Toggling class status:', cls.id)
    await classesStore.toggleClassStatus(cls.id)
    
    // Forzar re-render de la tabla
    tableKey.value++
    
    console.log('✅ Class status toggled successfully')
  } catch (error) {
    console.error('❌ Error toggling class status:', error)
  }
}

const viewSchedule = (cls: any) => {
  toast.show('Funcionalidad de horarios en desarrollo', 'info')
}

const deleteClass = (cls: any) => {
  selectedClass.value = cls
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedClass.value) return
  
  try {
    console.log('🔄 Deleting class:', selectedClass.value.id)
    await classesStore.deleteClass(selectedClass.value.id)
    
    showDeleteDialog.value = false
    selectedClass.value = null
    
    // Forzar re-render de la tabla
    tableKey.value++
    
    console.log('✅ Class deleted successfully')
  } catch (error) {
    console.error('❌ Error deleting class:', error)
  }
}

const saveClass = async () => {
  if (!formValid.value) return

  try {
    console.log('🔄 Saving class:', formData.value)
    
    if (isEditing.value && selectedClass.value) {
      await classesStore.updateClass(selectedClass.value.id, formData.value)
    } else {
      await classesStore.createClass(formData.value)
    }
    
    // Forzar re-render de la tabla
    tableKey.value++
    
    closeDialog()
    console.log('✅ Class saved successfully')
  } catch (error: any) {
    console.error('❌ Error saving class:', error)
  }
}

const closeDialog = () => {
  showDialog.value = false
  clearForm()
}

const clearForm = () => {
  formData.value = {
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
  // La búsqueda se aplica en el computed
  console.log('🔍 Searching classes with query:', searchQuery.value)
}

const filterByInstructor = async () => {
  // Los filtros se aplican en el computed
  console.log('🔍 Filtering by instructor:', filterInstructor.value)
}

const filterByStatus = async () => {
  // Los filtros se aplican en el computed
  console.log('🔍 Filtering by status:', filterStatus.value)
}

const clearFilters = () => {
  searchQuery.value = ''
  filterInstructor.value = ''
  filterStatus.value = 'all'
  console.log('🧹 Filters cleared')
}

// Lifecycle
onMounted(async () => {
  console.log('🚀 AdminClassesView mounted')
  
  try {
    await Promise.all([
      classesStore.fetchAll(),
      classesStore.fetchStats(),
      loadInstructors()
    ])
    
    console.log('✅ AdminClassesView initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing AdminClassesView:', error)
  }
})
</script>

<style scoped>
.admin-classes {
  padding: 20px 0;
}
</style> 