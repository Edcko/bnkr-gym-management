<template>
  <div class="login-view">


    <!-- Contenido principal -->
    <main class="login-main">
      <!-- Mensaje de bienvenida -->
      <div class="welcome-section">
        <h1 class="welcome-title">
          <span class="title-line">Entrena seguro.</span>
          <span class="title-highlight">Supera tus límites</span>
        </h1>
        <p class="welcome-description">
          En BNKR transformamos vidas a través del Cardio Box, ofreciendo entrenamientos personalizados en grupos reducidos que fusionan técnica, motivación y comunidad. Creamos un espacio seguro, dinámico y motivador, donde tanto adultos como niños encuentran la oportunidad de superar sus límites, fortalecer su confianza y disfrutar de una experiencia que impulsa su bienestar físico y emocional cada día.
        </p>
        
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="24" color="#ff4444">mdi-heart-pulse</v-icon>
            </div>
            <span class="feature-text">Cardio Box</span>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="24" color="#ff4444">mdi-account-group</v-icon>
            </div>
            <span class="feature-text">Grupos Reducidos</span>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="24" color="#ff4444">mdi-shield-check</v-icon>
            </div>
            <span class="feature-text">Entrenamiento Seguro</span>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="24" color="#ff4444">mdi-star</v-icon>
            </div>
            <span class="feature-text">Motivación Constante</span>
          </div>
        </div>
      </div>

      <!-- Formulario de login -->
      <div class="form-section">
        <LoginForm 
          @login-success="handleLoginSuccess"
          @go-to-register="goToRegister"
          @forgot-password="handleForgotPassword"
          @login-error="handleLoginError"
        />
      </div>
    </main>

    <!-- Toast para notificaciones -->
    <div v-if="showToast" class="toast" :class="toastType">
      <div class="toast-content">
        <v-icon :icon="toastIcon" size="20"></v-icon>
        <span class="toast-message">{{ toastMessage }}</span>
      </div>
      <button @click="showToast = false" class="toast-close">
        <v-icon size="16">mdi-close</v-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import LoginForm from '@/components/LoginForm.vue'

// Router y store
const router = useRouter()
const authStore = useAuth()

// Estado del toast
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const toastIcon = ref('mdi-check-circle')

// Métodos
const handleLoginSuccess = (data: any) => {
  // DEBUG: Ver la estructura completa de la respuesta
  console.log('🔍 Login success data:', data)
  console.log('🔍 Data structure:', JSON.stringify(data, null, 2))
  
  showToastMessage('¡Inicio de sesión exitoso!', 'success', 'mdi-check-circle')
  
  // Redirigir según el rol - con manejo seguro de la estructura
  setTimeout(() => {
    let userRole = null
    
    // Intentar diferentes estructuras posibles
    if (data?.user?.role) {
      userRole = data.user.role
    } else if (data?.role) {
      userRole = data.role
    } else if (authStore.user?.role) {
      userRole = authStore.user.role
    } else {
      console.warn('⚠️ No se pudo determinar el rol del usuario, redirigiendo a dashboard')
      router.push('/dashboard')
      return
    }
    
    console.log('🎯 User role detected:', userRole)
    
    // Redirección según rol
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      console.log('🚀 Redirecting to admin dashboard')
      router.push('/admin')
    } else if (userRole === 'INSTRUCTOR') {
      console.log('🚀 Redirecting to instructor dashboard')
      router.push('/instructor')
    } else {
      console.log('🚀 Redirecting to general dashboard')
      router.push('/dashboard')
    }
  }, 1500)
}

const goToRegister = () => {
  showToastMessage('Funcionalidad de registro próximamente disponible', 'info', 'mdi-information')
}

const handleForgotPassword = () => {
  showToastMessage('Funcionalidad de recuperación próximamente disponible', 'info', 'mdi-information')
}

// Agregar método para manejar errores del formulario
const handleLoginError = (error: string) => {
  showToastMessage(error, 'error', 'mdi-alert-circle')
}

const showToastMessage = (message: string, type: string, icon: string) => {
  toastMessage.value = message
  toastType.value = type
  toastIcon.value = icon
  showToast.value = true
  
  // Auto-hide después de 5 segundos
  setTimeout(() => {
    showToast.value = false
  }, 5000)
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  background: var(--gradient-bg);
  color: var(--text-primary);
  position: relative;
  overflow-x: hidden;
}



/* Main content */
.login-main {
  padding-top: 100px; /* Espacio para el navbar principal */
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
  max-width: 1400px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
}

/* Welcome section */
.welcome-section {
  flex: 1;
  max-width: 500px;
}

.welcome-title {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 20px;
}

.title-line {
  display: block;
  color: var(--text-secondary);
}

.title-highlight {
  display: block;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-description {
  font-size: 1.1rem;
  color: var(--text-tertiary);
  line-height: 1.6;
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 68, 68, 0.1);
  border-color: var(--border-primary);
  transform: translateY(-2px);
}

.feature-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 68, 68, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

/* Form section */
.form-section {
  flex: 1;
  display: flex;
  justify-content: center;
}



/* Toast */
.toast {
  position: fixed;
  top: 100px;
  right: 20px;
  background: white;
  color: #333;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 10000;
  animation: slideInRight 0.3s ease;
  max-width: 400px;
}

.toast.success {
  border-left: 4px solid #4caf50;
}

.toast.error {
  border-left: 4px solid #f44336;
}

.toast.info {
  border-left: 4px solid #2196f3;
}

.toast.warning {
  border-left: 4px solid #ff9800;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.toast-message {
  font-size: 0.9rem;
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.toast-close:hover {
  background: #f5f5f5;
  color: #333;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .login-main {
    flex-direction: column;
    gap: 60px;
    text-align: center;
    padding-top: 20px; /* Ajustado */
  }
  
  .welcome-section {
    max-width: 100%;
  }
  
  .welcome-title {
    font-size: 3rem;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 500px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 2.5rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .login-main {
    padding-top: 120px;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 2rem;
  }
  
  .welcome-description {
    font-size: 1rem;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
</style> 