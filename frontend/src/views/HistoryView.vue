<template>
  <div class="history-page">
    <div class="history-container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">Mi Historial</h1>
        <p class="page-subtitle">Revisa tu actividad en BNKR Gym</p>
      </div>

      <!-- Filtros -->
      <v-card class="filters-card" elevation="2">
        <v-card-text>
          <div class="filters-content">
            <div class="filter-group">
              <v-select
                v-model="selectedType"
                :items="filterTypes"
                label="Tipo de actividad"
                variant="outlined"
                density="compact"
                class="filter-select"
              ></v-select>
            </div>
            <div class="filter-group">
              <v-select
                v-model="selectedPeriod"
                :items="filterPeriods"
                label="Período"
                variant="outlined"
                density="compact"
                class="filter-select"
              ></v-select>
            </div>
            <div class="filter-group">
              <v-text-field
                v-model="searchQuery"
                label="Buscar"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                class="filter-search"
              ></v-text-field>
            </div>
            <div class="filter-group">
                          <v-btn :color="$vuetify.theme.current.dark ? 'white' : 'primary'" @click="applyFilters">
              Aplicar Filtros
            </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Estadísticas -->
      <div class="stats-grid">
        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-content">
              <v-icon size="32" color="#4CAF50" class="stat-icon">mdi-dumbbell</v-icon>
              <div class="stat-info">
                <h3 class="stat-value">{{ totalClasses }}</h3>
                <p class="stat-label">Clases Tomadas</p>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-content">
              <v-icon size="32" color="#2196F3" class="stat-icon">mdi-calendar-check</v-icon>
              <div class="stat-info">
                <h3 class="stat-value">{{ totalReservations }}</h3>
                <p class="stat-label">Reservas Realizadas</p>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-content">
              <v-icon size="32" color="#FF9800" class="stat-icon">mdi-currency-usd</v-icon>
              <div class="stat-info">
                <h3 class="stat-value">${{ totalSpent }}</h3>
                <p class="stat-label">Total Gastado</p>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-content">
              <v-icon size="32" color="#9C27B0" class="stat-icon">mdi-star</v-icon>
              <div class="stat-info">
                <h3 class="stat-value">{{ totalPoints }}</h3>
                <p class="stat-label">Puntos Ganados</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Tabs de contenido -->
      <v-card class="content-card" elevation="2">
        <v-tabs v-model="activeTab" :color="$vuetify.theme.current.dark ? 'white' : 'primary'">
          <v-tab value="classes">Clases</v-tab>
          <v-tab value="reservations">Reservas</v-tab>
          <v-tab value="payments">Pagos</v-tab>
          <v-tab value="activities">Actividades</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <!-- Tab de Clases -->
          <v-window-item value="classes">
            <v-card-text>
              <div class="history-list">
                <v-card 
                  v-for="classItem in filteredClasses" 
                  :key="classItem.id" 
                  class="history-item"
                  elevation="1"
                >
                  <v-card-text class="item-content">
                    <div class="item-info">
                      <div class="item-header">
                        <h4 class="item-title">{{ classItem.name }}</h4>
                        <v-chip :color="getStatusColor(classItem.status)" size="small">
                          {{ classItem.status }}
                        </v-chip>
                      </div>
                      <div class="item-details">
                        <p class="item-date">{{ classItem.date }}</p>
                        <p class="item-time">{{ classItem.time }}</p>
                        <p class="item-instructor">Instructor: {{ classItem.instructor }}</p>
                        <p class="item-duration">Duración: {{ classItem.duration }} min</p>
                      </div>
                    </div>
                    <div class="item-actions">
                      <v-btn size="small" variant="outlined" @click="viewClassDetails(classItem.id)">
                        Ver Detalles
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-card-text>
          </v-window-item>

          <!-- Tab de Reservas -->
          <v-window-item value="reservations">
            <v-card-text>
              <div class="history-list">
                <v-card 
                  v-for="reservation in filteredReservations" 
                  :key="reservation.id" 
                  class="history-item"
                  elevation="1"
                >
                  <v-card-text class="item-content">
                    <div class="item-info">
                      <div class="item-header">
                        <h4 class="item-title">{{ reservation.className }}</h4>
                        <v-chip :color="getStatusColor(reservation.status)" size="small">
                          {{ reservation.status }}
                        </v-chip>
                      </div>
                      <div class="item-details">
                        <p class="item-date">{{ reservation.date }}</p>
                        <p class="item-time">{{ reservation.time }}</p>
                        <p class="item-instructor">Instructor: {{ reservation.instructor }}</p>
                        <p class="item-notes" v-if="reservation.notes">Notas: {{ reservation.notes }}</p>
                      </div>
                    </div>
                    <div class="item-actions">
                      <v-btn size="small" variant="outlined" @click="viewReservationDetails(reservation.id)">
                        Ver Detalles
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-card-text>
          </v-window-item>

          <!-- Tab de Pagos -->
          <v-window-item value="payments">
            <v-card-text>
              <v-table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="payment in filteredPayments" :key="payment.id">
                    <td>{{ payment.date }}</td>
                    <td>{{ payment.description }}</td>
                    <td>${{ payment.amount }}</td>
                    <td>
                      <v-chip :color="payment.status === 'completed' ? 'success' : 'warning'" size="small">
                        {{ payment.status === 'completed' ? 'Completado' : 'Pendiente' }}
                      </v-chip>
                    </td>
                    <td>
                      <v-btn size="small" variant="text" @click="downloadInvoice(payment.id)">
                        Factura
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-window-item>

          <!-- Tab de Actividades -->
          <v-window-item value="activities">
            <v-card-text>
              <div class="timeline">
                <div 
                  v-for="activity in filteredActivities" 
                  :key="activity.id" 
                  class="timeline-item"
                >
                  <div class="timeline-marker">
                    <v-icon :icon="activity.icon" :color="activity.color" size="20"></v-icon>
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <h4 class="timeline-title">{{ activity.title }}</h4>
                      <span class="timeline-date">{{ activity.date }}</span>
                    </div>
                    <p class="timeline-description">{{ activity.description }}</p>
                    <div class="timeline-meta">
                      <span class="timeline-time">{{ activity.time }}</span>
                      <span class="timeline-category">{{ activity.category }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-window-item>
        </v-window>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/stores/toast'

const toast = useToast()

// Estados de filtros
const selectedType = ref('all')
const selectedPeriod = ref('all')
const searchQuery = ref('')
const activeTab = ref('classes')

// Estadísticas
const totalClasses = ref(45)
const totalReservations = ref(32)
const totalSpent = ref(1250.50)
const totalPoints = ref(850)

// Opciones de filtros
const filterTypes = [
  { title: 'Todas las actividades', value: 'all' },
  { title: 'Clases', value: 'classes' },
  { title: 'Reservas', value: 'reservations' },
  { title: 'Pagos', value: 'payments' }
]

const filterPeriods = [
  { title: 'Todo el tiempo', value: 'all' },
  { title: 'Este mes', value: 'month' },
  { title: 'Últimos 3 meses', value: '3months' },
  { title: 'Este año', value: 'year' }
]

// Datos de ejemplo
const classes = ref([
  {
    id: 1,
    name: 'Yoga Flow',
    date: '15/11/2024',
    time: '09:00 AM',
    instructor: 'Ana García',
    duration: 60,
    status: 'Completada'
  },
  {
    id: 2,
    name: 'Spinning',
    date: '14/11/2024',
    time: '06:00 PM',
    instructor: 'Carlos López',
    duration: 45,
    status: 'Completada'
  },
  {
    id: 3,
    name: 'Pilates',
    date: '13/11/2024',
    time: '11:00 AM',
    instructor: 'María Rodríguez',
    duration: 60,
    status: 'Cancelada'
  }
])

const reservations = ref([
  {
    id: 1,
    className: 'Yoga Flow',
    date: '20/11/2024',
    time: '09:00 AM',
    instructor: 'Ana García',
    status: 'Confirmada',
    notes: 'Clase especial de meditación'
  },
  {
    id: 2,
    className: 'Spinning',
    date: '21/11/2024',
    time: '06:00 PM',
    instructor: 'Carlos López',
    status: 'Pendiente',
    notes: ''
  }
])

const payments = ref([
  {
    id: 1,
    date: '01/11/2024',
    description: 'Membresía Premium - Noviembre',
    amount: 89.99,
    status: 'completed'
  },
  {
    id: 2,
    date: '15/10/2024',
    description: 'Clase privada - Pilates',
    amount: 25.00,
    status: 'completed'
  },
  {
    id: 3,
    date: '01/10/2024',
    description: 'Membresía Premium - Octubre',
    amount: 89.99,
    status: 'completed'
  }
])

const activities = ref([
  {
    id: 1,
    title: 'Nueva membresía activada',
    description: 'Se activó tu membresía Premium',
    date: '01/11/2024',
    time: '10:30 AM',
    category: 'Membresía',
    icon: 'mdi-card-membership',
    color: 'success'
  },
  {
    id: 2,
    title: 'Clase completada',
    description: 'Completaste la clase de Yoga Flow',
    date: '15/11/2024',
    time: '10:00 AM',
    category: 'Clase',
    icon: 'mdi-dumbbell',
    color: 'primary'
  },
  {
    id: 3,
    title: 'Puntos ganados',
    description: 'Ganaste 50 puntos por completar una clase',
    date: '15/11/2024',
    time: '10:05 AM',
    category: 'Puntos',
    icon: 'mdi-star',
    color: 'warning'
  }
])

// Computed properties para filtros
const filteredClasses = computed(() => {
  return classes.value.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         item.instructor.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesSearch
  })
})

const filteredReservations = computed(() => {
  return reservations.value.filter(item => {
    const matchesSearch = item.className.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         item.instructor.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesSearch
  })
})

const filteredPayments = computed(() => {
  return payments.value.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesSearch
  })
})

const filteredActivities = computed(() => {
  return activities.value.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesSearch
  })
})

// Métodos
const applyFilters = () => {
  toast.show('Filtros aplicados', 'info')
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completada':
    case 'confirmada':
    case 'completed':
      return 'success'
    case 'pendiente':
    case 'pending':
      return 'warning'
    case 'cancelada':
    case 'cancelled':
      return 'error'
    default:
      return 'info'
  }
}

const viewClassDetails = (id: number) => {
  toast.show(`Viendo detalles de la clase ${id}`, 'info')
}

const viewReservationDetails = (id: number) => {
  toast.show(`Viendo detalles de la reserva ${id}`, 'info')
}

const downloadInvoice = (id: number) => {
  toast.show('Descargando factura...', 'info')
}

onMounted(() => {
  console.log('Vista de historial cargada')
})
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.history-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #666;
}

.filters-card {
  margin-bottom: 30px;
  border-radius: 12px;
}

.filters-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.content-card {
  border-radius: 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.history-item:hover {
  transform: translateY(-2px);
}

.item-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
}

.item-info {
  flex: 1;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.item-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}

.item-date,
.item-time,
.item-instructor,
.item-duration,
.item-notes {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.item-actions {
  flex-shrink: 0;
  margin-left: 20px;
}

.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e0e0e0;
}

.timeline-item {
  position: relative;
  margin-bottom: 30px;
}

.timeline-marker {
  position: absolute;
  left: -22px;
  top: 0;
  width: 30px;
  height: 30px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timeline-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.timeline-date {
  font-size: 0.8rem;
  color: #666;
}

.timeline-description {
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}

.timeline-meta {
  display: flex;
  gap: 16px;
}

.timeline-time,
.timeline-category {
  font-size: 0.8rem;
  color: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .history-page {
    padding: 10px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .filters-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .item-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .item-actions {
    margin-left: 0;
    align-self: flex-end;
  }
  
  .timeline {
    padding-left: 20px;
  }
  
  .timeline-marker {
    left: -12px;
  }
}
</style> 