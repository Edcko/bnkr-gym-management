<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="login-title">{{ t('login', language.currentLanguage) }}</h1>
        <p class="login-subtitle">{{ t('joinMovement', language.currentLanguage) }}</p>
      </div>

      <v-form @submit.prevent="handleLogin" class="login-form">
        <v-text-field
          v-model="form.email"
          :label="t('email', language.currentLanguage)"
          type="email"
          variant="outlined"
          :rules="[rules.required, rules.email]"
          class="form-field"
          color="#ff6b35"
        ></v-text-field>

        <v-text-field
          v-model="form.password"
          :label="t('password', language.currentLanguage)"
          type="password"
          variant="outlined"
          :rules="[rules.required]"
          class="form-field"
          color="#ff6b35"
        ></v-text-field>

        <div class="form-actions">
          <v-btn
            variant="text"
            color="#ff6b35"
            class="forgot-password"
          >
            {{ t('forgotPassword', language.currentLanguage) }}
          </v-btn>
        </div>

        <v-btn
          type="submit"
          color="#ff6b35"
          size="x-large"
          block
          class="login-btn"
          :loading="auth.loading"
        >
          {{ t('login', language.currentLanguage) }}
        </v-btn>
      </v-form>

      <div class="login-footer">
        <p class="register-link">
          {{ t('dontHaveAccount', language.currentLanguage) }}
          <router-link to="/register" class="link">{{ t('register', language.currentLanguage) }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import { useLanguage } from '@/stores/language'
import { useToast } from '@/stores/toast'
import { t } from '@/utils/translations'

const router = useRouter()
const auth = useAuth()
const language = useLanguage()
const toast = useToast()

const form = reactive({
  email: '',
  password: ''
})

// Validation rules
const rules = {
  required: (value: string) => !!value || t('thisFieldRequired', language.currentLanguage),
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || t('invalidEmail', language.currentLanguage)
  }
}

const handleLogin = async () => {
  const result = await auth.login({
    email: form.email,
    password: form.password
  })

  if (result.success) {
    toast.show('¡Inicio de sesión exitoso!', 'success')
    router.push('/dashboard')
  } else {
    toast.show(result.error || 'Error al iniciar sesión', 'error')
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 10px;
  letter-spacing: -0.02em;
}

.login-subtitle {
  font-size: 1.1rem;
  color: #666;
  font-weight: 300;
}

.login-form {
  margin-bottom: 30px;
}

.form-field {
  margin-bottom: 20px;
}

.form-field :deep(.v-field__outline) {
  border-color: #e0e0e0 !important;
}

.form-field :deep(.v-field--focused .v-field__outline) {
  border-color: #ff6b35 !important;
}

.form-field :deep(.v-label) {
  color: #666 !important;
}

.form-field :deep(.v-field--focused .v-label) {
  color: #ff6b35 !important;
}

.form-field :deep(.v-field__input) {
  color: #333 !important;
}

.form-field :deep(.v-field__input input) {
  color: #333 !important;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.forgot-password {
  font-size: 0.9rem;
  text-transform: none;
  font-weight: 400;
}

.login-btn {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  height: 56px;
  border-radius: 8px;
}

.login-footer {
  text-align: center;
}

.register-link {
  color: #666;
  font-size: 0.95rem;
}

.link {
  color: #ff6b35;
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
}

.link:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .login-container {
    padding: 30px 20px;
  }
  
  .login-title {
    font-size: 2rem;
  }
  
  .login-subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 10px;
  }
  
  .login-container {
    padding: 25px 15px;
  }
  
  .login-title {
    font-size: 1.8rem;
  }
}
</style> 