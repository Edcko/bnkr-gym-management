<template>
  <div class="login-form-container">
    <!-- Fondo animado con partículas -->
    <div class="animated-background">
      <div class="particles">
        <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
      </div>
      <div class="gradient-overlay"></div>
    </div>

    <!-- Logo BNKR flotante -->
    <div class="floating-logo">
      <div class="logo-container">
        <span class="logo-text">BNKR</span>
        <div class="logo-arrows">
          <span class="arrow left">→</span>
          <span class="arrow right">←</span>
        </div>
      </div>
    </div>

    <!-- Formulario principal -->
    <div class="login-card" :class="{ 'card-visible': cardVisible }">
      <!-- Header del formulario -->
      <div class="form-header">
        <div class="header-icon">
          <div class="icon-circle">
            <v-icon size="32" color="white">mdi-dumbbell</v-icon>
          </div>
        </div>
        <h1 class="form-title">Bienvenido a BNKR</h1>
        <p class="form-subtitle">Tu gimnasio, tu transformación</p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleFormSubmitWrapper" class="form-content">
        <!-- Campo Email -->
        <div class="input-group" :class="{ 'focused': focusedField === 'email', 'error': errors.email }">
          <div class="input-icon">
            <v-icon :color="focusedField === 'email' ? '#ff4444' : errors.email ? '#f44336' : '#666'">mdi-email</v-icon>
          </div>
          <input
          v-model="form.email"
          type="email"
            placeholder="Correo electrónico"
            @focus="focusedField = 'email'; clearError('email')"
            @blur="focusedField = null; validateField('email')"
            @input="clearError('email')"
          required
            class="form-input"
            :class="{ 'error': errors.email }"
          />
          <div class="input-line" :class="{ 'error': errors.email }"></div>
          <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
        </div>

        <!-- Campo Contraseña -->
        <div class="input-group" :class="{ 'focused': focusedField === 'password', 'error': errors.password }">
          <div class="input-icon">
            <v-icon :color="focusedField === 'password' ? '#ff4444' : errors.password ? '#f44336' : '#666'">mdi-lock</v-icon>
          </div>
          <input
          v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Contraseña"
            @focus="focusedField = 'password'; clearError('password')"
            @blur="focusedField = null; validateField('password')"
            @input="clearError('password')"
          required
            class="form-input"
            :class="{ 'error': errors.password }"
          />
          <div class="input-line" :class="{ 'error': errors.password }"></div>
          <button 
            type="button" 
            @click="showPassword = !showPassword"
            class="password-toggle"
          >
            <v-icon :color="showPassword ? '#ff4444' : '#666'">
              {{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}
            </v-icon>
          </button>
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        </div>

        <!-- Opciones adicionales -->
        <div class="form-options">
          <label class="checkbox-container">
            <input type="checkbox" v-model="form.rememberMe" />
            <span class="checkmark"></span>
            <span class="checkbox-text">Recordarme</span>
          </label>
          <button type="button" class="forgot-password" @click="$emit('forgot-password')">
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <!-- Botón de envío -->
        <button 
          type="submit"
          class="submit-btn"
          :class="{ 'loading': isLoading }"
          :disabled="!isFormValid || isLoading"
        >
          <span v-if="!isLoading" class="btn-text">
            <span class="btn-icon">→</span>
          Iniciar Sesión
          </span>
          <div v-else class="loading-spinner">
            <div class="spinner"></div>
          </div>
        </button>

        <!-- Separador -->
        <div class="divider">
          <span class="divider-text">o</span>
        </div>

        <!-- Botón de registro -->
        <button 
          type="button" 
          class="register-btn"
        @click="$emit('go-to-register')"
        >
          Crear cuenta en BNKR
        </button>
      </form>

      <!-- Footer del formulario -->
      <div class="form-footer">
        <p class="footer-text">
          Al continuar, aceptas nuestros 
          <a href="#" class="footer-link">Términos de Servicio</a> y 
          <a href="#" class="footer-link">Política de Privacidad</a>
        </p>
      </div>
    </div>

    <!-- Elementos decorativos -->
    <div class="decorative-elements">
      <div class="floating-dumbbell" :style="getFloatingStyle(1)">
        <v-icon size="24" color="#ff4444">mdi-dumbbell</v-icon>
      </div>
      <div class="floating-heart" :style="getFloatingStyle(2)">
        <v-icon size="20" color="#ff4444">mdi-heart</v-icon>
      </div>
      <div class="floating-star" :style="getFloatingStyle(3)">
        <v-icon size="18" color="#ff4444">mdi-star</v-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import { useAuth } from '@/stores/auth'

// Props y emits
interface Props {
  redirectTo?: string
}

const props = withDefaults(defineProps<Props>(), {
  redirectTo: '/'
})

const emit = defineEmits<{
  'login-success': [user: any]
  'login-error': [error: string]
  'forgot-password': []
  'go-to-register': []
}>()

// Store
const authStore = useAuth()

// Schema de validación
const schema = yup.object({
  email: yup
    .string()
    .email('Email debe ser válido')
    .required('Email es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('Contraseña es requerida')
})

// Formulario con validación
const { handleSubmit, errors, resetForm } = useForm({
  validationSchema: schema
})

const { value: email } = useField('email')
const { value: password } = useField('password')

// Estado del formulario
const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

// Estado de la UI
const isLoading = ref(false)
const showPassword = ref(false)
const focusedField = ref<string | null>(null)
const cardVisible = ref(false)

// Computed
const isFormValid = computed(() => {
  return form.value.email && form.value.password && !errors.value.email && !errors.value.password
})

// Animaciones
let animationFrame: number

// Watchers
watch(() => form.value.email, (newValue) => {
  email.value = newValue
})

watch(() => form.value.password, (newValue) => {
  password.value = newValue
})

// Métodos
const validateField = (field: string) => {
  // La validación se ejecuta automáticamente con vee-validate
}

const clearError = (field: string) => {
  if (errors.value[field]) {
    errors.value[field] = ''
  }
}

const handleFormSubmit = async (values: any) => {
  try {
    isLoading.value = true

    console.log('🔐 Attempting login with:', { email: values.email, password: '***' })

    const result = await authStore.login({
      email: values.email,
      password: values.password
    })

    console.log('🔍 Login result:', result)
    console.log('🔍 Auth store user:', authStore.user)
    
    if (result.success) {
      // Emitir evento de éxito con la estructura completa
      const loginData = {
        success: true,
        user: authStore.user || (result as any).user || result,
        message: (result as any).message || 'Login exitoso'
      }
      
      console.log('✅ Emitting login success with:', loginData)
      emit('login-success', loginData)

    // Limpiar formulario
    resetForm()
    form.value = {
      email: '',
      password: '',
      rememberMe: false
    }

      // Animación de éxito
      await animateSuccess()
    } else {
      // Emitir error específico
      console.error('❌ Login failed:', result.error)
      emit('login-error', result.error || 'Error al iniciar sesión')
    }
  } catch (error: any) {
    // Emitir error de excepción
    console.error('💥 Login exception:', error)
    emit('login-error', error.message || 'Error inesperado. Intenta de nuevo.')
  } finally {
    isLoading.value = false
  }
}

// Manejar envío del formulario
const handleFormSubmitWrapper = handleSubmit(handleFormSubmit)

const animateSuccess = async () => {
  // Animación de éxito con confeti virtual
  const card = document.querySelector('.login-card')
  if (card) {
    card.classList.add('success-animation')
    await new Promise(resolve => setTimeout(resolve, 1000))
    card.classList.remove('success-animation')
  }
}

const showError = (message: string) => {
  // Emitir evento de error para que la vista principal lo maneje
  emit('login-error', message)
}

const getParticleStyle = (index: number) => {
  const delay = Math.random() * 20
  const duration = 15 + Math.random() * 10
  const size = 2 + Math.random() * 3
  
  return {
    '--delay': `${delay}s`,
    '--duration': `${duration}s`,
    '--size': `${size}px`,
    '--start-x': `${Math.random() * 100}%`,
    '--start-y': `${Math.random() * 100}%`
  } as any
}

const getFloatingStyle = (index: number) => {
  const delay = index * 2
  const duration = 6 + index
  
  return {
    '--float-delay': `${delay}s`,
    '--float-duration': `${duration}s`
  } as any
}

const startAnimations = () => {
  const animate = () => {
    // Animaciones continuas aquí si las necesitamos
    animationFrame = requestAnimationFrame(animate)
  }
  animate()
}

// Lifecycle
onMounted(() => {
  // Mostrar tarjeta con animación
  setTimeout(() => {
    cardVisible.value = true
  }, 300)
  
  startAnimations()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.login-form-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%);
}

/* Fondo animado */
.animated-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: #ff4444;
  border-radius: 50%;
  opacity: 0.6;
  animation: float var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
  left: var(--start-x);
  top: var(--start-y);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%, rgba(255, 68, 68, 0.1) 0%, transparent 70%);
}

/* Logo flotante */
.floating-logo {
  position: absolute;
  top: 50px;
  left: 50px;
  z-index: 10;
  animation: logoFloat 6s ease-in-out infinite;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-text {
  font-size: 2.5rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 0 20px rgba(255, 68, 68, 0.8);
  letter-spacing: 3px;
}

.logo-arrows {
  display: flex;
  gap: 5px;
}

.arrow {
  color: #ff4444;
  font-size: 1.5rem;
  font-weight: bold;
  animation: arrowPulse 2s ease-in-out infinite;
}

.arrow.left {
  animation-delay: 0s;
}

.arrow.right {
  animation-delay: 1s;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes arrowPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

/* Tarjeta de login */
.login-card {
  position: relative;
  z-index: 5;
  width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transform: translateY(50px) scale(0.9);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-visible {
  transform: translateY(0) scale(1);
  opacity: 1;
}

/* Header del formulario */
.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.header-icon {
  margin-bottom: 20px;
}

.icon-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 10px 30px rgba(255, 68, 68, 0.3);
  animation: iconPulse 3s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #1a1a1a 0%, #ff4444 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

/* Contenido del formulario */
.form-content {
  margin-bottom: 30px;
}

.input-group {
  position: relative;
  margin-bottom: 25px;
  transition: all 0.3s ease;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  transition: all 0.3s ease;
}

.form-input {
  width: 100%;
  padding: 18px 20px 18px 50px;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  font-size: 1rem;
  color: #1a1a1a;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 3px rgba(255, 68, 68, 0.2);
}

.form-input.error {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
}

.input-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #ff4444, #cc0000);
  transition: width 0.3s ease;
}

.input-line.error {
  background: #f44336;
}

.input-group.focused .input-line {
  width: 100%;
}

.error-message {
  color: #f44336;
  font-size: 0.8rem;
  margin-top: 5px;
  margin-left: 15px;
  font-weight: 500;
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.password-toggle:hover {
  background: rgba(255, 68, 68, 0.1);
}

/* Opciones del formulario */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-container input:checked + .checkmark {
  background: #ff4444;
  border-color: #ff4444;
}

.checkbox-container input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.checkbox-text {
  color: #666;
  font-size: 0.9rem;
}

.forgot-password {
  background: none;
  border: none;
  color: #ff4444;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #cc0000;
}

/* Botón de envío */
.submit-btn {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 68, 68, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.submit-btn.loading {
  cursor: not-allowed;
}

.btn-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.submit-btn:hover:not(:disabled) .btn-icon {
  transform: translateX(5px);
}

/* Spinner de carga */
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Separador */
.divider {
  text-align: center;
  margin: 25px 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #ddd;
}

.divider-text {
  background: white;
  padding: 0 15px;
  color: #666;
  font-size: 0.9rem;
}

/* Botón de registro */
.register-btn {
  width: 100%;
  padding: 16px;
  background: transparent;
  border: 2px solid #ff4444;
  border-radius: 12px;
  color: #ff4444;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.register-btn:hover {
  background: #ff4444;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 68, 68, 0.3);
}

/* Footer */
.form-footer {
  text-align: center;
}

.footer-text {
  color: #666;
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.5;
}

.footer-link {
  color: #ff4444;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #cc0000;
}

/* Elementos decorativos flotantes */
.decorative-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.floating-dumbbell,
.floating-heart,
.floating-star {
  position: absolute;
  opacity: 0.3;
  animation: floatElement var(--float-duration) ease-in-out infinite;
  animation-delay: var(--float-delay);
}

.floating-dumbbell {
  top: 20%;
  right: 15%;
}

.floating-heart {
  top: 70%;
  left: 10%;
}

.floating-star {
  top: 40%;
  right: 25%;
}

@keyframes floatElement {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(180deg); }
}

/* Animación de éxito */
.success-animation {
  animation: successPulse 1s ease-in-out;
}

@keyframes successPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Responsive */
@media (max-width: 480px) {
  .login-card {
    width: 90%;
    padding: 30px 20px;
  }
  
  .floating-logo {
    top: 30px;
    left: 30px;
  }
  
  .logo-text {
    font-size: 2rem;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .floating-logo {
    display: none;
  }
  
  .decorative-elements {
    display: none;
  }
}
</style> 