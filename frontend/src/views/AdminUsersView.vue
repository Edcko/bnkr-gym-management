<template>
  <v-container fluid>
    <!-- Breadcrumbs de navegación -->
    <AdminBreadcrumbs current-module="Gestión de Usuarios" />
    
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">👥 Gestión de Usuarios</h1>
        
        <!-- Estadísticas rápidas -->
        <v-row class="mb-6">
          <v-col cols="12" md="3">
            <v-card class="pa-4 text-center">
              <v-icon size="48" color="primary" class="mb-3">mdi-account-group</v-icon>
              <h3 class="text-h5">{{ stats.totalUsers || 0 }}</h3>
              <p class="text-body-2">Total de Usuarios</p>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-card class="pa-4 text-center">
              <v-icon size="48" color="success" class="mb-3">mdi-account-check</v-icon>
              <h3 class="text-h5">{{ stats.activeUsers || 0 }}</h3>
              <p class="text-body-2">Usuarios Activos</p>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-card class="pa-4 text-center">
              <v-icon size="48" color="warning" class="mb-3">mdi-account-clock</v-icon>
              <h3 class="text-h5">{{ stats.pendingUsers || 0 }}</h3>
              <p class="text-body-2">Pendientes</p>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-card class="pa-4 text-center">
              <v-icon size="48" color="info" class="mb-3">mdi-account-star</v-icon>
              <h3 class="text-h5">{{ stats.adminUsers || 0 }}</h3>
              <p class="text-body-2">Administradores</p>
            </v-card>
          </v-col>
        </v-row>

        <!-- Barra de herramientas -->
        <v-card class="mb-6">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchQuery"
                  label="Buscar usuarios..."
                  prepend-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  @input="handleSearch"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="3">
                <v-select
                  v-model="roleFilter"
                  label="Filtrar por rol"
                  :items="roleOptions"
                  variant="outlined"
                  density="compact"
                  @update:model-value="handleFilter"
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="3">
                <v-select
                  v-model="statusFilter"
                  label="Filtrar por estado"
                  :items="statusOptions"
                  variant="outlined"
                  density="compact"
                  @update:model-value="handleFilter"
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="2" class="text-right">
                <v-btn
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="openCreateDialog"
                >
                  Nuevo Usuario
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Tabla de usuarios -->
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Lista de Usuarios</span>
            <v-chip color="primary">{{ usersStore.users.length }} usuarios</v-chip>
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="usersStore.users"
            :loading="usersStore.loading"
            :search="searchQuery"
            class="elevation-1"
          >
            <!-- Columna de estado -->
            <template v-slot:item.isActive="{ item }">
              <v-chip
                :color="item.isActive ? 'success' : 'error'"
                size="small"
              >
                {{ item.isActive ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </template>

            <!-- Columna de rol -->
            <template v-slot:item.role="{ item }">
              <v-chip
                :color="getRoleColor(item.role)"
                size="small"
              >
                {{ getRoleLabel(item.role) }}
              </v-chip>
            </template>

            <!-- Columna de fecha de registro -->
            <template v-slot:item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>

            <!-- Columna de acciones -->
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon="mdi-eye"
                size="small"
                color="info"
                variant="text"
                @click="viewUser(item)"
                class="mr-2"
              ></v-btn>
              
              <v-btn
                icon="mdi-pencil"
                size="small"
                color="warning"
                variant="text"
                @click="editUser(item)"
                class="mr-2"
              ></v-btn>
              
              <v-btn
                icon="mdi-delete"
                size="small"
                color="error"
                variant="text"
                @click="deleteUser(item)"
              ></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo para crear/editar usuario -->
    <v-dialog v-model="showUserDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="text-h5">
          {{ editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="saveUser">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name"
                  label="Nombre completo"
                  required
                  variant="outlined"
                  :rules="[v => !!v || 'El nombre es requerido']"
                  clearable
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.email"
                  label="Email"
                  type="email"
                  required
                  variant="outlined"
                  :rules="[v => !!v || 'El email es requerido', v => /.+@.+\..+/.test(v) || 'Email inválido']"
                  clearable
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.phone"
                  label="Teléfono"
                  variant="outlined"
                  :rules="phoneRules"
                  hint="Formato: 55 1234 5678"
                  persistent-hint
                  clearable
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.role"
                  label="Rol"
                  :items="formRoleOptions"
                  required
                  variant="outlined"
                  :rules="[v => !!v || 'El rol es requerido']"
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.password"
                  label="Contraseña"
                  type="password"
                  :required="!editingUser"
                  variant="outlined"
                  :rules="passwordRules"
                  hint="Mínimo 6 caracteres, una mayúscula, una minúscula y un número"
                  persistent-hint
                  clearable
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-switch
                  v-model="formData.isActive"
                  label="Usuario activo"
                  color="success"
                  inset
                ></v-switch>
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="formData.address"
                  label="Dirección"
                  variant="outlined"
                  rows="2"
                  clearable
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-btn
            color="warning"
            variant="text"
            @click="clearForm"
            :disabled="saving"
          >
            Limpiar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="closeUserDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="saveUser"
            :loading="saving"
            :disabled="!formData.name || !formData.email || (!editingUser && !formData.password)"
          >
            {{ editingUser ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación para eliminar -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Confirmar eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que quieres eliminar al usuario 
          <strong>{{ userToDelete?.name }}</strong>?
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
import { useToast } from '@/stores/toast'
import { useUsersStore, type User, type CreateUserData, type UpdateUserData } from '@/stores/users'
import { formatDate } from '@/utils/dateFormat'
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs.vue'

// Store
const toast = useToast()
const usersStore = useUsersStore()

// Reglas de validación
const passwordRules = [
  (v: string) => !!v || 'La contraseña es requerida',
  (v: string) => v.length >= 6 || 'Mínimo 6 caracteres',
  (v: string) => /[A-Z]/.test(v) || 'Debe contener al menos una mayúscula',
  (v: string) => /[a-z]/.test(v) || 'Debe contener al menos una minúscula',
  (v: string) => /\d/.test(v) || 'Debe contener al menos un número'
]

const phoneRules = [
  (v: string) => !v || /^(\+52\s?)?[0-9]{2}\s?[0-9]{4}\s?[0-9]{4}$/.test(v) || 'Formato de teléfono inválido'
]

// Estado
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')
const showUserDialog = ref(false)
const showDeleteDialog = ref(false)
const editingUser = ref<any>(null)
const userToDelete = ref<any>(null)

// Referencia del formulario
const formRef = ref()

// Datos del formulario - NUEVA ESTRUCTURA
const formData = ref({
  name: '',
  email: '',
  phone: '',
  role: 'CLIENT' as 'CLIENT' | 'INSTRUCTOR' | 'ADMIN',
  password: '',
  isActive: true,
  address: ''
})

// Formulario original (mantener para compatibilidad temporal)
const userForm = ref<CreateUserData & { id?: string }>({
  name: '',
  email: '',
  phone: '',
  role: 'CLIENT',
  password: '',
  isActive: true,
  address: ''
})

// Headers de la tabla
const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Rol', key: 'role', sortable: true },
  { title: 'Teléfono', key: 'phone', sortable: false },
  { title: 'Estado', key: 'isActive', sortable: true },
  { title: 'Fecha de registro', key: 'createdAt', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false }
]

// Opciones de filtros
const roleOptions = [
  { title: 'Todos los roles', value: 'all' },
  { title: 'Cliente', value: 'CLIENT' },
  { title: 'Instructor', value: 'INSTRUCTOR' },
  { title: 'Administrador', value: 'ADMIN' }
]

// Opciones para el formulario (sin 'all')
const formRoleOptions = [
  { title: 'Cliente', value: 'CLIENT' },
  { title: 'Instructor', value: 'INSTRUCTOR' },
  { title: 'Administrador', value: 'ADMIN' }
]

const statusOptions = [
  { title: 'Todos los estados', value: 'all' },
  { title: 'Activo', value: 'active' },
  { title: 'Inactivo', value: 'inactive' }
]

// Computed - Usando el store
const stats = computed(() => ({
  totalUsers: usersStore.stats.total || 0,
  activeUsers: (usersStore.stats.admins || 0) + (usersStore.stats.instructors || 0) + (usersStore.stats.clients || 0),
  pendingUsers: 0, // Por ahora 0, se puede calcular si es necesario
  adminUsers: usersStore.stats.admins || 0
}))

// Métodos
const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'error'
    case 'INSTRUCTOR': return 'warning'
    case 'CLIENT': return 'primary'
    default: return 'grey'
  }
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'Administrador'
    case 'INSTRUCTOR': return 'Instructor'
    case 'CLIENT': return 'Cliente'
    default: return role
  }
}

const handleSearch = () => {
  // La búsqueda se maneja automáticamente por v-data-table
  console.log('🔍 Búsqueda:', searchQuery.value)
}

const handleFilter = () => {
  const filters: any = {}
  
  if (roleFilter.value !== 'all') {
    filters.role = roleFilter.value
  }
  
  if (statusFilter.value !== 'all') {
    filters.status = statusFilter.value
  }
  
  console.log('🔍 Filtros aplicados:', filters)
  // Los filtros se manejan automáticamente por v-data-table
}

const openCreateDialog = () => {
  console.log('🔍 openCreateDialog - Abriendo diálogo de creación')
  editingUser.value = null
  clearForm()
  showUserDialog.value = true
}

const editUser = (user: any) => {
  console.log('🔍 editUser - Editando usuario:', user)
  editingUser.value = user
  // Llenar el formulario con los datos del usuario
  formData.value = {
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'CLIENT',
    password: '', // Siempre vacío para edición
    isActive: user.isActive !== undefined ? user.isActive : true,
    address: user.address || ''
  }
  showUserDialog.value = true
}

const clearForm = () => {
  console.log('🧹 clearForm - Limpiando formulario')
  formData.value = {
    name: '',
    email: '',
    phone: '',
    role: 'CLIENT',
    password: '',
    isActive: true,
    address: ''
  }
  console.log('🧹 clearForm - Formulario limpio:', formData.value)
}

const viewUser = (user: any) => {
  // Implementar vista detallada del usuario
  toast.show(`Viendo usuario: ${user.name}`, 'info')
}

const deleteUser = (user: any) => {
  userToDelete.value = user
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!userToDelete.value) return
  
  try {
    deleting.value = true
    await usersStore.delete(userToDelete.value.id)
    
    showDeleteDialog.value = false
    userToDelete.value = null
  } catch (error) {
    toast.show('Error al eliminar usuario', 'error')
  } finally {
    deleting.value = false
  }
}

const saveUser = async () => {
  try {
    saving.value = true
    
    console.log('📝 saveUser - Datos del formulario:', formData.value)
    
    // Validar campos requeridos
    if (!formData.value.name.trim()) {
      toast.show('El nombre es requerido', 'error')
      return
    }
    
    if (!formData.value.email.trim()) {
      toast.show('El email es requerido', 'error')
      return
    }
    
    if (!editingUser.value && !formData.value.password) {
      toast.show('La contraseña es requerida para nuevos usuarios', 'error')
      return
    }
    
    if (editingUser.value) {
      // Actualizar usuario existente
      const updateData: UpdateUserData = {
        name: formData.value.name.trim(),
        email: formData.value.email.trim().toLowerCase(),
        phone: formData.value.phone?.trim() || undefined,
        role: formData.value.role,
        isActive: formData.value.isActive,
        address: formData.value.address?.trim() || undefined
      }
      
      if (formData.value.password) {
        updateData.password = formData.value.password
      }
      
      console.log('📝 Actualizando usuario:', updateData)
      await usersStore.update(editingUser.value.id, updateData)
      toast.show('Usuario actualizado exitosamente', 'success')
    } else {
      // Crear nuevo usuario
      const createData: CreateUserData = {
        name: formData.value.name.trim(),
        email: formData.value.email.trim().toLowerCase(),
        password: formData.value.password,
        phone: formData.value.phone?.trim() || undefined,
        role: formData.value.role,
        isActive: formData.value.isActive,
        address: formData.value.address?.trim() || undefined
      }
      
      console.log('📝 Creando usuario:', createData)
      await usersStore.create(createData)
      toast.show('Usuario creado exitosamente', 'success')
    }
    
    // Limpiar formulario después de guardar exitosamente
    clearForm()
    closeUserDialog()
  } catch (error: any) {
    console.error('❌ Error en saveUser:', error)
    
    // Mostrar mensaje de error más específico
    if (error.response?.data?.message) {
      toast.show(`Error: ${error.response.data.message}`, 'error')
    } else if (error.message) {
      toast.show(`Error: ${error.message}`, 'error')
    } else {
      toast.show('Error al guardar usuario', 'error')
    }
  } finally {
    saving.value = false
  }
}

const closeUserDialog = () => {
  showUserDialog.value = false
  editingUser.value = null
  // Solo resetear después de guardar exitosamente
  // resetUserForm() // Comentado para evitar resetear al cerrar
}

const resetUserForm = () => {
  console.log('🧹 Reseteando formulario...')
  // Crear un nuevo objeto para asegurar reactividad
  userForm.value = {
    name: '',
    email: '',
    phone: '',
    role: 'CLIENT',
    password: '',
    isActive: true,
    address: ''
  }
  console.log('🧹 Formulario reseteado:', userForm.value)
}

// Lifecycle
onMounted(async () => {
  try {
    loading.value = true
    await usersStore.init()
  } catch (error) {
    toast.show('Error al cargar usuarios', 'error')
  } finally {
    loading.value = false
  }
})
</script>
