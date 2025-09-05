<template>
  <v-card class="mb-4" elevation="2">
    <v-card-text class="py-3">
      <div class="d-flex align-center justify-space-between">
        <!-- Breadcrumbs -->
        <div class="d-flex align-center">
          <v-btn
            :to="{ name: 'admin' }"
            variant="text"
            color="primary"
            prepend-icon="mdi-view-dashboard"
            class="text-none font-weight-medium"
          >
            Dashboard
          </v-btn>
          
          <v-icon size="16" color="grey" class="mx-2">mdi-chevron-right</v-icon>
          
          <span class="text-h6 font-weight-medium text-grey-darken-1">
            {{ currentModule }}
          </span>
        </div>
        
        <!-- Botón de acción rápida -->
        <div class="d-flex align-center gap-2">
          <v-btn
            :to="{ name: 'admin' }"
            variant="outlined"
            color="primary"
            prepend-icon="mdi-arrow-left"
            size="small"
          >
            Volver al Dashboard
          </v-btn>
          
          <!-- Menú de módulos rápidos -->
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
                color="primary"
                prepend-icon="mdi-menu"
                size="small"
              >
                Módulos
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="module in adminModules"
                :key="module.name"
                :to="module.route"
                :prepend-icon="module.icon"
                :title="module.title"
                :disabled="module.disabled"
              />
            </v-list>
          </v-menu>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface AdminModule {
  name: string
  title: string
  route: { name: string }
  icon: string
  disabled?: boolean
}

const props = defineProps<{
  currentModule: string
}>()

// Módulos de administración disponibles
const adminModules: AdminModule[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    route: { name: 'admin' },
    icon: 'mdi-view-dashboard'
  },
  {
    name: 'users',
    title: 'Usuarios',
    route: { name: 'admin-users' },
    icon: 'mdi-account-group'
  },
  {
    name: 'clients',
    title: 'Clientes',
    route: { name: 'admin-clients' },
    icon: 'mdi-account'
  },
  {
    name: 'employees',
    title: 'Empleados',
    route: { name: 'admin-employees' },
    icon: 'mdi-account-tie'
  },
  {
    name: 'classes',
    title: 'Clases',
    route: { name: 'admin-classes' },
    icon: 'mdi-dumbbell'
  },
  {
    name: 'reservations',
    title: 'Reservaciones',
    route: { name: 'admin-reservations' },
    icon: 'mdi-calendar-clock'
  },
  {
    name: 'memberships',
    title: 'Membresías',
    route: { name: 'admin-memberships' },
    icon: 'mdi-card-account-details'
  },
  {
    name: 'payments',
    title: 'Pagos',
    route: { name: 'admin-payments' },
    icon: 'mdi-credit-card'
  },
  {
    name: 'inventory',
    title: 'Inventario',
    route: { name: 'admin-inventory' },
    icon: 'mdi-package-variant'
  },
  {
    name: 'reports',
    title: 'Reportes',
    route: { name: 'admin-reports' },
    icon: 'mdi-chart-line'
  }
]

// Deshabilitar el módulo actual
const modulesWithDisabled = computed(() => {
  return adminModules.map(module => ({
    ...module,
    disabled: module.name === props.currentModule.toLowerCase()
  }))
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
