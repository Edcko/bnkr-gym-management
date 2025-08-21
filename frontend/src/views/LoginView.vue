<template>
  <div class="login-view">
    <!-- Header BNKR -->
    <header class="bnkr-header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo">
            <span class="logo-text">BNKR</span>
            <div class="logo-arrows">
              <span class="arrow">→</span>
              <span class="arrow">←</span>
            </div>
          </div>
          <p class="tagline">Transforma tu vida, transforma tu cuerpo</p>
        </div>
        
        <nav class="header-nav">
          <a href="#" class="nav-link">ENTRENAMIENTO</a>
          <a href="#" class="nav-link">MOVIMIENTO</a>
          <a href="#" class="nav-link">ROPA</a>
          <a href="#" class="nav-link cart">
            <v-icon size="20" color="#ff4444">mdi-cart</v-icon>
          </a>
        </nav>
        
        <div class="header-actions">
          <div class="social-links">
            <a href="#" class="social-link">
              <v-icon size="18" color="#666">mdi-instagram</v-icon>
            </a>
            <a href="#" class="social-link">
              <v-icon size="18" color="#666">mdi-facebook</v-icon>
            </a>
            <a href="#" class="social-link">
              <v-icon size="18" color="#666">mdi-youtube</v-icon>
            </a>
          </div>
          
          <div class="language-selector">
            <span class="language">ES</span>
          </div>
          
          <!-- Toggle del tema -->
          <ThemeToggle />
          
          <div class="auth-buttons">
            <button class="btn btn-secondary">INICIAR SESIÓN</button>
            <button class="btn btn-primary">ÚNETE AL MOVIMIENTO</button>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="login-main">
      <!-- Mensaje de bienvenida -->
      <div class="welcome-section">
        <h1 class="welcome-title">
          <span class="title-line">Bienvenido al</span>
          <span class="title-highlight">Futuro del Fitness</span>
        </h1>
        <p class="welcome-description">
          Únete a la comunidad BNKR y descubre tu verdadero potencial. 
          Nuestro sistema de gestión te ofrece control total sobre tu gimnasio.
        </p>
        
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="24" color="#ff4444">mdi-account-group</v-icon>
            </div>
            <span class="feature-text">Gestión de Usuarios</span>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="24" color="#ff4444">mdi-calendar-check</v-icon>
            </div>
            <span class="feature-text">Reservas Inteligentes</span>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="24" color="#ff4444">mdi-chart-line</v-icon>
            </div>
            <span class="feature-text">Reportes Avanzados</span>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="24" color="#ff4444">mdi-cog</v-icon>
            </div>
            <span class="feature-text">Control Total</span>
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

    <!-- Footer -->
    <footer class="bnkr-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">BNKR Gym</h3>
          <p class="footer-description">
            Transformando vidas a través del fitness y la tecnología.
          </p>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-subtitle">Enlaces Rápidos</h4>
          <a href="#" class="footer-link">Sobre Nosotros</a>
          <a href="#" class="footer-link">Servicios</a>
          <a href="#" class="footer-link">Contacto</a>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-subtitle">Soporte</h4>
          <a href="#" class="footer-link">Ayuda</a>
          <a href="#" class="footer-link">Documentación</a>
          <a href="#" class="footer-link">Estado del Sistema</a>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-subtitle">Legal</h4>
          <a href="#" class="footer-link">Términos de Servicio</a>
          <a href="#" class="footer-link">Política de Privacidad</a>
          <a href="#" class="footer-link">Cookies</a>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="copyright">© 2024 BNKR Gym. Todos los derechos reservados.</p>
      </div>
    </footer>

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
import ThemeToggle from '@/components/ThemeToggle.vue'

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

/* Header */
.bnkr-header {
  background: var(--bg-overlay);
  backdrop-filter: var(--blur);
  border-bottom: 1px solid var(--border-primary);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 15px 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.logo-text {
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--text-primary);
  text-shadow: 0 0 20px rgba(255, 68, 68, 0.8);
  letter-spacing: 2px;
}

.logo-arrows {
  display: flex;
  gap: 3px;
}

.arrow {
  color: var(--bnkr-primary);
  font-size: 1rem;
  font-weight: bold;
  animation: arrowPulse 2s ease-in-out infinite;
}

.arrow:nth-child(2) {
  animation-delay: 1s;
}

@keyframes arrowPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

.tagline {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
  font-style: italic;
}

.header-nav {
  display: flex;
  gap: 30px;
  align-items: center;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: var(--bnkr-primary);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--bnkr-primary);
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link.cart {
  display: flex;
  align-items: center;
  gap: 5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.social-links {
  display: flex;
  gap: 15px;
}

.social-link {
  color: var(--text-muted);
  transition: color 0.3s ease;
}

.social-link:hover {
  color: var(--bnkr-primary);
}

.language-selector {
  padding: 5px 10px;
  border: 1px solid var(--border-muted);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.05);
}

.language {
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-muted);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-primary {
  background: var(--bnkr-primary);
  color: var(--text-primary);
}

.btn-primary:hover {
  background: var(--bnkr-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 68, 68, 0.3);
}

/* Main content */
.login-main {
  padding-top: 120px;
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

/* Footer */
.bnkr-footer {
  background: var(--bg-overlay);
  border-top: 1px solid var(--border-primary);
  padding: 40px 0 20px;
  margin-top: 60px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
}

.footer-section h3,
.footer-section h4 {
  color: var(--bnkr-primary);
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.footer-section h3 {
  font-size: 1.3rem;
}

.footer-description {
  color: var(--text-tertiary);
  line-height: 1.6;
  margin-bottom: 20px;
}

.footer-link {
  display: block;
  color: var(--text-secondary);
  text-decoration: none;
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--bnkr-primary);
}

.footer-bottom {
  border-top: 1px solid var(--border-muted);
  margin-top: 30px;
  padding-top: 20px;
  text-align: center;
}

.copyright {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
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
  .header-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .header-nav {
    order: 3;
    gap: 20px;
  }
  
  .header-actions {
    order: 2;
  }
  
  .welcome-title {
    font-size: 2.5rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }
  
  .login-main {
    padding-top: 180px;
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