<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">🏢 Dashboard Administrativo</h1>
        <p class="text-body-1 mb-6 text-medium-emphasis">
          Bienvenido al panel de control administrativo. Gestiona todos los aspectos del gimnasio desde aquí.
        </p>
      </v-col>
    </v-row>

    <!-- Métricas rápidas -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="pa-4 text-center" color="primary" dark>
          <v-icon size="48" class="mb-3">mdi-account-group</v-icon>
          <h3 class="text-h5">{{ stats.totalUsers || 0 }}</h3>
          <p class="text-body-2">Usuarios Totales</p>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="3">
        <v-card class="pa-4 text-center" color="success" dark>
          <v-icon size="48" class="mb-3">mdi-dumbbell</v-icon>
          <h3 class="text-h5">{{ stats.totalClasses || 0 }}</h3>
          <p class="text-body-2">Clases Activas</p>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="3">
        <v-card class="pa-4 text-center" color="warning" dark>
          <v-icon size="48" class="mb-3">mdi-calendar-check</v-icon>
          <h3 class="text-h5">{{ stats.todayReservations || 0 }}</h3>
          <p class="text-body-2">Reservas Hoy</p>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="3">
        <v-card class="pa-4 text-center" color="info" dark>
          <v-icon size="48" class="mb-3">mdi-currency-usd</v-icon>
          <h3 class="text-h5">${{ formatNumber(stats.totalRevenue || 0) }}</h3>
          <p class="text-body-2">Ingresos Totales</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Módulos principales -->
    <v-row class="mb-6">
      <v-col cols="12">
        <h2 class="text-h5 mb-4">📋 Gestión de Usuarios</h2>
        <v-row>
          <v-col cols="12" md="4">
            <v-card 
              class="pa-4 text-center cursor-pointer" 
              hover 
              @click="$router.push('/admin-users')"
            >
              <v-icon size="48" color="primary" class="mb-3">mdi-account-multiple</v-icon>
              <h3 class="text-h6 mb-2">Usuarios</h3>
              <p class="text-body-2 text-medium-emphasis">
                Gestiona usuarios, roles y permisos del sistema
              </p>
              <v-chip color="primary" size="small" class="mt-2">
                {{ stats.totalUsers || 0 }} usuarios
              </v-chip>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="4">
            <v-card 
              class="pa-4 text-center cursor-pointer" 
              hover 
              @click="$router.push('/admin-employees')"
            >
              <v-icon size="48" color="success" class="mb-3">mdi-account-hard-hat</v-icon>
              <h3 class="text-h6 mb-2">Empleados</h3>
              <p class="text-body-2 text-medium-emphasis">
                Administra instructores y personal del gimnasio
              </p>
              <v-chip color="success" size="small" class="mt-2">
                {{ stats.totalEmployees || 0 }} empleados
              </v-chip>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="4">
            <v-card 
              class="pa-4 text-center cursor-pointer" 
              hover 
              @click="$router.push('/admin-clients')"
            >
              <v-icon size="48" color="info" class="mb-3">mdi-account-heart</v-icon>
              <h3 class="text-h6 mb-2">Clientes</h3>
              <p class="text-body-2 text-medium-emphasis">
                Gestiona la base de datos de clientes
              </p>
              <v-chip color="info" size="small" class="mt-2">
                {{ stats.totalClients || 0 }} clientes
              </v-chip>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Gestión de servicios -->
    <v-row class="mb-6">
      <v-col cols="12">
        <h2 class="text-h5 mb-4">🏋️ Gestión de Servicios</h2>
        <v-row>
          <v-col cols="12" md="4">
            <v-card 
              class="pa-4 text-center cursor-pointer" 
              hover 
              @click="$router.push('/admin-classes')"
            >
              <v-icon size="48" color="warning" class="mb-3">mdi-dumbbell</v-icon>
              <h3 class="text-h6 mb-2">Clases</h3>
              <p class="text-body-2 text-medium-emphasis">
                Configura y gestiona las clases del gimnasio
              </p>
              <v-chip color="warning" size="small" class="mt-2">
                {{ stats.totalClasses || 0 }} clases
              </v-chip>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="4">
            <v-card 
              class="pa-4 text-center cursor-pointer" 
              hover 
              @click="$router.push('/admin-memberships')"
            >
              <v-icon size="48" color="purple" class="mb-3">mdi-card-account-details</v-icon>
              <h3 class="text-h6 mb-2">Membresías</h3>
              <p class="text-body-2 text-medium-emphasis">
                Administra planes y membresías de clientes
              </p>
              <v-chip color="purple" size="small" class="mt-2">
                {{ stats.totalMemberships || 0 }} membresías
              </v-chip>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="4">
            <v-card 
              class="pa-4 text-center cursor-pointer" 
              hover 
              @click="$router.push('/admin-reservations')"
            >
              <v-icon size="48" color="teal" class="mb-3">mdi-calendar-clock</v-icon>
              <h3 class="text-h6 mb-2">Reservas</h3>
              <p class="text-body-2 text-medium-emphasis">
                Controla reservas y asistencia a clases
              </p>
              <v-chip color="teal" size="small" class="mt-2">
                {{ stats.todayReservations || 0 }} hoy
              </v-chip>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Gestión financiera -->
    <v-row class="mb-6">
      <v-col cols="12">
        <h2 class="text-h5 mb-4">💰 Gestión Financiera</h2>
        <v-row>
          <v-col cols="12" md="4">
            <v-card 
              class="pa-4 text-center cursor-pointer" 
              hover 
              @click="$router.push('/admin-payments')"
            >
              <v-icon size="48" color="success" class="mb-3">mdi-credit-card</v-icon>
              <h3 class="text-h6 mb-2">Pagos</h3>
              <p class="text-body-2 text-medium-emphasis">
                Gestiona pagos y transacciones financieras
              </p>
              <v-chip color="success" size="small" class="mt-2">
                ${{ formatNumber(stats.totalRevenue || 0) }}
              </v-chip>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="4">
            <v-card 
              class="pa-4 text-center cursor-pointer" 
              hover 
              @click="$router.push('/admin-inventory')"
            >
              <v-icon size="48" color="orange" class="mb-3">mdi-package-variant</v-icon>
              <h3 class="text-h6 mb-2">Inventario</h3>
              <p class="text-body-2 text-medium-emphasis">
                Controla productos y stock del gimnasio
              </p>
              <v-chip color="orange" size="small" class="mt-2">
                {{ stats.totalProducts || 0 }} productos
              </v-chip>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="4">
            <v-card 
              class="pa-4 text-center cursor-pointer" 
              hover 
              @click="$router.push('/admin-reports')"
            >
              <v-icon size="48" color="indigo" class="mb-3">mdi-chart-line</v-icon>
              <h3 class="text-h6 mb-2">Reportes</h3>
              <p class="text-body-2 text-medium-emphasis">
                Analytics y reportes del negocio
              </p>
              <v-chip color="indigo" size="small" class="mt-2">
                📊 Disponible
              </v-chip>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Acciones rápidas -->
    <v-row class="mb-6">
      <v-col cols="12">
        <h2 class="text-h5 mb-4">⚡ Acciones Rápidas</h2>
        <v-row>
          <v-col cols="12" md="3">
            <v-btn 
              block 
              color="primary" 
              prepend-icon="mdi-plus"
              @click="$router.push('/admin-users')"
            >
              Nuevo Usuario
            </v-btn>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-btn 
              block 
              color="success" 
              prepend-icon="mdi-plus"
              @click="$router.push('/admin-classes')"
            >
              Nueva Clase
            </v-btn>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-btn 
              block 
              color="warning" 
              prepend-icon="mdi-plus"
              @click="$router.push('/admin-memberships')"
            >
              Nueva Membresía
            </v-btn>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-btn 
              block 
              color="info" 
              prepend-icon="mdi-chart-line"
              @click="$router.push('/admin-reports')"
            >
              Ver Reportes
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Estado del sistema -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="success">mdi-check-circle</v-icon>
            Estado del Sistema
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <div class="d-flex align-center mb-2">
                  <v-icon color="success" class="mr-2">mdi-circle-small</v-icon>
                  <span>Backend funcionando correctamente</span>
                </div>
                <div class="d-flex align-center mb-2">
                  <v-icon color="success" class="mr-2">mdi-circle-small</v-icon>
                  <span>Base de datos conectada</span>
                </div>
                <div class="d-flex align-center mb-2">
                  <v-icon color="success" class="mr-2">mdi-circle-small</v-icon>
                  <span>Autenticación activa</span>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="d-flex align-center mb-2">
                  <v-icon color="success" class="mr-2">mdi-circle-small</v-icon>
                  <span>9 módulos administrativos activos</span>
                </div>
                <div class="d-flex align-center mb-2">
                  <v-icon color="success" class="mr-2">mdi-circle-small</v-icon>
                  <span>Sistema de reportes funcional</span>
                </div>
                <div class="d-flex align-center mb-2">
                  <v-icon color="success" class="mr-2">mdi-circle-small</v-icon>
                  <span>Exportación PDF/Excel/CSV</span>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/stores/toast'
import { api } from '@/utils/api'

const router = useRouter()
const toast = useToast()

// Estado
const stats = ref({
  totalUsers: 0,
  totalEmployees: 0,
  totalClients: 0,
  totalClasses: 0,
  totalMemberships: 0,
  todayReservations: 0,
  totalRevenue: 0,
  totalProducts: 0
})

// Métodos
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('es-ES').format(num)
}

const loadStats = async () => {
  try {
    // Cargar estadísticas generales
    const [usersResponse, classesResponse, reservationsResponse, membershipsResponse] = await Promise.all([
      api.get('/users/stats'),
      api.get('/classes/stats'),
      api.get('/reservations/stats'),
      api.get('/memberships/stats')
    ])

    if (usersResponse.data.success) {
      stats.value.totalUsers = usersResponse.data.data.total
      stats.value.totalEmployees = usersResponse.data.data.employees || 0
      stats.value.totalClients = usersResponse.data.data.clients || 0
    }

    if (classesResponse.data.success) {
      stats.value.totalClasses = classesResponse.data.data.active
    }

    if (reservationsResponse.data.success) {
      stats.value.todayReservations = reservationsResponse.data.data.today
    }

    if (membershipsResponse.data.success) {
      stats.value.totalMemberships = membershipsResponse.data.data.active
    }

    // Cargar estadísticas adicionales
    try {
      const inventoryResponse = await api.get('/inventory/stats')
      if (inventoryResponse.data.success) {
        stats.value.totalProducts = inventoryResponse.data.data.totalProducts || 0
      }
    } catch (error) {
      console.log('Inventario no disponible')
    }

    try {
      const paymentsResponse = await api.get('/payments/stats')
      if (paymentsResponse.data.success) {
        stats.value.totalRevenue = paymentsResponse.data.data.totalRevenue || 0
      }
    } catch (error) {
      console.log('Pagos no disponible')
    }

  } catch (error) {
    console.error('Error loading stats:', error)
    toast.show('Error al cargar estadísticas', 'error')
  }
}

// Lifecycle
onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
}
</style>
