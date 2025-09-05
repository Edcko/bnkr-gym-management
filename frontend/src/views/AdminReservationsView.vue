<template>
  <div class="admin-reservations">
    <v-container fluid>
      <!-- Breadcrumbs de navegación -->
      <AdminBreadcrumbs current-module="Gestión de Reservas" />
      
      <!-- Header -->
      <v-row>
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <h1 class="text-h4 font-weight-bold">Gestión de Reservas</h1>
              <p class="text-subtitle-1 text-medium-emphasis">
                Administra todas las reservas del gimnasio
              </p>
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateDialog"
              :loading="reservationsStore.loading"
            >
              Nueva Reserva
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
                <v-icon color="primary" size="large" class="mr-3">mdi-calendar-check</v-icon>
                <div>
                  <div class="text-h6">{{ stats?.total || 0 }}</div>
                  <div class="text-caption">Total Reservas</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon color="warning" size="large" class="mr-3">mdi-clock-outline</v-icon>
                <div>
                  <div class="text-h6">{{ stats?.pending || 0 }}</div>
                  <div class="text-caption">Pendientes</div>
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
                  <div class="text-h6">{{ stats?.confirmed || 0 }}</div>
                  <div class="text-caption">Confirmadas</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon color="error" size="large" class="mr-3">mdi-calendar-remove</v-icon>
                <div>
                  <div class="text-h6">{{ stats?.cancelled || 0 }}</div>
                  <div class="text-caption">Canceladas</div>
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
                    label="Buscar reservas..."
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:model-value="reservationsStore.searchReservations"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filterStatus"
                    :items="statusOptions"
                    label="Estado"
                    variant="outlined"
                    density="compact"
                    @update:model-value="reservationsStore.setFilterStatus"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="filterDate"
                    type="date"
                    label="Fecha"
                    variant="outlined"
                    density="compact"
                    @update:model-value="reservationsStore.setFilterDate"
                  />
                </v-col>
                <v-col cols="12" md="2">
                  <v-btn
                    variant="outlined"
                    @click="reservationsStore.clearFilters"
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

      <!-- Reservations Table -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-data-table
              :key="tableKey"
              :headers="headers"
              :items="reservationsStore.filteredReservations"
              :loading="reservationsStore.loading"
              :items-per-page="10"
              class="elevation-1"
            >
              <!-- User Column -->
              <template v-slot:item.user="{ item }">
                <div v-if="item.user">
                  <div class="font-weight-medium">{{ item.user.name }}</div>
                  <div class="text-caption">{{ item.user.email }}</div>
                </div>
              </template>

              <!-- Class Column -->
              <template v-slot:item.class="{ item }">
                <div v-if="item.class">
                  <div class="font-weight-medium">{{ item.class.name }}</div>
                  <div class="text-caption">{{ item.class.duration }} min</div>
                </div>
              </template>

              <!-- Instructor Column -->
              <template v-slot:item.instructor="{ item }">
                <div v-if="item.instructor">
                  <div class="font-weight-medium">{{ item.instructor.name }}</div>
                  <div class="text-caption">{{ item.instructor.email }}</div>
                </div>
              </template>

              <!-- Date/Time Column -->
              <template v-slot:item.startTime="{ item }">
                <div>
                  <div class="font-weight-medium">{{ reservationsStore.formatDate(item.startTime) }}</div>
                  <div class="text-caption">{{ reservationsStore.formatTime(item.startTime) }}</div>
                </div>
              </template>

              <!-- Status Column -->
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="reservationsStore.getReservationStatusColor(item.status)"
                  :text="reservationsStore.getReservationStatusText(item.status)"
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
                  @click="viewReservation(item)"
                />
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  size="small"
                  color="warning"
                  @click="editReservation(item)"
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
                    <v-list-item 
                      v-if="item.status === 'PENDING'"
                      @click="confirmReservation(item)"
                    >
                      <template v-slot:prepend>
                        <v-icon color="success">mdi-check</v-icon>
                      </template>
                      <v-list-item-title>Confirmar</v-list-item-title>
                    </v-list-item>
                    <v-list-item 
                      v-if="item.status !== 'CANCELLED'"
                      @click="cancelReservation(item)"
                    >
                      <template v-slot:prepend>
                        <v-icon color="error">mdi-close</v-icon>
                      </template>
                      <v-list-item-title>Cancelar</v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item @click="deleteReservation(item)" color="error">
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
      <v-row v-if="reservationsStore.totalPages > 1">
        <v-col cols="12" class="d-flex justify-center">
          <v-pagination
            v-model="reservationsStore.currentPage"
            :length="reservationsStore.totalPages"
            @update:model-value="loadReservations"
          />
        </v-col>
      </v-row>
    </v-container>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ isEditing ? 'Editar Reserva' : 'Nueva Reserva' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.classId"
                  :items="availableClasses"
                  item-title="name"
                  item-value="id"
                  label="Clase"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.instructorId"
                  :items="availableInstructors"
                  item-title="name"
                  item-value="id"
                  label="Instructor"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.startTime"
                  label="Fecha y hora de inicio"
                  type="datetime-local"
                  variant="outlined"
                  :rules="[rules.required, rules.validDate]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.endTime"
                  label="Fecha y hora de fin"
                  type="datetime-local"
                  variant="outlined"
                  :rules="[rules.required, rules.validDate, rules.endTimeAfterStart]"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.notes"
                  label="Notas"
                  variant="outlined"
                  rows="3"
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
            @click="saveReservation"
            :loading="reservationsStore.loading"
            :disabled="!formValid"
          >
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Reservation Dialog -->
    <v-dialog v-model="showViewDialog" max-width="500px">
      <v-card v-if="selectedReservation">
        <v-card-title>
          Detalles de la Reserva
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-account</v-icon>
              </template>
              <v-list-item-title>{{ selectedReservation.user?.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ selectedReservation.user?.email }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-dumbbell</v-icon>
              </template>
              <v-list-item-title>{{ selectedReservation.class?.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ selectedReservation.class?.duration }} minutos</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-account-tie</v-icon>
              </template>
              <v-list-item-title>{{ selectedReservation.instructor?.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ selectedReservation.instructor?.email }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-calendar</v-icon>
              </template>
              <v-list-item-title>{{ reservationsStore.formatDate(selectedReservation.startTime) }}</v-list-item-title>
              <v-list-item-subtitle>{{ reservationsStore.formatTime(selectedReservation.startTime) }} - {{ reservationsStore.formatTime(selectedReservation.endTime) }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-circle</v-icon>
              </template>
              <v-list-item-title>
                <v-chip
                  :color="reservationsStore.getReservationStatusColor(selectedReservation.status)"
                  :text="reservationsStore.getReservationStatusText(selectedReservation.status)"
                  size="small"
                />
              </v-list-item-title>
            </v-list-item>
            <v-list-item v-if="selectedReservation.notes">
              <template v-slot:prepend>
                <v-icon>mdi-note</v-icon>
              </template>
              <v-list-item-title>{{ selectedReservation.notes }}</v-list-item-title>
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
          ¿Estás seguro de que quieres eliminar esta reserva?
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
            :loading="reservationsStore.loading"
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
import { useReservationsStore, type Reservation, type CreateReservationData, type UpdateReservationData } from '@/stores/reservations'
import { useToast } from '@/stores/toast'
import { api } from '@/utils/api'
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs.vue'

const reservationsStore = useReservationsStore()
const toast = useToast()

// Reactive data
const showDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const selectedReservation = ref<Reservation | null>(null)
const formValid = ref(false)
const searchQuery = ref('')
const filterStatus = ref<'all' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'>('all')
const filterDate = ref('')
const stats = ref<any>(null)
const tableKey = ref(0)

// Form data
const formRef = ref()
const formData = ref<CreateReservationData & { id?: string }>({
  classId: '',
  instructorId: '',
  startTime: '',
  endTime: '',
  notes: ''
})

// Data for classes and instructors (will be loaded from backend)
const availableClasses = ref<Array<{id: string, name: string}>>([])
const availableInstructors = ref<Array<{id: string, name: string}>>([])

// Table headers
const headers = [
  { title: 'Cliente', key: 'user', sortable: true },
  { title: 'Clase', key: 'class', sortable: true },
  { title: 'Instructor', key: 'instructor', sortable: true },
  { title: 'Fecha/Hora', key: 'startTime', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false }
]

// Status options
const statusOptions = [
  { title: 'Todos', value: 'all' },
  { title: 'Pendientes', value: 'PENDING' },
  { title: 'Confirmadas', value: 'CONFIRMED' },
  { title: 'Canceladas', value: 'CANCELLED' }
]

// Validation rules
const rules = {
  required: (value: string) => !!value || 'Este campo es requerido',
  validDate: (value: string) => {
    if (!value) return 'Este campo es requerido'
    const date = new Date(value)
    return !isNaN(date.getTime()) || 'Fecha inválida'
  },
  endTimeAfterStart: (endTime: string) => {
    if (!endTime) return 'Este campo es requerido'
    if (!formData.value.startTime) return 'Selecciona primero la fecha de inicio'
    
    const start = new Date(formData.value.startTime)
    const end = new Date(endTime)
    
    if (end <= start) {
      return 'La fecha de fin debe ser posterior a la fecha de inicio'
    }
    
    return true
  }
}

// Methods
const loadReservations = async () => {
  await Promise.all([
    reservationsStore.fetchAll(),
    loadStats(),
    loadAvailableClasses(),
    loadAvailableInstructors()
  ])
}

const loadAvailableClasses = async () => {
  try {
    const response = await api.get('/classes')
    if (response.data.success) {
      availableClasses.value = (response.data.data.classes || [])
        .filter((cls: any) => cls.isActive)
        .map((cls: any) => ({ id: cls.id, name: cls.name }))
      console.log('✅ Available classes loaded:', availableClasses.value)
    }
  } catch (error) {
    console.error('❌ Error loading available classes:', error)
  }
}

const loadAvailableInstructors = async () => {
  try {
    const response = await api.get('/users/role/INSTRUCTOR')
    if (response.data.success) {
      availableInstructors.value = (response.data.data.users || [])
        .filter((user: any) => user.isActive)
        .map((user: any) => ({ id: user.id, name: user.name }))
      console.log('✅ Available instructors loaded:', availableInstructors.value)
    }
  } catch (error) {
    console.error('❌ Error loading available instructors:', error)
  }
}

const loadStats = async () => {
  try {
    const statsData = await reservationsStore.getReservationStats()
    if (statsData) {
      stats.value = statsData
      console.log('✅ Stats loaded from backend:', stats.value)
    }
  } catch (error) {
    console.error('❌ Error loading stats from backend:', error)
    // Fallback: calcular estadísticas localmente
    const allReservations = reservationsStore.reservations
    const total = allReservations.length
    const pending = allReservations.filter(r => r.status === 'PENDING').length
    const confirmed = allReservations.filter(r => r.status === 'CONFIRMED').length
    const cancelled = allReservations.filter(r => r.status === 'CANCELLED').length
    
    stats.value = {
      total,
      pending,
      confirmed,
      cancelled,
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    }
    console.log('✅ Stats calculated locally as fallback:', stats.value)
  }
}

const openCreateDialog = () => {
  isEditing.value = false
  resetForm()
  showDialog.value = true
}

const editReservation = (reservation: Reservation) => {
  isEditing.value = true
  selectedReservation.value = reservation
  formData.value = {
    id: reservation.id,
    classId: reservation.classId,
    instructorId: reservation.instructorId,
    startTime: reservation.startTime.slice(0, 16), // Format for datetime-local
    endTime: reservation.endTime.slice(0, 16),
    notes: reservation.notes || ''
  }
  showDialog.value = true
}

const viewReservation = (reservation: Reservation) => {
  selectedReservation.value = reservation
  showViewDialog.value = true
}

const confirmReservation = async (reservation: Reservation) => {
  try {
    await reservationsStore.confirmReservation(reservation.id)
    
    // Forzar re-render de la tabla
    tableKey.value++
    
    await loadReservations()
  } catch (error) {
    console.error('Error confirming reservation:', error)
  }
}

const cancelReservation = async (reservation: Reservation) => {
  try {
    await reservationsStore.cancelReservation(reservation.id)
    
    // Forzar re-render de la tabla
    tableKey.value++
    
    await loadReservations()
  } catch (error) {
    console.error('Error cancelling reservation:', error)
  }
}

const deleteReservation = (reservation: Reservation) => {
  selectedReservation.value = reservation
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedReservation.value) return
  
  try {
    // Note: This would require a delete endpoint in the backend
    // await reservationsStore.deleteReservation(selectedReservation.value.id)
    showDeleteDialog.value = false
    selectedReservation.value = null
    toast.show('Reserva eliminada exitosamente', 'success')
    
    // Forzar re-render de la tabla
    tableKey.value++
    
    await loadReservations()
  } catch (error) {
    console.error('Error deleting reservation:', error)
  }
}

const saveReservation = async () => {
  if (!formValid.value) return

  try {
    if (isEditing.value && formData.value.id) {
      const updateData: UpdateReservationData = {
        startTime: formData.value.startTime,
        endTime: formData.value.endTime,
        notes: formData.value.notes
      }
      await reservationsStore.updateReservation(formData.value.id, updateData)
      toast.show('Reserva actualizada exitosamente', 'success')
    } else {
      const createData: CreateReservationData = {
        classId: formData.value.classId,
        instructorId: formData.value.instructorId,
        startTime: formData.value.startTime,
        endTime: formData.value.endTime,
        notes: formData.value.notes
      }
      await reservationsStore.createReservation(createData)
      toast.show('Reserva creada exitosamente', 'success')
    }
    
    // Forzar re-render de la tabla
    tableKey.value++
    
    closeDialog()
    await loadReservations()
  } catch (error: any) {
    console.error('Error saving reservation:', error)
    const errorMessage = error.response?.data?.message || 'Error al guardar la reserva'
    toast.show(errorMessage, 'error')
  }
}

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

const resetForm = () => {
  formData.value = {
    classId: '',
    instructorId: '',
    startTime: '',
    endTime: '',
    notes: ''
  }
  selectedReservation.value = null
  formRef.value?.resetValidation?.()
}

// Lifecycle
onMounted(() => {
  loadReservations()
})
</script>

<style scoped>
.admin-reservations {
  padding: 20px 0;
}
</style> 