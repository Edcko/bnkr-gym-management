<template>
  <div class="admin-employees">
    <v-container fluid>
      <!-- Header -->
      <v-row>
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <h1 class="text-h4 font-weight-bold">Gestión de Empleados</h1>
              <p class="text-subtitle-1 text-medium-emphasis">
                Administra todos los empleados del gimnasio
              </p>
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateDialog"
              :loading="employeesStore.loading"
            >
              Nuevo Empleado
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
                <v-icon color="primary" size="large" class="mr-3">mdi-account-group</v-icon>
                <div>
                  <div class="text-h6">{{ stats.total }}</div>
                  <div class="text-caption">Total Empleados</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon color="success" size="large" class="mr-3">mdi-account-check</v-icon>
                <div>
                  <div class="text-h6">{{ stats.active }}</div>
                  <div class="text-caption">Empleados Activos</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon color="info" size="large" class="mr-3">mdi-shield-crown</v-icon>
                <div>
                  <div class="text-h6">{{ stats.total }}</div>
                  <div class="text-caption">Total</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon color="warning" size="large" class="mr-3">mdi-dumbbell</v-icon>
                <div>
                  <div class="text-h6">{{ stats.instructors }}</div>
                  <div class="text-caption">Instructores</div>
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
                    label="Buscar empleados..."
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:model-value="handleSearch"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filterRole"
                    :items="roleOptions"
                    label="Rol"
                    variant="outlined"
                    density="compact"
                    @update:model-value="handleRoleFilter"
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
                <v-col cols="12" md="2">
                  <v-btn
                    variant="outlined"
                    @click="employeesStore.clearFilters"
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

      <!-- Employees Table -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-data-table
              :key="tableKey"
              :headers="headers"
              :items="employeesStore.filteredItems"
              :loading="employeesStore.loading"
              :items-per-page="10"
              class="elevation-1"
            >
              <!-- Role Column -->
              <template v-slot:item.role="{ item }">
                <v-chip
                  :color="getRoleColor(item.role)"
                  :text="getRoleLabel(item.role)"
                  size="small"
                />
              </template>

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
                  @click="viewEmployee(item)"
                />
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  size="small"
                  color="warning"
                  @click="editEmployee(item)"
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
                    <v-list-item @click="changeRole(item)">
                      <template v-slot:prepend>
                        <v-icon>mdi-account-switch</v-icon>
                      </template>
                      <v-list-item-title>Cambiar Rol</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="toggleEmployeeStatus(item)">
                      <template v-slot:prepend>
                        <v-icon>{{ item.isActive ? 'mdi-account-off' : 'mdi-account-check' }}</v-icon>
                      </template>
                      <v-list-item-title>
                        {{ item.isActive ? 'Desactivar' : 'Activar' }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item @click="deleteEmployee(item)" color="error">
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
      <v-row v-if="employeesStore.totalPages > 1">
        <v-col cols="12" class="d-flex justify-center">
          <v-pagination
            v-model="employeesStore.currentPage"
            :length="employeesStore.totalPages"
            @update:model-value="loadEmployees"
          />
        </v-col>
      </v-row>
    </v-container>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          {{ isEditing ? 'Editar Empleado' : 'Nuevo Empleado' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name"
                  label="Nombre completo"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  :rules="[rules.required, rules.email]"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.phone"
                  label="Teléfono"
                  variant="outlined"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.role"
                  :items="roleOptions"
                  label="Rol"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.dateOfBirth"
                  label="Fecha de nacimiento"
                  type="date"
                  variant="outlined"
                  clearable
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.address"
                  label="Dirección"
                  variant="outlined"
                  rows="2"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.emergencyContact"
                  label="Contacto de emergencia"
                  variant="outlined"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.emergencyPhone"
                  label="Teléfono de emergencia"
                  variant="outlined"
                  clearable
                />
              </v-col>
              <v-col cols="12" v-if="!isEditing">
                <v-text-field
                  v-model="formData.password"
                  label="Contraseña"
                  type="password"
                  variant="outlined"
                  :rules="[rules.required, rules.password]"
                  required
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
            @click="clearForm"
          >
            Limpiar
          </v-btn>
          <v-btn
            variant="outlined"
            @click="closeDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="saveEmployee"
            :loading="employeesStore.saving"
            :disabled="!formValid"
          >
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Employee Dialog -->
    <v-dialog v-model="showViewDialog" max-width="500px">
      <v-card v-if="selectedEmployee">
        <v-card-title>
          Detalles del Empleado
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-account</v-icon>
              </template>
              <v-list-item-title>{{ selectedEmployee.name }}</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-email</v-icon>
              </template>
              <v-list-item-title>{{ selectedEmployee.email }}</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="selectedEmployee.phone">
              <template v-slot:prepend>
                <v-icon>mdi-phone</v-icon>
              </template>
              <v-list-item-title>{{ selectedEmployee.phone }}</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-shield</v-icon>
              </template>
              <v-list-item-title>
                <v-chip
                  :color="selectedEmployee.role === 'INSTRUCTOR' ? 'warning' : 'info'"
                  :text="selectedEmployee.role === 'INSTRUCTOR' ? 'Instructor' : 'Empleado'"
                  size="small"
                />
              </v-list-item-title>
            </v-list-item>
            <v-list-item v-if="selectedEmployee.dateOfBirth">
              <template v-slot:prepend>
                <v-icon>mdi-calendar</v-icon>
              </template>
              <v-list-item-title>{{ formatDate(selectedEmployee.dateOfBirth) }}</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="selectedEmployee.address">
              <template v-slot:prepend>
                <v-icon>mdi-map-marker</v-icon>
              </template>
              <v-list-item-title>{{ selectedEmployee.address }}</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-circle</v-icon>
              </template>
              <v-list-item-title>
                <v-chip
                  :color="selectedEmployee.isActive ? 'success' : 'error'"
                  :text="selectedEmployee.isActive ? 'Activo' : 'Inactivo'"
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

    <!-- Change Role Dialog -->
    <v-dialog v-model="showRoleDialog" max-width="400px">
      <v-card>
        <v-card-title>Cambiar Rol</v-card-title>
        <v-card-text>
          <p class="mb-4">Selecciona el nuevo rol para {{ selectedEmployee?.name }}:</p>
          <v-select
            v-model="newRole"
            :items="roleOptions"
            label="Nuevo rol"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showRoleDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="confirmChangeRole"
            :loading="employeesStore.loading"
          >
            Cambiar Rol
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que quieres eliminar al empleado "{{ selectedEmployee?.name }}"?
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
            :loading="employeesStore.loading"
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
import { useEmployeesStore, type Employee, type CreateEmployeeData, type UpdateEmployeeData } from '@/stores/employees'
import { useToast } from '@/stores/toast'

const employeesStore = useEmployeesStore()
const toast = useToast()

// Reactive data
const showDialog = ref(false)
const showViewDialog = ref(false)
const showRoleDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const selectedEmployee = ref<Employee | null>(null)
const formValid = ref(false)
const searchQuery = ref('')
const filterRole = ref<'all' | 'INSTRUCTOR' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN'>('all')
const filterStatus = ref<'all' | 'active' | 'inactive'>('all')
const newRole = ref<'INSTRUCTOR' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN'>('INSTRUCTOR')
const tableKey = ref(0)

// Form data
const formRef = ref()
const formData = ref<CreateEmployeeData & { id?: string }>({
  name: '',
  email: '',
  password: '',
  role: 'INSTRUCTOR',
  phone: '',
  dateOfBirth: undefined,
  address: '',
  emergencyContact: '',
  emergencyPhone: ''
})

// Table headers
const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Teléfono', key: 'phone', sortable: false },
  { title: 'Rol', key: 'role', sortable: true },
  { title: 'Estado', key: 'isActive', sortable: true },
  { title: 'Fecha de registro', key: 'createdAt', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false }
]

// Options
const roleOptions = [
  { title: 'Todos', value: 'all' },
  { title: 'Instructores', value: 'INSTRUCTOR' },
  { title: 'Supervisores', value: 'SUPERVISOR' },
  { title: 'Gerentes', value: 'MANAGER' },
  { title: 'Administradores', value: 'ADMIN' }
]

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
const stats = computed(() => ({
  total: employeesStore.allItems.length,
  active: employeesStore.activeEmployees.length,
  instructors: employeesStore.instructors?.length || 0,
  supervisors: employeesStore.supervisors?.length || 0,
  managers: employeesStore.managers?.length || 0,
  admins: employeesStore.admins?.length || 0
}))

// Methods
const loadEmployees = async () => {
  await employeesStore.fetchAll()
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'error'
    case 'MANAGER': return 'warning'
    case 'SUPERVISOR': return 'info'
    case 'INSTRUCTOR': return 'success'
    default: return 'grey'
  }
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'Administrador'
    case 'MANAGER': return 'Gerente'
    case 'SUPERVISOR': return 'Supervisor'
    case 'INSTRUCTOR': return 'Instructor'
    default: return role
  }
}

const handleSearch = (query: string) => {
  employeesStore.setSearchQuery(query)
}

const handleRoleFilter = (role: string) => {
  if (role === 'all') {
    employeesStore.clearFilters()
  } else {
    employeesStore.setFilter('role', role)
  }
}

const handleStatusFilter = (status: string) => {
  if (status === 'all') {
    employeesStore.clearFilters()
  } else {
    employeesStore.setFilter('isActive', status === 'active')
  }
}

const openCreateDialog = () => {
  isEditing.value = false
  clearForm()
  showDialog.value = true
}

const editEmployee = (employee: Employee) => {
  isEditing.value = true
  selectedEmployee.value = employee
  formData.value = {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    password: '',
    role: employee.role,
    phone: employee.phone || '',
    dateOfBirth: employee.dateOfBirth || undefined,
    address: employee.address || '',
    emergencyContact: employee.emergencyContact || '',
    emergencyPhone: employee.emergencyPhone || ''
  }
  showDialog.value = true
}

const viewEmployee = (employee: Employee) => {
  selectedEmployee.value = employee
  showViewDialog.value = true
}

const changeRole = (employee: Employee) => {
  selectedEmployee.value = employee
  // Permitir cambiar entre roles válidos del schema
  const currentRole = employee.role
  const availableRoles: ('INSTRUCTOR' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN')[] = ['INSTRUCTOR', 'SUPERVISOR', 'MANAGER', 'ADMIN']
  const currentIndex = availableRoles.indexOf(currentRole)
  const nextIndex = (currentIndex + 1) % availableRoles.length
  newRole.value = availableRoles[nextIndex]
  
  console.log('🔄 changeRole - Empleado:', employee.name)
  console.log('🔄 changeRole - Rol actual:', currentRole)
  console.log('🔄 changeRole - Nuevo rol:', newRole.value)
  showRoleDialog.value = true
}

const confirmChangeRole = async () => {
  if (!selectedEmployee.value) return
  
  try {
    console.log('🔄 confirmChangeRole - Cambiando rol de:', selectedEmployee.value.name)
    console.log('🔄 confirmChangeRole - Nuevo rol:', newRole.value)
    
    // Actualizar el rol
    await employeesStore.updateEmployee(selectedEmployee.value.id, { role: newRole.value })
    
    // Cerrar el diálogo
    showRoleDialog.value = false
    selectedEmployee.value = null
    
    // Forzar recarga completa de empleados
    console.log('🔄 confirmChangeRole - Recargando empleados...')
    await employeesStore.fetchAll()
    
    // Forzar re-render de la tabla
    tableKey.value++
    
    // Mostrar mensaje de éxito
    console.log('✅ Rol cambiado exitosamente')
    
  } catch (error) {
    console.error('❌ Error changing employee role:', error)
  }
}

const toggleEmployeeStatus = async (employee: Employee) => {
  try {
    if (employee.isActive) {
      await employeesStore.deactivateEmployee(employee.id)
    } else {
      await employeesStore.activateEmployee(employee.id)
    }
    await loadEmployees()
  } catch (error) {
    console.error('Error toggling employee status:', error)
  }
}

const deleteEmployee = (employee: Employee) => {
  selectedEmployee.value = employee
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedEmployee.value) return
  
  try {
    await employeesStore.deleteEmployee(selectedEmployee.value.id)
    showDeleteDialog.value = false
    selectedEmployee.value = null
    await loadEmployees()
  } catch (error) {
    console.error('Error deleting employee:', error)
  }
}

const saveEmployee = async () => {
  if (!formValid.value) return

  try {
    if (isEditing.value && formData.value.id) {
      const updateData: UpdateEmployeeData = {
        name: formData.value.name,
        email: formData.value.email,
        role: formData.value.role,
        phone: formData.value.phone,
        dateOfBirth: formData.value.dateOfBirth ? new Date(formData.value.dateOfBirth).toISOString() : undefined,
        address: formData.value.address,
        emergencyContact: formData.value.emergencyContact,
        emergencyPhone: formData.value.emergencyPhone
      }
      console.log('📝 saveEmployee - Actualizando empleado:', formData.value.id)
      console.log('📝 saveEmployee - Datos de actualización:', updateData)
      await employeesStore.updateEmployee(formData.value.id, updateData)
    } else {
      const createData: CreateEmployeeData = {
        name: formData.value.name,
        email: formData.value.email,
        password: formData.value.password,
        role: formData.value.role,
        phone: formData.value.phone,
        dateOfBirth: formData.value.dateOfBirth ? new Date(formData.value.dateOfBirth).toISOString() : undefined,
        address: formData.value.address,
        emergencyContact: formData.value.emergencyContact,
        emergencyPhone: formData.value.emergencyPhone
      }
      console.log('📝 saveEmployee - Creando nuevo empleado')
      console.log('📝 saveEmployee - Datos de creación:', createData)
      await employeesStore.createEmployee(createData)
    }
    
    closeDialog()
    await loadEmployees()
  } catch (error) {
    console.error('❌ Error saving employee:', error)
  }
}

const closeDialog = () => {
  showDialog.value = false
}

const clearForm = () => {
  formData.value = {
    name: '',
    email: '',
    password: '',
    role: 'INSTRUCTOR',
    phone: '',
    dateOfBirth: undefined,
    address: '',
    emergencyContact: '',
    emergencyPhone: ''
  }
  selectedEmployee.value = null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES')
}

// Lifecycle
onMounted(async () => {
  await employeesStore.init()
  await loadEmployees()
})
</script>

<style scoped>
.admin-employees {
  padding: 20px 0;
}
</style> 