<template>
  <div class="admin-payments">
    <v-container fluid>
      <!-- Breadcrumbs de navegación -->
      <AdminBreadcrumbs current-module="Gestión de Pagos" />
      
      <!-- Header -->
      <v-row>
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <h1 class="text-h4 font-weight-bold">Gestión de Pagos</h1>
              <p class="text-subtitle-1 text-medium-emphasis">
                Administra todos los pagos del gimnasio
              </p>
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateDialog"
              :loading="paymentsStore.loading"
            >
              Nuevo Pago
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
                <v-icon color="primary" size="large" class="mr-3">mdi-credit-card</v-icon>
                <div>
                  <div class="text-h6">{{ stats.total }}</div>
                  <div class="text-caption">Total Pagos</div>
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
                  <div class="text-h6">{{ stats.completed }}</div>
                  <div class="text-caption">Completados</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon color="warning" size="large" class="mr-3">mdi-clock</v-icon>
                <div>
                  <div class="text-h6">{{ stats.pending }}</div>
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
                <v-icon color="info" size="large" class="mr-3">mdi-currency-usd</v-icon>
                <div>
                  <div class="text-h6">${{ stats.revenue }}</div>
                  <div class="text-caption">Ingresos</div>
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
                    label="Buscar pagos..."
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:model-value="handleSearch"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filterStatus"
                    :items="statusOptions"
                    label="Estado"
                    variant="outlined"
                    density="compact"
                    @update:model-value="handleStatusFilter"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filterMethod"
                    :items="methodOptions"
                    label="Método de Pago"
                    variant="outlined"
                    density="compact"
                    @update:model-value="handleMethodFilter"
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

      <!-- Payments Table -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-data-table
              :headers="headers"
              :items="paymentsStore.items"
              :loading="paymentsStore.loading"
              :search="searchQuery"
              class="elevation-1"
            >
              <!-- Amount column -->
              <template v-slot:item.amount="{ item }">
                <span class="font-weight-bold">${{ item.amount }}</span>
              </template>

              <!-- Status column -->
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  size="small"
                  variant="flat"
                >
                  {{ getStatusLabel(item.status) }}
                </v-chip>
              </template>

              <!-- Method column -->
              <template v-slot:item.method="{ item }">
                <v-chip
                  :color="getMethodColor(item.method)"
                  size="small"
                  variant="outlined"
                >
                  {{ item.method || 'CREDIT_CARD' }}
                </v-chip>
              </template>

              <!-- Date column -->
              <template v-slot:item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>

              <!-- Actions column -->
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  @click="viewPayment(item)"
                  color="info"
                />
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="editPayment(item)"
                  color="primary"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  @click="deletePayment(item)"
                  color="error"
                />
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ isEditing ? 'Editar Pago' : 'Nuevo Pago' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.userId"
                  label="ID de Usuario"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.membershipId"
                  label="ID de Membresía"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.amount"
                  label="Monto"
                  variant="outlined"
                  type="number"
                  step="0.01"
                  :rules="[rules.required, rules.positive]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.method"
                  :items="methodOptions"
                  label="Método de Pago"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.status"
                  :items="statusOptions"
                  label="Estado"
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
            @click="savePayment"
            :loading="paymentsStore.loading"
            :disabled="!formValid"
          >
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Dialog -->
    <v-dialog v-model="showViewDialog" max-width="500px">
      <v-card>
        <v-card-title>Detalles del Pago</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-title>Usuario</v-list-item-title>
              <v-list-item-subtitle>{{ selectedPayment?.userId }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Monto</v-list-item-title>
              <v-list-item-subtitle>${{ selectedPayment?.amount }}</v-list-item-subtitle>
            </v-list-item>
                        <v-list-item>
              <v-list-item-title>Método</v-list-item-title>
              <v-list-item-subtitle>{{ selectedPayment?.method || 'CREDIT_CARD' }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Estado</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip
                  :color="getStatusColor(selectedPayment?.status || 'PENDING')"
                  size="small"
                >
                  {{ getStatusLabel(selectedPayment?.status || 'PENDING') }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Descripción</v-list-item-title>
              <v-list-item-subtitle>{{ selectedPayment?.description || 'Sin descripción' }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Fecha</v-list-item-title>
              <v-list-item-subtitle>{{ formatDate(selectedPayment?.createdAt || '') }}</v-list-item-subtitle>
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
          ¿Estás seguro de que quieres eliminar este pago?
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
            :loading="paymentsStore.loading"
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
import { usePaymentsStore, type Payment, type CreatePaymentData, type UpdatePaymentData } from '@/stores/payments'
import { useToast } from '@/stores/toast'
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs.vue'

const paymentsStore = usePaymentsStore()
const toast = useToast()

// Reactive data
const showDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const selectedPayment = ref<Payment | null>(null)
const formValid = ref(false)
const searchQuery = ref('')
const filterStatus = ref<'all' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'>('all')
const filterMethod = ref<'all' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'PAYPAL'>('all')

  // Form data
  const form = ref<CreatePaymentData & { id?: string }>({
    userId: '',
    membershipId: '',
    amount: 0,
    method: 'CREDIT_CARD',
    status: 'PENDING',
    description: ''
  })

// Table headers
const headers = [
  { title: 'Usuario', key: 'userId', sortable: true },
  { title: 'Membresía', key: 'membershipId', sortable: true },
  { title: 'Monto', key: 'amount', sortable: true },
  { title: 'Método', key: 'method', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Descripción', key: 'description', sortable: false },
  { title: 'Fecha', key: 'createdAt', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false }
]

// Status options
const statusOptions = [
  { title: 'Todos', value: 'all' },
  { title: 'Pendiente', value: 'PENDING' },
  { title: 'Completado', value: 'COMPLETED' },
  { title: 'Fallido', value: 'FAILED' },
  { title: 'Reembolsado', value: 'REFUNDED' }
]

// Method options
const methodOptions = [
  { title: 'Tarjeta de Crédito', value: 'CREDIT_CARD' },
  { title: 'Tarjeta de Débito', value: 'DEBIT_CARD' },
  { title: 'Transferencia Bancaria', value: 'BANK_TRANSFER' },
  { title: 'Efectivo', value: 'CASH' },
  { title: 'PayPal', value: 'PAYPAL' }
]

// Validation rules
const rules = {
  required: (value: string) => !!value || 'Este campo es requerido',
  positive: (value: string) => parseFloat(value) > 0 || 'El monto debe ser mayor a 0'
}

// Computed
const stats = computed(() => ({
  total: paymentsStore.items.length,
  completed: paymentsStore.completedPayments.length,
  pending: paymentsStore.pendingPayments.length,
  revenue: paymentsStore.totalRevenue.toFixed(2)
}))

// Methods
const loadPayments = async () => {
  await paymentsStore.fetchPayments()
}

const handleSearch = (query: string) => {
  // La búsqueda se maneja automáticamente con v-data-table
  console.log('🔍 Búsqueda:', query)
}

const handleStatusFilter = (status: string) => {
  // Los filtros se manejan automáticamente con v-data-table
  console.log('🔍 Filtro de estado:', status)
}

const handleMethodFilter = (method: string) => {
  // Los filtros se manejan automáticamente con v-data-table
  console.log('🔍 Filtro de método:', method)
}

const clearFilters = () => {
  // Los filtros se manejan automáticamente con v-data-table
  console.log('🧹 Limpiando filtros')
}

const openCreateDialog = () => {
  isEditing.value = false
  resetForm()
  showDialog.value = true
}

const editPayment = (payment: Payment) => {
  isEditing.value = true
  selectedPayment.value = payment
      form.value = {
      id: payment.id,
      userId: payment.userId,
      membershipId: payment.membershipId || '',
      amount: payment.amount,
      method: 'CREDIT_CARD', // Default method for editing
      status: payment.status,
      description: payment.description || ''
    }
  showDialog.value = true
}

const viewPayment = (payment: Payment) => {
  selectedPayment.value = payment
  showViewDialog.value = true
}

const deletePayment = (payment: Payment) => {
  selectedPayment.value = payment
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedPayment.value) return
  
  try {
    await paymentsStore.delete(selectedPayment.value.id)
    showDeleteDialog.value = false
    selectedPayment.value = null
    await loadPayments()
    toast.show('Pago eliminado exitosamente', 'success')
  } catch (error) {
    console.error('Error deleting payment:', error)
    toast.show('Error al eliminar el pago', 'error')
  }
}

const savePayment = async () => {
  if (!formValid.value) return

  try {
    if (isEditing.value && form.value.id) {
      const updateData: UpdatePaymentData = {
        userId: form.value.userId,
        membershipId: form.value.membershipId,
        amount: form.value.amount,
        method: form.value.method,
        status: form.value.status,
        description: form.value.description
      }
      await paymentsStore.update(form.value.id, updateData)
      toast.show('Pago actualizado exitosamente', 'success')
    } else {
      const createData: CreatePaymentData = {
        userId: form.value.userId,
        membershipId: form.value.membershipId,
        amount: form.value.amount,
        method: form.value.method,
        status: form.value.status,
        description: form.value.description
      }
      await paymentsStore.create(createData)
      toast.show('Pago creado exitosamente', 'success')
    }
    
    closeDialog()
    await loadPayments()
  } catch (error) {
    console.error('Error saving payment:', error)
    toast.show('Error al guardar el pago', 'error')
  }
}

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    userId: '',
    membershipId: '',
    amount: 0,
    method: 'CREDIT_CARD',
    status: 'PENDING',
    description: ''
  }
  selectedPayment.value = null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES')
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'success'
    case 'PENDING': return 'warning'
    case 'FAILED': return 'error'
    case 'REFUNDED': return 'info'
    default: return 'default'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'Completado'
    case 'PENDING': return 'Pendiente'
    case 'FAILED': return 'Fallido'
    case 'REFUNDED': return 'Reembolsado'
    default: return status
  }
}

const getMethodColor = (method: string) => {
  switch (method) {
    case 'CREDIT_CARD': return 'success'
    case 'DEBIT_CARD': return 'primary'
    case 'BANK_TRANSFER': return 'info'
    case 'CASH': return 'warning'
    case 'PAYPAL': return 'blue'
    default: return 'default'
  }
}

// Lifecycle
onMounted(async () => {
  await paymentsStore.init()
  await loadPayments()
})
</script>

<style scoped>
.admin-payments {
  padding: 20px 0;
}
</style>
