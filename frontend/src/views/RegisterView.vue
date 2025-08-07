<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h1 class="register-title">{{ t('register', language.currentLanguage) }}</h1>
        <p class="register-subtitle">{{ t('joinMovement', language.currentLanguage) }}</p>
      </div>

      <v-form @submit.prevent="handleRegister" class="register-form">
        <v-text-field
          v-model="form.name"
          :label="t('name', language.currentLanguage)"
          variant="outlined"
          :rules="[rules.required]"
          class="form-field"
          color="#ff6b35"
        ></v-text-field>

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
          :rules="[rules.required, rules.password]"
          class="form-field"
          color="#ff6b35"
        ></v-text-field>

        <v-text-field
          v-model="form.confirmPassword"
          :label="t('confirmPassword', language.currentLanguage)"
          type="password"
          variant="outlined"
          :rules="[rules.required, rules.confirmPassword]"
          class="form-field"
          color="#ff6b35"
        ></v-text-field>

        <v-btn
          type="submit"
          color="#ff6b35"
          size="x-large"
          block
          class="register-btn"
          :loading="auth.loading"
        >
          {{ t('register', language.currentLanguage) }}
        </v-btn>
      </v-form>

      <div class="register-footer">
        <p class="login-link">
          {{ t('alreadyHaveAccount', language.currentLanguage) }}
          <router-link to="/login" class="link">{{ t('login', language.currentLanguage) }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
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
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Validation rules
const rules = {
  required: (value: string) => !!value || t('thisFieldRequired', language.currentLanguage),
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || t('invalidEmail', language.currentLanguage)
  },
  password: (value: string) => {
    if (value.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres'
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    }
    return true
  },
  confirmPassword: (value: string) => {
    return value === form.password || 'Las contraseñas no coinciden'
  }
}

const handleRegister = async () => {
  if (form.password !== form.confirmPassword) {
    toast.show('Las contraseñas no coinciden', 'error')
    return
  }

  const result = await auth.register({
    name: form.name,
    email: form.email,
    password: form.password
  })

  if (result.success) {
    toast.show('¡Registro exitoso!', 'success')
    router.push('/dashboard')
  } else {
    toast.show(result.error || 'Error al registrarse', 'error')
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 10px;
  letter-spacing: -0.02em;
}

.register-subtitle {
  font-size: 1.1rem;
  color: #666;
  font-weight: 300;
}

.register-form {
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

.register-btn {
  margin-top: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  height: 56px;
  border-radius: 8px;
}

.register-footer {
  text-align: center;
}

.login-link {
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
  .register-container {
    padding: 30px 20px;
  }
  
  .register-title {
    font-size: 2rem;
  }
  
  .register-subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .register-page {
    padding: 10px;
  }
  
  .register-container {
    padding: 25px 15px;
  }
  
  .register-title {
    font-size: 1.8rem;
  }
}
</style> 