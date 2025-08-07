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
                  <div class="text-h6">{{ stats.admins }}</div>
                  <div class="text-caption">Administradores</div>
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
                    @update:model-value="employeesStore.searchEmployees"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filterRole"
                    :items="roleOptions"
                    label="Rol"
                    variant="outlined"
                    density="compact"
                    @update:model-value="employeesStore.setFilterRole"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filterStatus"
                    :items="statusOptions"
                    label="Estado"
                    variant="outlined"
                    density="compact"
                    @update:model-value="employeesStore.setFilterStatus"
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
              :headers="headers"
              :items="employeesStore.filteredEmployees"
              :loading="employeesStore.loading"
              :items-per-page="10"
              class="elevation-1"
            >
              <!-- Role Column -->
              <template v-slot:item.role="{ item }">
                <v-chip
                  :color="item.role === 'ADMIN' ? 'error' : 'warning'"
                  :text="item.role === 'ADMIN' ? 'Administrador' : 'Instructor'"
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
    <v-dialog v-model="showDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ isEditing ? 'Editar Empleado' : 'Nuevo Empleado' }}
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
                <v-select
                  v-model="form.role"
                  :items="roleOptions"
                  label="Rol"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
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
            @click="saveEmployee"
            :loading="employeesStore.loading"
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
                  :color="selectedEmployee.role === 'ADMIN' ? 'error' : 'warning'"
                  :text="selectedEmployee.role === 'ADMIN' ? 'Administrador' : 'Instructor'"
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
const filterRole = ref<'all' | 'ADMIN' | 'INSTRUCTOR'>('all')
const filterStatus = ref<'all' | 'active' | 'inactive'>('all')
const newRole = ref<'ADMIN' | 'INSTRUCTOR'>('INSTRUCTOR')

// Form data
const form = ref<CreateEmployeeData & { id?: string }>({
  name: '',
  email: '',
  password: '',
  role: 'INSTRUCTOR',
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
  { title: 'Rol', key: 'role', sortable: true },
  { title: 'Estado', key: 'isActive', sortable: true },
  { title: 'Fecha de registro', key: 'createdAt', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false }
]

// Options
const roleOptions = [
  { title: 'Todos', value: 'all' },
  { title: 'Administradores', value: 'ADMIN' },
  { title: 'Instructores', value: 'INSTRUCTOR' }
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
const stats = computed(() => employeesStore.getEmployeeStats())

// Methods
const loadEmployees = async () => {
  await employeesStore.fetchEmployees(employeesStore.currentPage)
}

const openCreateDialog = () => {
  isEditing.value = false
  resetForm()
  showDialog.value = true
}

const editEmployee = (employee: Employee) => {
  isEditing.value = true
  selectedEmployee.value = employee
  form.value = {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    password: '',
    role: employee.role,
    phone: employee.phone || '',
    dateOfBirth: employee.dateOfBirth || '',
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
  newRole.value = employee.role === 'ADMIN' ? 'INSTRUCTOR' : 'ADMIN'
  showRoleDialog.value = true
}

const confirmChangeRole = async () => {
  if (!selectedEmployee.value) return
  
  try {
    await employeesStore.changeEmployeeRole(selectedEmployee.value.id, newRole.value)
    showRoleDialog.value = false
    selectedEmployee.value = null
  } catch (error) {
    console.error('Error changing employee role:', error)
  }
}

const toggleEmployeeStatus = async (employee: Employee) => {
  try {
    await employeesStore.toggleEmployeeStatus(employee.id)
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
  } catch (error) {
    console.error('Error deleting employee:', error)
  }
}

const saveEmployee = async () => {
  if (!formValid.value) return

  try {
    if (isEditing.value && form.value.id) {
      const updateData: UpdateEmployeeData = {
        name: form.value.name,
        email: form.value.email,
        role: form.value.role,
        phone: form.value.phone,
        dateOfBirth: form.value.dateOfBirth,
        address: form.value.address,
        emergencyContact: form.value.emergencyContact,
        emergencyPhone: form.value.emergencyPhone
      }
      await employeesStore.updateEmployee(form.value.id, updateData)
    } else {
      const createData: CreateEmployeeData = {
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        role: form.value.role,
        phone: form.value.phone,
        dateOfBirth: form.value.dateOfBirth,
        address: form.value.address,
        emergencyContact: form.value.emergencyContact,
        emergencyPhone: form.value.emergencyPhone
      }
      await employeesStore.createEmployee(createData)
    }
    
    closeDialog()
    await loadEmployees()
  } catch (error) {
    console.error('Error saving employee:', error)
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
    role: 'INSTRUCTOR',
    phone: '',
    dateOfBirth: '',
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
onMounted(() => {
  loadEmployees()
})
</script>

<style scoped>
.admin-employees {
  padding: 20px 0;
}
</style> 