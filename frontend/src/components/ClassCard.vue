<template>
  <v-card
    class="class-card"
    elevation="4"
    hover
    @click="handleCardClick"
  >
    <!-- Imagen de la clase -->
    <v-img
      :src="classImage"
      height="200"
      cover
      class="class-image"
    >
      <template v-slot:placeholder>
        <v-row
          class="fill-height ma-0"
          align="center"
          justify="center"
        >
          <v-icon
            icon="mdi-dumbbell"
            size="64"
            color="grey-lighten-1"
          ></v-icon>
        </v-row>
      </template>

      <!-- Badge de estado -->
      <v-chip
        v-if="!classData.isActive"
        color="error"
        size="small"
        class="ma-2"
      >
        No Disponible
      </v-chip>

      <!-- Badge de cupos -->
      <v-chip
        v-if="isFull"
        color="warning"
        size="small"
        class="ma-2"
      >
        Lleno
      </v-chip>
    </v-img>

    <v-card-title class="text-h6 py-3">
      {{ classData.name }}
    </v-card-title>

    <v-card-text class="pb-2">
      <!-- Descripción -->
      <p
        v-if="classData.description"
        class="text-body-2 text-grey-darken-1 mb-3"
      >
        {{ classData.description }}
      </p>

      <!-- Información de la clase -->
      <div class="class-info">
        <div class="info-item">
          <v-icon
            icon="mdi-clock-outline"
            size="small"
            color="primary"
          ></v-icon>
          <span class="text-body-2">{{ classData.duration }} min</span>
        </div>

        <div class="info-item">
          <v-icon
            icon="mdi-account-group"
            size="small"
            color="primary"
          ></v-icon>
          <span class="text-body-2">
            {{ currentReservations }}/{{ classData.maxCapacity }}
          </span>
        </div>

        <div class="info-item">
          <v-icon
            icon="mdi-currency-usd"
            size="small"
            color="primary"
          ></v-icon>
          <span class="text-body-2">${{ classData.price }}</span>
        </div>
      </div>

      <!-- Instructor -->
      <div class="instructor-info mt-3">
        <v-avatar size="24" class="mr-2">
          <v-icon icon="mdi-account"></v-icon>
        </v-avatar>
        <span class="text-body-2 text-grey-darken-1">
          {{ classData.instructor.name }}
        </span>
      </div>
    </v-card-text>

    <v-card-actions class="pt-0">
      <!-- Botón de reservar -->
      <v-btn
        v-if="canReserve"
        color="primary"
        variant="elevated"
        block
        :loading="isReserving"
        @click.stop="handleReserve"
      >
        <v-icon left>mdi-calendar-plus</v-icon>
        Reservar
      </v-btn>

      <!-- Botón de ver detalles -->
      <v-btn
        v-else
        color="secondary"
        variant="outlined"
        block
        @click.stop="handleViewDetails"
      >
        <v-icon left>mdi-eye</v-icon>
        Ver Detalles
      </v-btn>

      <!-- Botón de editar (solo para instructores y admins) -->
      <v-btn
        v-if="canEdit"
        icon
        variant="text"
        color="primary"
        @click.stop="handleEdit"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
    </v-card-actions>

    <!-- Diálogo de confirmación de reserva -->
    <v-dialog
      v-model="showReservationDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>
          Confirmar Reserva
        </v-card-title>
        <v-card-text>
          ¿Estás seguro de que quieres reservar la clase "{{ classData.name }}"?
          <br><br>
          <strong>Instructor:</strong> {{ classData.instructor.name }}<br>
          <strong>Duración:</strong> {{ classData.duration }} minutos<br>
          <strong>Precio:</strong> ${{ classData.price }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showReservationDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            :loading="isReserving"
            @click="confirmReservation"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'

// Props
interface Props {
  classData: {
    id: string
    name: string
    description?: string
    duration: number
    maxCapacity: number
    price: number
    isActive: boolean
    instructor: {
      id: string
      name: string
      email: string
    }
    _count?: {
      reservations: number
    }
  }
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'reserve': [classId: string]
  'edit': [classId: string]
}>()

// Router y store
const router = useRouter()
const authStore = useAuth()

// Estado
const isReserving = ref(false)
const showReservationDialog = ref(false)

// Computed
const currentReservations = computed(() => {
  return props.classData._count?.reservations || 0
})

const isFull = computed(() => {
  return currentReservations.value >= props.classData.maxCapacity
})

const canReserve = computed(() => {
  return (
    props.classData.isActive &&
    !isFull.value &&
    authStore.isAuthenticated &&
    authStore.isClient
  )
})

const canEdit = computed(() => {
  return (
    authStore.isAuthenticated &&
    (authStore.isAdmin || 
     (authStore.isInstructor && authStore.user?.id === props.classData.instructor.id))
  )
})

const classImage = computed(() => {
  // Aquí podrías usar una imagen real de la clase
  // Por ahora usamos un placeholder
  return `https://picsum.photos/400/200?random=${props.classData.id}`
})

// Métodos
const handleCardClick = () => {
  router.push({ name: 'class-details', params: { id: props.classData.id } })
}

const handleReserve = () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login' })
    return
  }
  
  showReservationDialog.value = true
}

const handleViewDetails = () => {
  router.push({ name: 'class-details', params: { id: props.classData.id } })
}

const handleEdit = () => {
  emit('edit', props.classData.id)
}

const confirmReservation = async () => {
  try {
    isReserving.value = true
    emit('reserve', props.classData.id)
    showReservationDialog.value = false
  } catch (error) {
    console.error('Error al reservar:', error)
  } finally {
    isReserving.value = false
  }
}
</script>

<style scoped>
.class-card {
  border-radius: 12px;
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
}

.class-card:hover {
  transform: translateY(-4px);
}

.class-image {
  border-radius: 12px 12px 0 0;
}

.class-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.instructor-info {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid #e0e0e0;
}

.v-card-actions {
  padding: 16px;
}

.v-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
}
</style> 