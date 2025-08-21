<template>
  <div class="admin-memberships">
    <v-container fluid>
      <!-- Header -->
      <v-row>
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <h1 class="text-h4 font-weight-bold">Gestión de Membresías</h1>
              <p class="text-subtitle-1 text-medium-emphasis">
                Administra todas las membresías del gimnasio
              </p>
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateDialog"
              :loading="membershipsStore.loading"
            >
              Nueva Membresía
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
                <v-icon color="primary" size="large" class="mr-3">mdi-card-membership</v-icon>
                <div>
                  <div class="text-h6">{{ stats?.total || 0 }}</div>
                  <div class="text-caption">Total Membresías</div>
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
                  <div class="text-caption">Activas</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon color="warning" size="large" class="mr-3">mdi-clock-alert</v-icon>
                <div>
                  <div class="text-h6">{{ stats?.expired || 0 }}</div>
                  <div class="text-caption">Expiradas</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon color="error" size="large" class="mr-3">mdi-close-circle</v-icon>
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
                    label="Buscar membresías..."
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:model-value="membershipsStore.searchMemberships"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filterType"
                    :items="typeOptions"
                    label="Tipo"
                    variant="outlined"
                    density="compact"
                    @update:model-value="membershipsStore.setFilterType"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filterStatus"
                    :items="statusOptions"
                    label="Estado"
                    variant="outlined"
                    density="compact"
                    @update:model-value="membershipsStore.setFilterStatus"
                  />
                </v-col>
                <v-col cols="12" md="2">
                  <v-btn
                    variant="outlined"
                    @click="membershipsStore.clearFilters"
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

      <!-- Memberships Table -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-data-table
              :headers="headers"
              :items="membershipsStore.filteredMemberships"
              :loading="membershipsStore.loading"
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

              <!-- Type Column -->
              <template v-slot:item.type="{ item }">
                <v-chip
                  :color="getTypeColor(item.type)"
                  :text="getTypeName(item.type)"
                  size="small"
                />
              </template>

              <!-- Status Column -->
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  :text="getStatusText(item.status)"
                  size="small"
                />
              </template>

              <!-- Dates Column -->
              <template v-slot:item.startDate="{ item }">
                <div>
                  <div class="font-weight-medium">{{ formatDate(item.startDate) }}</div>
                  <div class="text-caption">Inicio</div>
                </div>
              </template>

              <template v-slot:item.endDate="{ item }">
                <div>
                  <div class="font-weight-medium">{{ formatDate(item.endDate) }}</div>
                  <div class="text-caption">Fin</div>
                </div>
              </template>

              <!-- Price Column -->
              <template v-slot:item.price="{ item }">
                <div class="font-weight-medium">${{ item.price }}</div>
              </template>

              <!-- Actions Column -->
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon="mdi-eye"
                  variant="text"
                  size="small"
                  color="primary"
                  @click="viewMembership(item)"
                />
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  size="small"
                  color="warning"
                  @click="editMembership(item)"
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
                    <v-list-item @click="renewMembership(item)">
                      <template v-slot:prepend>
                        <v-icon color="success">mdi-refresh</v-icon>
                      </template>
                      <v-list-item-title>Renovar</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="changeType(item)">
                      <template v-slot:prepend>
                        <v-icon color="info">mdi-swap-horizontal</v-icon>
                      </template>
                      <v-list-item-title>Cambiar Tipo</v-list-item-title>
                    </v-list-item>
                                        <v-list-item
                      v-if="item.status !== 'CANCELLED'"
                      @click="openCancelDialog(item)"
                    >
                      <template v-slot:prepend>
                        <v-icon color="error">mdi-close</v-icon>
                      </template>
                      <v-list-item-title>Cancelar</v-list-item-title>
                    </v-list-item>

                  </v-list>
                </v-menu>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- Pagination -->
      <v-row v-if="membershipsStore.totalPages > 1">
        <v-col cols="12" class="d-flex justify-center">
          <v-pagination
            v-model="membershipsStore.currentPage"
            :length="membershipsStore.totalPages"
            @update:model-value="loadMemberships"
          />
        </v-col>
      </v-row>
    </v-container>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          {{ isEditing ? 'Editar Membresía' : 'Nueva Membresía' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.userId"
                  :items="availableUsers"
                  item-title="name"
                  item-value="id"
                  label="Usuario"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.type"
                  :items="typeOptions"
                  label="Tipo"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.startDate"
                  label="Fecha de inicio"
                  type="date"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.endDate"
                  label="Fecha de fin"
                  type="date"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.price"
                  label="Precio"
                  type="number"
                  step="0.01"
                  variant="outlined"
                  :rules="[rules.required, rules.price]"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.status"
                  :items="statusOptions"
                  label="Estado"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                  clearable
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn
            variant="outlined"
            @click="clearForm"
          >
            Limpiar
          </v-btn>
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="closeDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="saveMembership"
            :loading="membershipsStore.loading"
            :disabled="!formValid"
          >
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Membership Dialog -->
    <v-dialog v-model="showViewDialog" max-width="500px">
      <v-card v-if="selectedMembership">
        <v-card-title>
          Detalles de la Membresía
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-account</v-icon>
              </template>
              <v-list-item-title>{{ selectedMembership.user?.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ selectedMembership.user?.email }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-card-membership</v-icon>
              </template>
              <v-list-item-title>
                <v-chip
                  :color="getTypeColor(selectedMembership.type)"
                  :text="getTypeName(selectedMembership.type)"
                  size="small"
                />
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-circle</v-icon>
              </template>
              <v-list-item-title>
                <v-chip
                  :color="getStatusColor(selectedMembership.status)"
                  :text="getStatusText(selectedMembership.status)"
                  size="small"
                />
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-calendar-start</v-icon>
              </template>
              <v-list-item-title>{{ formatDate(selectedMembership.startDate) }}</v-list-item-title>
              <v-list-item-subtitle>Fecha de inicio</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-calendar-end</v-icon>
              </template>
              <v-list-item-title>{{ formatDate(selectedMembership.endDate) }}</v-list-item-title>
              <v-list-item-subtitle>Fecha de fin</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-currency-usd</v-icon>
              </template>
              <v-list-item-title>${{ selectedMembership.price }}</v-list-item-title>
              <v-list-item-subtitle>Precio</v-list-item-subtitle>
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

    <!-- Renewal Dialog -->
    <v-dialog v-model="showRenewalDialog" max-width="400px">
      <v-card>
        <v-card-title>Renovar Membresía</v-card-title>
        <v-card-text>
          <p class="mb-4">¿Por cuántos meses quieres renovar la membresía?</p>
          <v-select
            v-model="renewalMonths"
            :items="[1, 3, 6, 12]"
            label="Meses"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showRenewalDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="confirmRenewal"
            :loading="membershipsStore.loading"
          >
            Renovar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Change Type Dialog -->
    <v-dialog v-model="showTypeDialog" max-width="400px">
      <v-card>
        <v-card-title>Cambiar Tipo</v-card-title>
        <v-card-text>
          <p class="mb-4">Selecciona el nuevo tipo de membresía:</p>
          <v-select
            v-model="newType"
            :items="typeOptions"
            label="Nuevo tipo"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showTypeDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="confirmChangeType"
            :loading="membershipsStore.loading"
          >
            Cambiar Tipo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirmar Cancelación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que quieres cancelar esta membresía?
          Esta acción cambiará el estado a "Cancelada" pero mantendrá el historial.
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
            color="warning"
            @click="confirmDelete"
            :loading="membershipsStore.loading"
          >
            Cancelar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMembershipsStore, type Membership, type CreateMembershipData, type UpdateMembershipData } from '@/stores/memberships'
import { useToast } from '@/stores/toast'
import { api } from '@/utils/api'

const membershipsStore = useMembershipsStore()
const toast = useToast()

// Reactive data
const showDialog = ref(false)
const showViewDialog = ref(false)
const showRenewalDialog = ref(false)
const showTypeDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const selectedMembership = ref<Membership | null>(null)
const formValid = ref(false)
const searchQuery = ref('')
const filterType = ref<'all' | 'BASIC' | 'PREMIUM' | 'UNLIMITED'>('all')
const filterStatus = ref<'all' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'>('all')
const renewalMonths = ref(1)
const newType = ref<'BASIC' | 'PREMIUM' | 'UNLIMITED'>('BASIC')
const stats = ref<any>(null)

// Form data
const formRef = ref()
const formData = ref<CreateMembershipData & { id?: string; status?: string }>({
  userId: '',
  type: 'BASIC',
  startDate: '',
  endDate: '',
  price: 0,
  status: 'ACTIVE'
})

// Usuarios reales de la base de datos
const availableUsers = ref<Array<{ id: string; name: string; email: string }>>([])

// Cargar usuarios desde la base de datos
const loadUsers = async () => {
  try {
    console.log('🔄 Iniciando carga de usuarios...')
    const response = await api.get('/users', { timeout: 10000 })
    if (response.data.success) {
      availableUsers.value = response.data.data.users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email
      }))
      console.log('✅ Usuarios cargados:', availableUsers.value.length)
    }
  } catch (error) {
    console.error('❌ Error cargando usuarios:', error)
  }
}

// Table headers
const headers = [
  { title: 'Usuario', key: 'user', sortable: true },
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Inicio', key: 'startDate', sortable: true },
  { title: 'Fin', key: 'endDate', sortable: true },
  { title: 'Precio', key: 'price', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false }
]

// Options para el formulario (sin 'Todos')
const typeOptions = [
  { title: 'Básico', value: 'BASIC' },
  { title: 'Premium', value: 'PREMIUM' },
  { title: 'Ilimitado', value: 'UNLIMITED' }
]

const statusOptions = [
  { title: 'Activa', value: 'ACTIVE' },
  { title: 'Expirada', value: 'EXPIRED' },
  { title: 'Cancelada', value: 'CANCELLED' }
]

// Options para filtros (con 'Todos')
const filterTypeOptions = [
  { title: 'Todos', value: 'all' },
  { title: 'Básico', value: 'BASIC' },
  { title: 'Premium', value: 'PREMIUM' },
  { title: 'Ilimitado', value: 'UNLIMITED' }
]

const filterStatusOptions = [
  { title: 'Todos', value: 'all' },
  { title: 'Activa', value: 'ACTIVE' },
  { title: 'Expirada', value: 'EXPIRED' },
  { title: 'Cancelada', value: 'CANCELLED' }
]

// Validation rules
const rules = {
  required: (value: string) => !!value || 'Este campo es requerido',
  price: (value: number) => value > 0 || 'El precio debe ser mayor a 0'
}

// Methods
const loadMemberships = async () => {
  try {
    console.log('🔄 Iniciando carga de membresías...')
    await membershipsStore.fetchMemberships(membershipsStore.currentPage)
    console.log('✅ Membresías cargadas')
    await loadStats()
    console.log('✅ Stats cargados')
  } catch (error) {
    console.error('Error loading memberships:', error)
  }
}

const loadStats = async () => {
  const statsData = await membershipsStore.getMembershipStats()
  if (statsData) {
    stats.value = statsData
  }
}

const openCreateDialog = () => {
  isEditing.value = false
  clearForm()
  showDialog.value = true
}

const editMembership = (membership: Membership) => {
  isEditing.value = true
  selectedMembership.value = membership
  formData.value = {
    id: membership.id,
    userId: membership.userId,
    type: membership.type,
    startDate: membership.startDate.split('T')[0],
    endDate: membership.endDate.split('T')[0],
    price: membership.price,
    status: membership.status
  }
  showDialog.value = true
}

const viewMembership = (membership: Membership) => {
  selectedMembership.value = membership
  showViewDialog.value = true
}

const renewMembership = (membership: Membership) => {
  selectedMembership.value = membership
  showRenewalDialog.value = true
}

const confirmRenewal = async () => {
  if (!selectedMembership.value) return

  try {
    await membershipsStore.renewMembership(selectedMembership.value.id, renewalMonths.value)
    showRenewalDialog.value = false
    selectedMembership.value = null
    await loadMemberships()
    toast.show('Membresía renovada exitosamente', 'success')
  } catch (error) {
    console.error('Error renewing membership:', error)
  }
}

const changeType = (membership: Membership) => {
  selectedMembership.value = membership
  newType.value = membership.type
  showTypeDialog.value = true
}

const confirmChangeType = async () => {
  if (!selectedMembership.value) return

  try {
    await membershipsStore.changeMembershipType(selectedMembership.value.id, newType.value)
    showTypeDialog.value = false
    selectedMembership.value = null
    await loadMemberships()
    toast.show('Tipo de membresía cambiado exitosamente', 'success')
  } catch (error) {
    console.error('Error changing membership type:', error)
  }
}

const cancelMembership = async (membership: Membership) => {
  try {
    await membershipsStore.cancelMembership(membership.id)
    await loadMemberships()
    toast.show('Membresía cancelada exitosamente', 'success')
  } catch (error) {
    console.error('Error cancelling membership:', error)
  }
}

const openCancelDialog = (membership: Membership) => {
  selectedMembership.value = membership
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedMembership.value) return
  
  try {
    await membershipsStore.cancelMembership(selectedMembership.value.id)
    showDeleteDialog.value = false
    selectedMembership.value = null
    await loadMemberships()
    toast.show('Membresía cancelada exitosamente', 'success')
  } catch (error) {
    console.error('Error canceling membership:', error)
    toast.show('Error al cancelar la membresía', 'error')
  }
}

const saveMembership = async () => {
  if (!formValid.value) return

  console.log('🔍 saveMembership - Datos del formulario:', formData.value)

  try {
    if (isEditing.value && formData.value.id) {
      const updateData: UpdateMembershipData = {
        type: formData.value.type,
        startDate: new Date(formData.value.startDate).toISOString(),
        endDate: new Date(formData.value.endDate).toISOString(),
        price: Number(formData.value.price),
        status: formData.value.status as any
      }
      console.log('📝 Actualizando membresía:', updateData)
      console.log('📅 Fechas convertidas - Inicio:', updateData.startDate, 'Fin:', updateData.endDate)
      await membershipsStore.updateMembership(formData.value.id, updateData)
      toast.show('Membresía actualizada exitosamente', 'success')
    } else {
      const createData: CreateMembershipData = {
        userId: formData.value.userId,
        type: formData.value.type,
        startDate: new Date(formData.value.startDate).toISOString(),
        endDate: new Date(formData.value.endDate).toISOString(),
        price: Number(formData.value.price)
      }
      console.log('📝 Creando membresía:', createData)
      console.log('📅 Fechas convertidas - Inicio:', createData.startDate, 'Fin:', createData.endDate)
      await membershipsStore.createMembership(createData)
      toast.show('Membresía creada exitosamente', 'success')
    }
    
    await loadMemberships()
    showDialog.value = false
    clearForm()
  } catch (error) {
    console.error('❌ Error saving membership:', error)
    toast.show('Error al guardar la membresía', 'error')
  }
}

const closeDialog = () => {
  showDialog.value = false
  clearForm()
}

const clearForm = () => {
  formData.value = {
    userId: '',
    type: 'BASIC',
    startDate: '',
    endDate: '',
    price: 0,
    status: 'ACTIVE'
  }
  selectedMembership.value = null
}

// Helper methods
const getTypeName = (type: string) => {
  const names = {
    BASIC: 'Básico',
    PREMIUM: 'Premium',
    UNLIMITED: 'Ilimitado'
  }
  return names[type as keyof typeof names] || type
}

const getTypeColor = (type: string) => {
  const colors = {
    BASIC: 'primary',
    PREMIUM: 'warning',
    UNLIMITED: 'error'
  }
  return colors[type as keyof typeof colors] || 'primary'
}

const getStatusText = (status: string) => {
  const texts = {
    ACTIVE: 'Activa',
    EXPIRED: 'Expirada',
    CANCELLED: 'Cancelada'
  }
  return texts[status as keyof typeof texts] || status
}

const getStatusColor = (status: string) => {
  const colors = {
    ACTIVE: 'success',
    EXPIRED: 'warning',
    CANCELLED: 'error'
  }
  return colors[status as keyof typeof colors] || 'grey'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES')
}

// Lifecycle
onMounted(async () => {
  try {
    await loadMemberships()
    await loadUsers()
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
})
</script>

<style scoped>
.admin-memberships {
  padding: 20px 0;
}
</style> 