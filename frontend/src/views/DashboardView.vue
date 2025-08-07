<template>
  <div class="dashboard-page">
    <div class="dashboard-container">
      <!-- Header del Dashboard -->
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1 class="dashboard-title">¡Bienvenido, {{ user?.name }}!</h1>
          <p class="dashboard-subtitle">Tu centro de control personal</p>
        </div>
        <div class="user-info">
          <v-avatar size="48" color="#ff6b35">
            <span class="text-white font-weight-bold">{{ user?.name?.charAt(0) }}</span>
          </v-avatar>
        </div>
      </div>

      <!-- Tarjetas de resumen -->
      <div class="summary-cards">
        <v-card class="summary-card membership-card" elevation="2">
          <v-card-text>
            <div class="card-content">
              <v-icon size="32" color="#4CAF50" class="card-icon">mdi-card-membership</v-icon>
              <div class="card-info">
                <h3 class="card-title">Membresía</h3>
                <p class="card-value">{{ membershipStatus }}</p>
                <p class="card-subtitle">{{ membershipExpiry }}</p>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="summary-card reservations-card" elevation="2">
          <v-card-text>
            <div class="card-content">
              <v-icon size="32" color="#2196F3" class="card-icon">mdi-calendar-check</v-icon>
              <div class="card-info">
                <h3 class="card-title">Citas Activas</h3>
                <p class="card-value">{{ activeReservations }}</p>
                <p class="card-subtitle">Próxima: {{ nextReservation }}</p>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="summary-card classes-card" elevation="2">
          <v-card-text>
            <div class="card-content">
              <v-icon size="32" color="#FF9800" class="card-icon">mdi-dumbbell</v-icon>
              <div class="card-info">
                <h3 class="card-title">Clases Tomadas</h3>
                <p class="card-value">{{ totalClasses }}</p>
                <p class="card-subtitle">Este mes</p>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="summary-card points-card" elevation="2">
          <v-card-text>
            <div class="card-content">
              <v-icon size="32" color="#9C27B0" class="card-icon">mdi-star</v-icon>
              <div class="card-info">
                <h3 class="card-title">Puntos BNKR</h3>
                <p class="card-value">{{ loyaltyPoints }}</p>
                <p class="card-subtitle">Disponibles</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Módulos principales -->
      <div class="modules-grid">
        <!-- Módulo de Membresías -->
        <v-card class="module-card" elevation="3" @click="navigateTo('/membership')">
          <v-card-text class="module-content">
            <div class="module-icon">
              <v-icon size="48" color="#4CAF50">mdi-card-membership</v-icon>
            </div>
            <h3 class="module-title">Membresías</h3>
            <p class="module-description">Gestiona tu membresía, renueva o cambia de plan</p>
            <v-btn variant="outlined" color="#4CAF50" class="module-btn">
              Ver Detalles
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Módulo de Citas -->
        <v-card class="module-card" elevation="3" @click="navigateTo('/reservations')">
          <v-card-text class="module-content">
            <div class="module-icon">
              <v-icon size="48" color="#2196F3">mdi-calendar-clock</v-icon>
            </div>
            <h3 class="module-title">Citas & Reservas</h3>
            <p class="module-description">Reserva clases, cancela o reprograma citas</p>
            <v-btn variant="outlined" color="#2196F3" class="module-btn">
              Gestionar Citas
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Módulo de Clases -->
        <v-card class="module-card" elevation="3" @click="navigateTo('/classes')">
          <v-card-text class="module-content">
            <div class="module-icon">
              <v-icon size="48" color="#FF9800">mdi-dumbbell</v-icon>
            </div>
            <h3 class="module-title">Clases Disponibles</h3>
            <p class="module-description">Explora y reserva clases disponibles</p>
            <v-btn variant="outlined" color="#FF9800" class="module-btn">
              Ver Clases
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Módulo de Perfil -->
        <v-card class="module-card" elevation="3" @click="navigateTo('/profile')">
          <v-card-text class="module-content">
            <div class="module-icon">
              <v-icon size="48" color="#9C27B0">mdi-account-edit</v-icon>
            </div>
            <h3 class="module-title">Mi Perfil</h3>
            <p class="module-description">Actualiza tu información personal</p>
            <v-btn variant="outlined" color="#9C27B0" class="module-btn">
              Editar Perfil
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Módulo de Historial -->
        <v-card class="module-card" elevation="3" @click="navigateTo('/history')">
          <v-card-text class="module-content">
            <div class="module-icon">
              <v-icon size="48" color="#607D8B">mdi-history</v-icon>
            </div>
            <h3 class="module-title">Historial</h3>
            <p class="module-description">Revisa tu historial de clases y pagos</p>
            <v-btn variant="outlined" color="#607D8B" class="module-btn">
              Ver Historial
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Módulo de Soporte -->
        <v-card class="module-card" elevation="3" @click="navigateTo('/support')">
          <v-card-text class="module-content">
            <div class="module-icon">
              <v-icon size="48" color="#E91E63">mdi-help-circle</v-icon>
            </div>
            <h3 class="module-title">Soporte</h3>
            <p class="module-description">Contacta con nuestro equipo de soporte</p>
            <v-btn variant="outlined" color="#E91E63" class="module-btn">
              Contactar
            </v-btn>
          </v-card-text>
        </v-card>
      </div>

      <!-- Próximas actividades -->
      <div class="upcoming-activities">
        <h2 class="section-title">Próximas Actividades</h2>
        <div class="activities-list">
          <v-card v-for="activity in upcomingActivities" :key="activity.id" class="activity-card" elevation="1">
            <v-card-text class="activity-content">
              <div class="activity-info">
                <h4 class="activity-title">{{ activity.title }}</h4>
                <p class="activity-time">{{ activity.time }}</p>
                <p class="activity-instructor">Instructor: {{ activity.instructor }}</p>
              </div>
              <v-chip :color="activity.status === 'confirmed' ? 'success' : 'warning'" size="small">
                {{ activity.status === 'confirmed' ? 'Confirmada' : 'Pendiente' }}
              </v-chip>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'

const router = useRouter()
const auth = useAuth()

const user = computed(() => auth.user)

// Datos de ejemplo - en producción vendrían del backend
const membershipStatus = ref('Premium Activa')
const membershipExpiry = ref('Expira: 15 Dic 2024')
const activeReservations = ref(3)
const nextReservation = ref('Yoga - Mañana 9:00 AM')
const totalClasses = ref(12)
const loyaltyPoints = ref(450)

const upcomingActivities = ref([
  {
    id: 1,
    title: 'Yoga Flow',
    time: 'Mañana 9:00 AM',
    instructor: 'Ana García',
    status: 'confirmed'
  },
  {
    id: 2,
    title: 'Spinning',
    time: 'Tarde 6:00 PM',
    instructor: 'Carlos López',
    status: 'confirmed'
  },
  {
    id: 3,
    title: 'Pilates',
    time: 'Mañana 11:00 AM',
    instructor: 'María Rodríguez',
    status: 'pending'
  }
])

const navigateTo = (path: string) => {
  router.push(path)
}

onMounted(() => {
  // Aquí cargaríamos los datos reales del usuario desde el backend
  console.log('Dashboard cargado para usuario:', user.value?.name)
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 5px;
}

.dashboard-subtitle {
  color: #666;
  font-size: 1.1rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  flex-shrink: 0;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
}

.card-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.card-subtitle {
  font-size: 0.8rem;
  color: #999;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.module-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.module-content {
  text-align: center;
  padding: 30px 20px;
}

.module-icon {
  margin-bottom: 16px;
}

.module-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.module-description {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.module-btn {
  font-weight: 500;
}

.upcoming-activities {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-card {
  border-radius: 8px;
}

.activity-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.activity-info {
  flex: 1;
}

.activity-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 2px;
}

.activity-instructor {
  font-size: 0.8rem;
  color: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-page {
    padding: 10px;
  }
  
  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .dashboard-title {
    font-size: 1.5rem;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style> 