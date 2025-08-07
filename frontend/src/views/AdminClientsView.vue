<template>
  <div class="admin-clients">
    <v-container fluid>
      <!-- Header -->
      <v-row>
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <h1 class="text-h4 font-weight-bold">Gestión de Clientes</h1>
              <p class="text-subtitle-1 text-medium-emphasis">
                Administra todos los clientes del gimnasio
              </p>
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateDialog"
              :loading="clientsStore.loading"
            >
              Nuevo Cliente
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Stats Cards -->
      <v-row>
        <v-col cols="12" sm="4">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon color="primary" size="large" class="mr-3">mdi-account-group</v-icon>
                <div>
                  <div class="text-h6">{{ stats.total }}</div>
                  <div class="text-caption">Total Clientes</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon color="success" size="large" class="mr-3">mdi-account-check</v-icon>
                <div>
                  <div class="text-h6">{{ stats.active }}</div>
                  <div class="text-caption">Clientes Activos</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon color="warning" size="large" class="mr-3">mdi-account-off</v-icon>
                <div>
                  <div class="text-h6">{{ stats.inactive }}</div>
                  <div class="text-caption">Clientes Inactivos</div>
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
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="searchQuery"
                    prepend-inner-icon="mdi-magnify"
                    label="Buscar clientes..."
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:model-value="clientsStore.searchClients"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filterStatus"
                    :items="statusOptions"
                    label="Estado"
                    variant="outlined"
                    density="compact"
                    @update:model-value="clientsStore.setFilterStatus"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-btn
                    variant="outlined"
                    @click="clientsStore.clearFilters"
                    prepend-icon="mdi-filter-remove"
                  >
                    Limpiar Filtros
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Clients Table -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-data-table
              :headers="headers"
              :items="clientsStore.filteredClients"
              :loading="clientsStore.loading"
              :items-per-page="10"
              class="elevation-1"
            >
              <!-- Status Column -->
              <template v-slot:item.isActive="{ item }">
                <v-chip
                  :color="item.isActive ? 'success' : 'error'"
                  :text="item.isActive ? 'Activo' : 'Inactivo'"
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
                  @click="viewClient(item)"
                />
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  size="small"
                  color="warning"
                  @click="editClient(item)"
                />
                <v-btn
                  :icon="item.isActive ? 'mdi-account-off' : 'mdi-account-check'"
                  variant="text"
                  size="small"
                  :color="item.isActive ? 'error' : 'success'"
                  @click="toggleClientStatus(item)"
                />
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  @click="deleteClient(item)"
                />
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- Pagination -->
      <v-row v-if="clientsStore.totalPages > 1">
        <v-col cols="12" class="d-flex justify-center">
          <v-pagination
            v-model="clientsStore.currentPage"
            :length="clientsStore.totalPages"
            @update:model-value="loadClients"
          />
        </v-col>
      </v-row>
    </v-container>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ isEditing ? 'Editar Cliente' : 'Nuevo Cliente' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.name"
                  label="Nombre completo"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  :rules="[rules.required, rules.email]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.phone"
                  label="Teléfono"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.dateOfBirth"
                  label="Fecha de nacimiento"
                  type="date"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.address"
                  label="Dirección"
                  variant="outlined"
                  rows="2"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.emergencyContact"
                  label="Contacto de emergencia"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.emergencyPhone"
                  label="Teléfono de emergencia"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" v-if="!isEditing">
                <v-text-field
                  v-model="form.password"
                  label="Contraseña"
                  type="password"
                  variant="outlined"
                  :rules="[rules.required, rules.password]"
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
            @click="saveClient"
            :loading="clientsStore.loading"
            :disabled="!formValid"
          >
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Client Dialog -->
    <v-dialog v-model="showViewDialog" max-width="500px">
      <v-card v-if="selectedClient">
        <v-card-title>
          Detalles del Cliente
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-account</v-icon>
              </template>
              <v-list-item-title>{{ selectedClient.name }}</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-email</v-icon>
              </template>
              <v-list-item-title>{{ selectedClient.email }}</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="selectedClient.phone">
              <template v-slot:prepend>
                <v-icon>mdi-phone</v-icon>
              </template>
              <v-list-item-title>{{ selectedClient.phone }}</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="selectedClient.dateOfBirth">
              <template v-slot:prepend>
                <v-icon>mdi-calendar</v-icon>
              </template>
              <v-list-item-title>{{ formatDate(selectedClient.dateOfBirth) }}</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="selectedClient.address">
              <template v-slot:prepend>
                <v-icon>mdi-map-marker</v-icon>
              </template>
              <v-list-item-title>{{ selectedClient.address }}</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-circle</v-icon>
              </template>
              <v-list-item-title>
                <v-chip
                  :color="selectedClient.isActive ? 'success' : 'error'"
                  :text="selectedClient.isActive ? 'Activo' : 'Inactivo'"
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
          ¿Estás seguro de que quieres eliminar al cliente "{{ selectedClient?.name }}"?
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
            :loading="clientsStore.loading"
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
import { useClientsStore, type Client, type CreateClientData, type UpdateClientData } from '@/stores/clients'
import { useToast } from '@/stores/toast'

const clientsStore = useClientsStore()
const toast = useToast()

// Reactive data
const showDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const selectedClient = ref<Client | null>(null)
const formValid = ref(false)
const searchQuery = ref('')
const filterStatus = ref<'all' | 'active' | 'inactive'>('all')

// Form data
const form = ref<CreateClientData & { id?: string }>({
  name: '',
  email: '',
  password: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  emergencyContact: '',
  emergencyPhone: ''
})

// Table headers
const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Teléfono', key: 'phone', sortable: false },
  { title: 'Estado', key: 'isActive', sortable: true },
  { title: 'Fecha de registro', key: 'createdAt', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false }
]

// Status options
const statusOptions = [
  { title: 'Todos', value: 'all' },
  { title: 'Activos', value: 'active' },
  { title: 'Inactivos', value: 'inactive' }
]

// Validation rules
const rules = {
  required: (value: string) => !!value || 'Este campo es requerido',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Email inválido'
  },
  password: (value: string) => {
    if (value.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres'
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    }
    return true
  }
}

// Computed
const stats = computed(() => clientsStore.getClientStats())

// Methods
const loadClients = async () => {
  await clientsStore.fetchClients(clientsStore.currentPage)
}

const openCreateDialog = () => {
  isEditing.value = false
  resetForm()
  showDialog.value = true
}

const editClient = (client: Client) => {
  isEditing.value = true
  selectedClient.value = client
  form.value = {
    id: client.id,
    name: client.name,
    email: client.email,
    password: '',
    phone: client.phone || '',
    dateOfBirth: client.dateOfBirth || '',
    address: client.address || '',
    emergencyContact: client.emergencyContact || '',
    emergencyPhone: client.emergencyPhone || ''
  }
  showDialog.value = true
}

const viewClient = (client: Client) => {
  selectedClient.value = client
  showViewDialog.value = true
}

const toggleClientStatus = async (client: Client) => {
  try {
    await clientsStore.toggleClientStatus(client.id)
  } catch (error) {
    console.error('Error toggling client status:', error)
  }
}

const deleteClient = (client: Client) => {
  selectedClient.value = client
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedClient.value) return
  
  try {
    await clientsStore.deleteClient(selectedClient.value.id)
    showDeleteDialog.value = false
    selectedClient.value = null
  } catch (error) {
    console.error('Error deleting client:', error)
  }
}

const saveClient = async () => {
  if (!formValid.value) return

  try {
    if (isEditing.value && form.value.id) {
      const updateData: UpdateClientData = {
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone,
        dateOfBirth: form.value.dateOfBirth,
        address: form.value.address,
        emergencyContact: form.value.emergencyContact,
        emergencyPhone: form.value.emergencyPhone
      }
      await clientsStore.updateClient(form.value.id, updateData)
    } else {
      const createData: CreateClientData = {
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        phone: form.value.phone,
        dateOfBirth: form.value.dateOfBirth,
        address: form.value.address,
        emergencyContact: form.value.emergencyContact,
        emergencyPhone: form.value.emergencyPhone
      }
      await clientsStore.createClient(createData)
    }
    
    closeDialog()
    await loadClients()
  } catch (error) {
    console.error('Error saving client:', error)
  }
}

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: ''
  }
  selectedClient.value = null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES')
}

// Lifecycle
onMounted(() => {
  loadClients()
})
</script>

<style scoped>
.admin-clients {
  padding: 20px 0;
}
</style> 