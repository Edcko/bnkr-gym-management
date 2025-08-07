<template>
  <div class="membership-page">
    <div class="membership-container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">Mi Membresía</h1>
        <p class="page-subtitle">Gestiona tu plan de membresía</p>
      </div>

      <!-- Loading state -->
      <v-progress-circular
        v-if="membershipsStore.loading"
        indeterminate
        color="primary"
        size="64"
        class="loading-spinner"
      />

      <!-- Estado actual de la membresía -->
      <v-card v-if="!membershipsStore.loading && currentMembership" class="current-membership-card" elevation="3">
        <v-card-text>
          <div class="membership-status">
            <div class="status-info">
              <h2 class="status-title">Membresía Actual</h2>
              <div class="plan-details">
                <v-chip :color="getPlanColor(currentMembership.type)" size="large" class="plan-type">
                  {{ getPlanName(currentMembership.type) }}
                </v-chip>
                <p class="plan-description">{{ getPlanDescription(currentMembership.type) }}</p>
              </div>
              <div class="membership-details">
                <div class="detail-item">
                  <span class="detail-label">Estado:</span>
                  <v-chip :color="currentMembership.status === 'ACTIVE' ? 'success' : 'warning'" size="small">
                    {{ getStatusText(currentMembership.status) }}
                  </v-chip>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Fecha de inicio:</span>
                  <span class="detail-value">{{ formatDate(currentMembership.startDate) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Fecha de expiración:</span>
                  <span class="detail-value">{{ formatDate(currentMembership.endDate) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Días restantes:</span>
                  <span class="detail-value">{{ remainingDays }} días</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Precio:</span>
                  <span class="detail-value">${{ currentMembership.price }}</span>
                </div>
              </div>
            </div>
            <div class="status-actions">
              <v-btn color="primary" variant="outlined" @click="showRenewalDialog = true">
                Renovar Membresía
              </v-btn>
              <v-btn color="secondary" variant="outlined" @click="showUpgradeDialog = true">
                Cambiar Plan
              </v-btn>
              <v-btn color="error" variant="outlined" @click="showCancelDialog = true">
                Cancelar Membresía
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- No membership message -->
      <v-card v-if="!membershipsStore.loading && !currentMembership" class="no-membership-card" elevation="3">
        <v-card-text class="text-center">
          <v-icon size="64" color="grey" class="mb-4">mdi-account-off</v-icon>
          <h3 class="text-h5 mb-2">No tienes una membresía activa</h3>
          <p class="text-body-1 mb-4">Selecciona un plan para comenzar a disfrutar de nuestros servicios</p>
          <v-btn color="primary" size="large" @click="showUpgradeDialog = true">
            Ver Planes Disponibles
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Beneficios de la membresía actual -->
      <v-card v-if="currentMembership" class="benefits-card" elevation="2">
        <v-card-title>Beneficios de tu Plan</v-card-title>
        <v-card-text>
          <div class="benefits-grid">
            <div v-for="benefit in getPlanBenefits(currentMembership.type)" :key="benefit" class="benefit-item">
              <v-icon icon="mdi-check-circle" color="success" size="24"></v-icon>
              <span class="benefit-text">{{ benefit }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Planes disponibles -->
      <div class="plans-section">
        <h2 class="section-title">Planes Disponibles</h2>
        <div class="plans-grid">
          <v-card 
            v-for="plan in membershipsStore.availablePlans" 
            :key="plan.id" 
            class="plan-card"
            :class="{ 'current-plan': currentMembership?.type === plan.id }"
            elevation="2"
          >
            <v-card-text class="plan-content">
              <div class="plan-header">
                <h3 class="plan-name">{{ plan.name }}</h3>
                <div class="plan-price">
                  <span class="price-amount">${{ plan.price }}</span>
                  <span class="price-period">/mes</span>
                </div>
              </div>
              <p class="plan-description">{{ plan.description }}</p>
              <div class="plan-features">
                <div v-for="feature in plan.features" :key="feature" class="feature-item">
                  <v-icon icon="mdi-check" color="success" size="16"></v-icon>
                  <span>{{ feature }}</span>
                </div>
              </div>
              <div class="plan-actions">
                <v-btn 
                  v-if="currentMembership?.type === plan.id"
                  color="success"
                  variant="outlined"
                  disabled
                >
                  Plan Actual
                </v-btn>
                <v-btn 
                  v-else
                  color="primary"
                  @click="selectPlan(plan)"
                >
                  Seleccionar Plan
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>

      <!-- Historial de pagos -->
      <v-card v-if="currentMembership?.payments?.length" class="payment-history-card" elevation="2">
        <v-card-title>Historial de Pagos</v-card-title>
        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in currentMembership.payments" :key="payment.id">
                <td>{{ formatDate(payment.createdAt) }}</td>
                <td>{{ payment.description || 'Pago de membresía' }}</td>
                <td>${{ payment.amount }}</td>
                <td>
                  <v-chip :color="getPaymentStatusColor(payment.status)" size="small">
                    {{ getPaymentStatusText(payment.status) }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </div>

    <!-- Renewal Dialog -->
    <v-dialog v-model="showRenewalDialog" max-width="400px">
      <v-card>
        <v-card-title>Renovar Membresía</v-card-title>
        <v-card-text>
          <p class="mb-4">¿Por cuántos meses quieres renovar tu membresía?</p>
          <v-select
            v-model="renewalMonths"
            :items="[1, 3, 6, 12]"
            label="Meses"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="showRenewalDialog = false">
            Cancelar
          </v-btn>
          <v-btn 
            color="primary" 
            @click="renewMembership"
            :loading="membershipsStore.loading"
          >
            Renovar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Upgrade Dialog -->
    <v-dialog v-model="showUpgradeDialog" max-width="500px">
      <v-card>
        <v-card-title>Cambiar Plan</v-card-title>
        <v-card-text>
          <p class="mb-4">Selecciona el nuevo plan:</p>
          <v-radio-group v-model="selectedPlanId">
            <v-radio
              v-for="plan in membershipsStore.availablePlans"
              :key="plan.id"
              :value="plan.id"
              :label="`${plan.name} - $${plan.price}/mes`"
            />
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="showUpgradeDialog = false">
            Cancelar
          </v-btn>
          <v-btn 
            color="primary" 
            @click="changePlan"
            :loading="membershipsStore.loading"
            :disabled="!selectedPlanId"
          >
            Cambiar Plan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Cancel Dialog -->
    <v-dialog v-model="showCancelDialog" max-width="400px">
      <v-card>
        <v-card-title>Cancelar Membresía</v-card-title>
        <v-card-text>
          <p class="mb-4">¿Estás seguro de que quieres cancelar tu membresía? Esta acción no se puede deshacer.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="showCancelDialog = false">
            No, mantener
          </v-btn>
          <v-btn 
            color="error" 
            @click="cancelMembership"
            :loading="membershipsStore.loading"
          >
            Sí, cancelar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMembershipsStore } from '@/stores/memberships'
import { useToast } from '@/stores/toast'

const router = useRouter()
const membershipsStore = useMembershipsStore()
const toast = useToast()

// Reactive data
const showRenewalDialog = ref(false)
const showUpgradeDialog = ref(false)
const showCancelDialog = ref(false)
const renewalMonths = ref(1)
const selectedPlanId = ref('')

// Computed
const currentMembership = computed(() => membershipsStore.currentMembership)

const remainingDays = computed(() => {
  if (!currentMembership.value) return 0
  const endDate = new Date(currentMembership.value.endDate)
  const now = new Date()
  const diffTime = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
})

// Methods
const loadMembershipData = async () => {
  await Promise.all([
    membershipsStore.fetchActiveMembership(),
    membershipsStore.fetchAvailablePlans()
  ])
}

const getPlanName = (type: string) => {
  const planNames = {
    BASIC: 'Básico',
    PREMIUM: 'Premium',
    UNLIMITED: 'Ilimitado'
  }
  return planNames[type as keyof typeof planNames] || type
}

const getPlanColor = (type: string) => {
  const colors = {
    BASIC: 'primary',
    PREMIUM: 'warning',
    UNLIMITED: 'error'
  }
  return colors[type as keyof typeof colors] || 'primary'
}

const getPlanDescription = (type: string) => {
  const descriptions = {
    BASIC: 'Acceso a clases básicas y gimnasio',
    PREMIUM: 'Acceso completo a todas las clases y servicios',
    UNLIMITED: 'Todo incluido + servicios premium'
  }
  return descriptions[type as keyof typeof descriptions] || ''
}

const getPlanBenefits = (type: string) => {
  const benefits = {
    BASIC: [
      'Acceso a clases básicas',
      'Gimnasio básico',
      'Casillero temporal'
    ],
    PREMIUM: [
      'Acceso ilimitado a todas las clases',
      'Entrenamiento personalizado',
      'Acceso a spa y sauna',
      'Casillero personal',
      'Toallas incluidas',
      'Puntos de lealtad premium'
    ],
    UNLIMITED: [
      'Todo lo del plan Premium',
      'Entrenador personal dedicado',
      'Evaluaciones nutricionales',
      'Clases privadas incluidas',
      'Acceso 24/7',
      'Estacionamiento incluido'
    ]
  }
  return benefits[type as keyof typeof benefits] || []
}

const getStatusText = (status: string) => {
  const statusTexts = {
    ACTIVE: 'Activa',
    EXPIRED: 'Expirada',
    CANCELLED: 'Cancelada'
  }
  return statusTexts[status as keyof typeof statusTexts] || status
}

const getPaymentStatusColor = (status: string) => {
  const colors = {
    PENDING: 'warning',
    COMPLETED: 'success',
    FAILED: 'error',
    REFUNDED: 'info'
  }
  return colors[status as keyof typeof colors] || 'grey'
}

const getPaymentStatusText = (status: string) => {
  const texts = {
    PENDING: 'Pendiente',
    COMPLETED: 'Completado',
    FAILED: 'Fallido',
    REFUNDED: 'Reembolsado'
  }
  return texts[status as keyof typeof texts] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES')
}

const selectPlan = (plan: any) => {
  selectedPlanId.value = plan.id
  showUpgradeDialog.value = true
}

const renewMembership = async () => {
  if (!currentMembership.value) return

  try {
    await membershipsStore.renewMembership(currentMembership.value.id, renewalMonths.value)
    showRenewalDialog.value = false
    await loadMembershipData()
         toast.show('Membresía renovada exitosamente', 'success')
  } catch (error) {
    console.error('Error renewing membership:', error)
  }
}

const changePlan = async () => {
  if (!currentMembership.value || !selectedPlanId.value) return

  try {
    await membershipsStore.changeMembershipType(currentMembership.value.id, selectedPlanId.value as any)
    showUpgradeDialog.value = false
    selectedPlanId.value = ''
    await loadMembershipData()
         toast.show('Plan cambiado exitosamente', 'success')
  } catch (error) {
    console.error('Error changing plan:', error)
  }
}

const cancelMembership = async () => {
  if (!currentMembership.value) return

  try {
    await membershipsStore.cancelMembership(currentMembership.value.id)
    showCancelDialog.value = false
    await loadMembershipData()
         toast.show('Membresía cancelada exitosamente', 'success')
  } catch (error) {
    console.error('Error cancelling membership:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadMembershipData()
})
</script>

<style scoped>
.membership-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.membership-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #666;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  margin: 40px 0;
}

.current-membership-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.membership-status {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.status-title {
  font-size: 1.5rem;
  margin-bottom: 16px;
  color: white;
}

.plan-details {
  margin-bottom: 20px;
}

.plan-type {
  margin-bottom: 8px;
}

.plan-description {
  font-size: 1rem;
  opacity: 0.9;
}

.membership-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-weight: 500;
  opacity: 0.9;
}

.detail-value {
  font-weight: 600;
}

.status-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
}

.benefits-card {
  margin-top: 24px;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.benefit-text {
  font-weight: 500;
}

.plans-section {
  margin-top: 32px;
}

.section-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.plan-card {
  transition: transform 0.2s ease;
}

.plan-card:hover {
  transform: translateY(-4px);
}

.plan-card.current-plan {
  border: 2px solid #4caf50;
}

.plan-content {
  padding: 24px;
}

.plan-header {
  text-align: center;
  margin-bottom: 16px;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.plan-price {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 4px;
}

.price-amount {
  font-size: 2rem;
  font-weight: bold;
  color: #1976d2;
}

.price-period {
  font-size: 1rem;
  color: #666;
}

.plan-description {
  text-align: center;
  margin-bottom: 20px;
  color: #666;
}

.plan-features {
  margin-bottom: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.plan-actions {
  text-align: center;
}

.payment-history-card {
  margin-top: 24px;
}

.no-membership-card {
  text-align: center;
  padding: 40px;
}

@media (max-width: 768px) {
  .membership-status {
    flex-direction: column;
    align-items: center;
  }

  .status-actions {
    width: 100%;
    flex-direction: row;
    justify-content: center;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
  }
}
</style> 