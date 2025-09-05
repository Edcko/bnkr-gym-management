<template>
  <v-container fluid>
    <!-- Breadcrumbs de navegación -->
    <AdminBreadcrumbs current-module="Reportes y Analytics" />
    
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">📊 Reportes y Analytics</h1>
        
        <!-- Filtros de fecha -->
        <v-card class="mb-6">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" md="3">
                <v-select
                  v-model="dateRange"
                  label="Rango de fechas"
                  :items="dateRangeOptions"
                  variant="outlined"
                  density="compact"
                  @update:model-value="handleDateRangeChange"
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="3">
                <v-menu
                  v-model="showStartDatePicker"
                  :close-on-content-click="false"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="startDate"
                      label="Fecha de inicio"
                      readonly
                      v-bind="props"
                      variant="outlined"
                      density="compact"
                      prepend-icon="mdi-calendar"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="startDate"
                    @update:model-value="showStartDatePicker = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              
              <v-col cols="12" md="3">
                <v-menu
                  v-model="showEndDatePicker"
                  :close-on-content-click="false"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="endDate"
                      label="Fecha de fin"
                      readonly
                      v-bind="props"
                      variant="outlined"
                      density="compact"
                      prepend-icon="mdi-calendar"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="endDate"
                    @update:model-value="showEndDatePicker = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              
              <v-col cols="12" md="3" class="text-right">
                <v-btn
                  :color="$vuetify.theme.current.dark ? 'white' : 'primary'"
                  prepend-icon="mdi-refresh"
                  @click="generateReports"
                  :loading="generatingReports"
                >
                  Generar Reportes
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Métricas principales -->
        <v-row class="mb-6">
          <v-col cols="12" md="3">
            <v-card class="pa-4 text-center">
              <v-icon size="48" :color="$vuetify.theme.current.dark ? 'white' : 'primary'" class="mb-3">mdi-currency-usd</v-icon>
              <h3 class="text-h5">${{ formatNumber(reportsStore.overviewReport?.revenue?.total || 0) }}</h3>
              <p class="text-body-2">Ingresos Totales</p>
              <v-chip
                :color="(reportsStore.overviewReport?.revenue?.growth || 0) >= 0 ? 'success' : 'error'"
                size="small"
                class="mt-2"
              >
                {{ (reportsStore.overviewReport?.revenue?.growth || 0) >= 0 ? '+' : '' }}{{ reportsStore.overviewReport?.revenue?.growth || 0 }}%
              </v-chip>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-card class="pa-4 text-center">
              <v-icon size="48" :color="$vuetify.theme.current.dark ? 'white' : 'success'" class="mb-3">mdi-account-group</v-icon>
              <h3 class="text-h5">{{ reportsStore.overviewReport?.memberships?.total || 0 }}</h3>
              <p class="text-body-2">Miembros Activos</p>
              <v-chip
                :color="(reportsStore.overviewReport?.memberships?.growth || 0) >= 0 ? 'success' : 'error'"
                size="small"
                class="mt-2"
              >
                {{ (reportsStore.overviewReport?.memberships?.growth || 0) >= 0 ? '+' : '' }}{{ reportsStore.overviewReport?.memberships?.growth || 0 }}%
              </v-chip>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-card class="pa-4 text-center">
              <v-icon size="48" :color="$vuetify.theme.current.dark ? 'white' : 'warning'" class="mb-3">mdi-calendar-check</v-icon>
              <h3 class="text-h5">{{ reportsStore.overviewReport?.classes?.total || 0 }}</h3>
              <p class="text-body-2">Clases Realizadas</p>
              <v-chip
                :color="(reportsStore.overviewReport?.classes?.growth || 0) >= 0 ? 'success' : 'error'"
                size="small"
                class="mt-2"
              >
                {{ (reportsStore.overviewReport?.classes?.growth || 0) >= 0 ? '+' : '' }}{{ reportsStore.overviewReport?.classes?.growth || 0 }}%
              </v-chip>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-card class="pa-4 text-center">
              <v-icon size="48" :color="$vuetify.theme.current.dark ? 'white' : 'info'" class="mb-3">mdi-clock</v-icon>
              <h3 class="text-h5">{{ reportsStore.overviewReport?.reservations?.today || 0 }}</h3>
              <p class="text-body-2">Reservas Hoy</p>
              <v-chip
                :color="(reportsStore.overviewReport?.reservations?.thisWeek || 0) >= 0 ? 'success' : 'error'"
                size="small"
                class="mt-2"
              >
                {{ reportsStore.overviewReport?.reservations?.thisWeek || 0 }} esta semana
              </v-chip>
            </v-card>
          </v-col>
        </v-row>

        <!-- Gráficos -->
        <v-row class="mb-6">
          <v-col cols="12" md="8">
            <v-card>
              <v-card-title>📈 Ingresos por Mes</v-card-title>
              <v-card-text>
                <canvas ref="revenueChart" width="400" height="200"></canvas>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="4">
            <v-card>
              <v-card-title>👥 Distribución de Miembros</v-card-title>
              <v-card-text>
                <canvas ref="membershipChart" width="400" height="200"></canvas>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Reportes detallados -->
        <v-row>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>🏆 Top Clases por Asistencia</v-card-title>
              <v-card-text>
                <v-list density="compact">
                  <v-list-item
                    v-for="(classItem, index) in reports.topClasses"
                    :key="classItem.id"
                  >
                    <template v-slot:prepend>
                      <v-avatar size="32" :color="$vuetify.theme.current.dark ? 'white' : 'primary'">
                        <span class="text-white">{{ index + 1 }}</span>
                      </v-avatar>
                    </template>
                    <v-list-item-title>{{ classItem.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ classItem.instructor }} • {{ classItem.attendance }}% asistencia
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>💰 Top Productos por Ventas</v-card-title>
              <v-card-text>
                <v-list density="compact">
                  <v-list-item
                    v-for="(product, index) in reports.topProducts"
                    :key="product.id"
                  >
                    <template v-slot:prepend>
                      <v-avatar size="32" :color="$vuetify.theme.current.dark ? 'white' : 'success'">
                        <span class="text-white">{{ index + 1 }}</span>
                      </v-avatar>
                    </template>
                    <v-list-item-title>{{ product.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ product.sales }} ventas • ${{ product.revenue }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Exportar reportes -->
        <v-row class="mt-6">
          <v-col cols="12">
            <v-card>
              <v-card-title>📤 Exportar Reportes</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="3">
                    <v-btn
                      :color="$vuetify.theme.current.dark ? 'white' : 'success'"
                      block
                      prepend-icon="mdi-file-excel"
                      @click="exportToExcel"
                      :loading="exporting"
                    >
                      Exportar a Excel
                    </v-btn>
                  </v-col>
                  
                  <v-col cols="12" md="3">
                    <v-btn
                      :color="$vuetify.theme.current.dark ? 'white' : 'error'"
                      block
                      prepend-icon="mdi-file-pdf-box"
                      @click="exportToPDF"
                      :loading="exporting"
                    >
                      Exportar a PDF
                    </v-btn>
                  </v-col>
                  
                  <v-col cols="12" md="3">
                    <v-btn
                      :color="$vuetify.theme.current.dark ? 'white' : 'info'"
                      block
                      prepend-icon="mdi-chart-line"
                      @click="exportToCSV"
                      :loading="exporting"
                    >
                      Exportar a CSV
                    </v-btn>
                  </v-col>
                  
                  <v-col cols="12" md="3">
                    <v-btn
                      :color="$vuetify.theme.current.dark ? 'white' : 'warning'"
                      block
                      prepend-icon="mdi-email"
                      @click="sendReportEmail"
                      :loading="sendingEmail"
                    >
                      Enviar por Email
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from '@/stores/toast'
import { useReportsStore } from '@/stores/reports'
import Chart from 'chart.js/auto'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs.vue'

// Stores
const toast = useToast()
const reportsStore = useReportsStore()

// Referencias de gráficos
const revenueChart = ref<HTMLCanvasElement>()
const membershipChart = ref<HTMLCanvasElement>()

// Instancias de Chart.js para poder destruirlas
let revenueChartInstance: Chart | null = null
let membershipChartInstance: Chart | null = null

// Estado
const loading = ref(false)
const generatingReports = ref(false)
const exporting = ref(false)
const sendingEmail = ref(false)
const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)

// Filtros de fecha
const dateRange = ref('last30days')
const startDate = ref('')
const endDate = ref('')

// Opciones de rango de fechas
const dateRangeOptions = [
  { title: 'Últimos 7 días', value: 'last7days' },
  { title: 'Últimos 30 días', value: 'last30days' },
  { title: 'Últimos 90 días', value: 'last90days' },
  { title: 'Este año', value: 'thisYear' },
  { title: 'Personalizado', value: 'custom' }
]

// Datos de reportes
const reports = ref({
  totalRevenue: 125000,
  revenueGrowth: 12.5,
  totalMembers: 450,
  membershipGrowth: 8.2,
  totalClasses: 180,
  classesGrowth: 15.3,
  avgAttendance: 78.5,
  attendanceGrowth: -2.1,
  topClasses: [
    { id: '1', name: 'Spinning', instructor: 'Carlos López', attendance: 95 },
    { id: '2', name: 'Yoga', instructor: 'Ana García', attendance: 88 },
    { id: '3', name: 'CrossFit', instructor: 'Miguel Torres', attendance: 82 },
    { id: '4', name: 'Zumba', instructor: 'Sofia Ruiz', attendance: 79 },
    { id: '5', name: 'Pilates', instructor: 'Laura Mendez', attendance: 75 }
  ],
  topProducts: [
    { id: '1', name: 'Proteína Whey', sales: 45, revenue: 2070 },
    { id: '2', name: 'Creatina', sales: 38, revenue: 1140 },
    { id: '3', name: 'BCAA', sales: 32, revenue: 960 },
    { id: '4', name: 'Pre-Workout', sales: 28, revenue: 840 },
    { id: '5', name: 'Multivitamínico', sales: 25, revenue: 500 }
  ]
})

// Métodos
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('es-ES').format(num)
}

const handleDateRangeChange = (value: string) => {
  if (value === 'custom') {
    // Permitir selección manual de fechas
    return
  }
  
  // Calcular fechas automáticamente
  const today = new Date()
  const start = new Date()
  
  switch (value) {
    case 'last7days':
      start.setDate(today.getDate() - 7)
      break
    case 'last30days':
      start.setDate(today.getDate() - 30)
      break
    case 'last90days':
      start.setDate(today.getDate() - 90)
      break
    case 'thisYear':
      start.setFullYear(today.getFullYear(), 0, 1)
      break
  }
  
  // Formatear fechas correctamente (YYYY-MM-DD)
  startDate.value = start.toISOString().split('T')[0]
  endDate.value = today.toISOString().split('T')[0]
  
  generateReports()
}

const generateReports = async () => {
  try {
    generatingReports.value = true
    
    // Cargar reporte general con fechas seleccionadas
    await reportsStore.fetchOverviewReport(startDate.value, endDate.value)
    
    // Cargar reporte de ingresos
    await reportsStore.fetchRevenueReport(startDate.value, endDate.value)
    
    // Cargar reportes adicionales
    await Promise.all([
      reportsStore.fetchMembershipReport(),
      reportsStore.fetchClassReport(),
      reportsStore.fetchUserReport()
    ])
    
    toast.show('Reportes generados exitosamente', 'success')
    updateCharts()
  } catch (error) {
    console.error('Error generating reports:', error)
    toast.show('Error al generar reportes', 'error')
  } finally {
    generatingReports.value = false
  }
}

const updateCharts = () => {
  // Destruir gráficos existentes
  if (revenueChartInstance) {
    revenueChartInstance.destroy()
    revenueChartInstance = null
  }
  
  if (membershipChartInstance) {
    membershipChartInstance.destroy()
    membershipChartInstance = null
  }

  // Actualizar gráfico de ingresos
  if (revenueChart.value) {
    const ctx = revenueChart.value.getContext('2d')
    if (ctx) {
      revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          datasets: [{
            label: 'Ingresos ($)',
            data: [18000, 22000, 25000, 28000, 32000, 35000],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }
  }

  // Actualizar gráfico de membresías
  if (membershipChart.value) {
    const ctx = membershipChart.value.getContext('2d')
    if (ctx) {
      membershipChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Básica', 'Premium', 'Unlimited'],
          datasets: [{
            data: [200, 180, 70],
            backgroundColor: [
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)',
              'rgb(255, 99, 132)'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }
  }
}

const exportToExcel = async () => {
  try {
    exporting.value = true
    
    const overview = reportsStore.overviewReport
    const revenue = reportsStore.revenueReport
    
    // Crear contenido CSV (Excel puede abrir CSV)
    const csvContent = [
      // Header
      ['BNKR Gym Management - Reporte de Analytics'],
      [''],
      ['Período', `${startDate.value} - ${endDate.value}`],
      ['Generado', new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString('es-ES')],
      [''],
      
      // Métricas principales
      ['MÉTRICAS PRINCIPALES'],
      ['Ingresos Totales', `$${formatNumber(overview?.revenue?.total || 0)}`],
      ['Miembros Totales', overview?.memberships?.total || 0],
      ['Clases Totales', overview?.classes?.total || 0],
      ['Reservas Hoy', overview?.reservations?.today || 0],
      [''],
      
      // Usuarios
      ['USUARIOS'],
      ['Total de usuarios', overview?.users?.total || 0],
      ['Usuarios activos', overview?.users?.active || 0],
      ['Instructores', overview?.classes?.instructors || 0],
      [''],
      
      // Reservas
      ['RESERVAS'],
      ['Total de reservas', overview?.reservations?.total || 0],
      ['Pendientes', overview?.reservations?.pending || 0],
      ['Confirmadas', overview?.reservations?.confirmed || 0],
      ['Canceladas', overview?.reservations?.cancelled || 0],
      ['Esta semana', overview?.reservations?.thisWeek || 0],
      ['Este mes', overview?.reservations?.thisMonth || 0],
      [''],
      
      // Membresías
      ['MEMBRESÍAS'],
      ['Total de membresías', overview?.memberships?.total || 0],
      ['Membresías activas', overview?.memberships?.active || 0],
      ['Membresías expiradas', overview?.memberships?.expired || 0]
    ].map(row => row.join(',')).join('\n')
    
    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `reporte_bnkr_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.show('Reporte exportado a Excel (CSV) exitosamente', 'success')
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    toast.show('Error al exportar a Excel', 'error')
  } finally {
    exporting.value = false
  }
}

const generatePDFContent = () => {
  const overview = reportsStore.overviewReport
  const revenue = reportsStore.revenueReport
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 12px;">
      <!-- Header más compacto -->
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1976d2; padding-bottom: 15px;">
        <h1 style="color: #1976d2; margin: 0; font-size: 24px;">📊 BNKR Gym Management</h1>
        <h2 style="color: #333; margin: 8px 0; font-size: 18px;">Reporte de Analytics</h2>
        <p style="color: #666; margin: 3px 0; font-size: 12px;">
          Período: ${startDate.value} - ${endDate.value}
        </p>
        <p style="color: #666; margin: 3px 0; font-size: 11px;">
          Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}
        </p>
      </div>

      <!-- Métricas principales más compactas -->
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; font-size: 16px;">📈 Métricas Principales</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
          <div style="background: #f5f5f5; padding: 12px; border-radius: 6px; text-align: center;">
            <h4 style="margin: 0 0 8px 0; color: #1976d2; font-size: 14px;">💰 Ingresos</h4>
            <p style="font-size: 20px; font-weight: bold; margin: 0; color: #333;">
              $${formatNumber(overview?.revenue?.total || 0)}
            </p>
          </div>
          <div style="background: #f5f5f5; padding: 12px; border-radius: 6px; text-align: center;">
            <h4 style="margin: 0 0 8px 0; color: #4caf50; font-size: 14px;">👥 Miembros</h4>
            <p style="font-size: 20px; font-weight: bold; margin: 0; color: #333;">
              ${overview?.memberships?.total || 0}
            </p>
          </div>
          <div style="background: #f5f5f5; padding: 12px; border-radius: 6px; text-align: center;">
            <h4 style="margin: 0 0 8px 0; color: #ff9800; font-size: 14px;">🏋️ Clases</h4>
            <p style="font-size: 20px; font-weight: bold; margin: 0; color: #333;">
              ${overview?.classes?.total || 0}
            </p>
          </div>
          <div style="background: #f5f5f5; padding: 12px; border-radius: 6px; text-align: center;">
            <h4 style="margin: 0 0 8px 0; color: #2196f3; font-size: 14px;">📅 Hoy</h4>
            <p style="font-size: 20px; font-weight: bold; margin: 0; color: #333;">
              ${overview?.reservations?.today || 0}
            </p>
          </div>
        </div>
      </div>

      <!-- Secciones más compactas -->
      <div style="margin-bottom: 15px;">
        <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 6px; font-size: 15px;">👥 Usuarios</h3>
        <div style="background: #f9f9f9; padding: 12px; border-radius: 6px;">
          <p style="color: #333; margin: 5px 0; font-size: 12px;"><strong style="color: #1976d2;">Total:</strong> <span style="color: #000; font-weight: 600;">${overview?.users?.total || 0}</span></p>
          <p style="color: #333; margin: 5px 0; font-size: 12px;"><strong style="color: #1976d2;">Activos:</strong> <span style="color: #000; font-weight: 600;">${overview?.users?.active || 0}</span></p>
          <p style="color: #333; margin: 5px 0; font-size: 12px;"><strong style="color: #1976d2;">Instructores:</strong> <span style="color: #000; font-weight: 600;">${overview?.classes?.instructors || 0}</span></p>
        </div>
      </div>

      <div style="margin-bottom: 15px;">
        <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 6px; font-size: 15px;">📅 Reservas</h3>
        <div style="background: #f9f9f9; padding: 12px; border-radius: 6px;">
          <p style="color: #333; margin: 5px 0; font-size: 12px;"><strong style="color: #1976d2;">Total:</strong> <span style="color: #000; font-weight: 600;">${overview?.reservations?.total || 0}</span></p>
          <p style="color: #333; margin: 5px 0; font-size: 12px;"><strong style="color: #1976d2;">Pendientes:</strong> <span style="color: #000; font-weight: 600;">${overview?.reservations?.pending || 0}</span></p>
          <p style="color: #333; margin: 5px 0; font-size: 12px;"><strong style="color: #1976d2;">Confirmadas:</strong> <span style="color: #000; font-weight: 600;">${overview?.reservations?.confirmed || 0}</span></p>
          <p style="color: #333; margin: 5px 0; font-size: 12px;"><strong style="color: #1976d2;">Canceladas:</strong> <span style="color: #000; font-weight: 600;">${overview?.reservations?.cancelled || 0}</span></p>
          <p style="color: #333; margin: 5px 0; font-size: 12px;"><strong style="color: #1976d2;">Esta semana:</strong> <span style="color: #000; font-weight: 600;">${overview?.reservations?.thisWeek || 0}</span></p>
          <p style="color: #333; margin: 5px 0; font-size: 12px;"><strong style="color: #1976d2;">Este mes:</strong> <span style="color: #000; font-weight: 600;">${overview?.reservations?.thisMonth || 0}</span></p>
        </div>
      </div>

      <div style="margin-bottom: 15px;">
        <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 6px; font-size: 15px;">🎫 Membresías</h3>
        <div style="background: #f9f9f9; padding: 12px; border-radius: 6px;">
          <p style="color: #333; margin: 5px 0; font-size: 12px;"><strong style="color: #1976d2;">Total:</strong> <span style="color: #000; font-weight: 600;">${overview?.memberships?.total || 0}</span></p>
          <p style="color: #333; margin: 5px 0; font-size: 12px;"><strong style="color: #1976d2;">Activas:</strong> <span style="color: #000; font-weight: 600;">${overview?.memberships?.active || 0}</span></p>
          <p style="color: #333; margin: 5px 0; font-size: 12px;"><strong style="color: #1976d2;">Expiradas:</strong> <span style="color: #000; font-weight: 600;">${overview?.memberships?.expired || 0}</span></p>
        </div>
      </div>

      <!-- Footer más compacto -->
      <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; color: #666;">
        <p style="margin: 3px 0; font-size: 10px;">© 2025 BNKR Gym Management</p>
        <p style="margin: 3px 0; font-size: 10px;">Sistema de gestión integral para gimnasios</p>
      </div>
    </div>
  `
}

const exportToPDF = async () => {
  try {
    exporting.value = true
    
    // Crear un contenedor temporal para el PDF
    const pdfContainer = document.createElement('div')
    pdfContainer.style.position = 'absolute'
    pdfContainer.style.left = '-9999px'
    pdfContainer.style.top = '0'
    pdfContainer.style.width = '600px' // Reducir ancho para mejor ajuste
    pdfContainer.style.backgroundColor = 'white'
    pdfContainer.style.padding = '15px' // Reducir padding
    pdfContainer.style.fontFamily = 'Arial, sans-serif'
    pdfContainer.style.fontSize = '12px' // Tamaño de fuente base más pequeño
    
    // Generar contenido del PDF
    const pdfContent = generatePDFContent()
    pdfContainer.innerHTML = pdfContent
    
    // Agregar al DOM temporalmente
    document.body.appendChild(pdfContainer)
    
    // Convertir a canvas con escala optimizada
    const canvas = await html2canvas(pdfContainer, {
      scale: 1.5, // Reducir escala para mejor ajuste
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 600,
      height: pdfContainer.scrollHeight
    })
    
    // Remover contenedor temporal
    document.body.removeChild(pdfContainer)
    
    // Crear PDF optimizado
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const pageHeight = 297
    const margin = 10 // Márgenes de página
    
    // Calcular dimensiones optimizadas
    const contentWidth = pageWidth - (2 * margin)
    const contentHeight = (canvas.height * contentWidth) / canvas.width
    
    // Verificar si cabe en una sola página
    if (contentHeight <= (pageHeight - (2 * margin))) {
      // Todo cabe en una página
      pdf.addImage(canvas, 'PNG', margin, margin, contentWidth, contentHeight)
    } else {
      // Dividir en páginas de manera inteligente
      const maxContentHeight = pageHeight - (2 * margin)
      let remainingHeight = contentHeight
      let currentY = margin
      
      // Primera página
      const firstPageHeight = Math.min(maxContentHeight, contentHeight)
      pdf.addImage(canvas, 'PNG', margin, currentY, contentWidth, firstPageHeight)
      remainingHeight -= firstPageHeight
      currentY = margin - firstPageHeight
      
      // Páginas adicionales si es necesario
      while (remainingHeight > 0) {
        pdf.addPage()
        const pageContentHeight = Math.min(maxContentHeight, remainingHeight)
        pdf.addImage(canvas, 'PNG', margin, currentY, contentWidth, pageContentHeight)
        remainingHeight -= pageContentHeight
        currentY = margin - pageContentHeight
      }
    }
    
    // Descargar PDF
    const fileName = `reporte_bnkr_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
    
    toast.show('Reporte exportado a PDF exitosamente', 'success')
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    toast.show('Error al exportar a PDF', 'error')
  } finally {
    exporting.value = false
  }
}

const exportToCSV = async () => {
  try {
    exporting.value = true
    
    const overview = reportsStore.overviewReport
    
    // Crear contenido CSV más detallado
    const csvContent = [
      // Header
      ['BNKR Gym Management - Reporte Detallado CSV'],
      [''],
      ['Período', `${startDate.value} - ${endDate.value}`],
      ['Generado', new Date().toISOString()],
      [''],
      
      // Datos estructurados para análisis
      ['Categoría', 'Métrica', 'Valor', 'Unidad'],
      ['Ingresos', 'Total', overview?.revenue?.total || 0, 'USD'],
      ['Ingresos', 'Mensual', overview?.revenue?.monthly || 0, 'USD'],
      ['Ingresos', 'Crecimiento', overview?.revenue?.growth || 0, '%'],
      [''],
      ['Usuarios', 'Total', overview?.users?.total || 0, 'Personas'],
      ['Usuarios', 'Activos', overview?.users?.active || 0, 'Personas'],
      ['Usuarios', 'Crecimiento', overview?.users?.growth || 0, '%'],
      [''],
      ['Clases', 'Total', overview?.classes?.total || 0, 'Clases'],
      ['Clases', 'Activas', overview?.classes?.active || 0, 'Clases'],
      ['Clases', 'Instructores', overview?.classes?.instructors || 0, 'Personas'],
      ['Clases', 'Crecimiento', overview?.classes?.growth || 0, '%'],
      [''],
      ['Reservas', 'Total', overview?.reservations?.total || 0, 'Reservas'],
      ['Reservas', 'Pendientes', overview?.reservations?.pending || 0, 'Reservas'],
      ['Reservas', 'Confirmadas', overview?.reservations?.confirmed || 0, 'Reservas'],
      ['Reservas', 'Canceladas', overview?.reservations?.cancelled || 0, 'Reservas'],
      ['Reservas', 'Hoy', overview?.reservations?.today || 0, 'Reservas'],
      ['Reservas', 'Esta Semana', overview?.reservations?.thisWeek || 0, 'Reservas'],
      ['Reservas', 'Este Mes', overview?.reservations?.thisMonth || 0, 'Reservas'],
      [''],
      ['Membresías', 'Total', overview?.memberships?.total || 0, 'Membresías'],
      ['Membresías', 'Activas', overview?.memberships?.active || 0, 'Membresías'],
      ['Membresías', 'Expiradas', overview?.memberships?.expired || 0, 'Membresías'],
      ['Membresías', 'Crecimiento', overview?.memberships?.growth || 0, '%']
    ].map(row => row.join(',')).join('\n')
    
    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `reporte_detallado_bnkr_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.show('Reporte exportado a CSV exitosamente', 'success')
  } catch (error) {
    console.error('Error exporting to CSV:', error)
    toast.show('Error al exportar a CSV', 'error')
  } finally {
    exporting.value = false
  }
}

const sendReportEmail = async () => {
  try {
    sendingEmail.value = true
    
    // Simular envío de email (en producción se conectaría a un servicio de email)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Crear resumen del reporte para mostrar
    const overview = reportsStore.overviewReport
    const summary = `
      📊 Reporte BNKR Gym Management
      
      📅 Período: ${startDate.value} - ${endDate.value}
      💰 Ingresos: $${formatNumber(overview?.revenue?.total || 0)}
      👥 Miembros: ${overview?.memberships?.total || 0}
      🏋️ Clases: ${overview?.classes?.total || 0}
      📅 Reservas Hoy: ${overview?.reservations?.today || 0}
      
      📧 Este reporte ha sido "enviado" por email.
      🔧 En producción se conectaría a un servicio real de email.
    `
    
    // Mostrar resumen en consola para desarrollo
    console.log('📧 Reporte preparado para envío:', summary)
    
    toast.show('Reporte preparado para envío por email', 'success')
    
    // En producción, aquí se haría la llamada real al servicio de email
    // await emailService.sendReport({
    //   to: 'admin@bnkrgym.com',
    //   subject: 'Reporte BNKR Gym Management',
    //   content: summary,
    //   attachments: [pdfBlob, csvBlob]
    // })
    
  } catch (error) {
    console.error('Error sending email:', error)
    toast.show('Error al preparar envío por email', 'error')
  } finally {
    sendingEmail.value = false
  }
}

// Watcher para formatear fechas
watch([startDate, endDate], ([newStartDate, newEndDate]) => {
  // Asegurar que las fechas estén en formato YYYY-MM-DD
  if (newStartDate && typeof newStartDate === 'string' && newStartDate.includes('GMT')) {
    const date = new Date(newStartDate)
    startDate.value = date.toISOString().split('T')[0]
  }
  
  if (newEndDate && typeof newEndDate === 'string' && newEndDate.includes('GMT')) {
    const date = new Date(newEndDate)
    endDate.value = date.toISOString().split('T')[0]
  }
})

// Lifecycle
onMounted(async () => {
  // Configurar fechas por defecto
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 30)
  
  startDate.value = thirtyDaysAgo.toISOString().split('T')[0]
  endDate.value = today.toISOString().split('T')[0]
  
  // Generar reportes iniciales
  await generateReports()
})
</script>
