<template>
  <v-card
    class="mx-auto"
    max-width="400"
    elevation="8"
  >
    <v-card-title class="text-center text-h5 py-4">
      <v-icon
        icon="mdi-dumbbell"
        size="32"
        class="mr-3"
        color="primary"
      ></v-icon>
      Iniciar Sesión en BNKR
    </v-card-title>

    <v-card-text>
      <v-form @submit.prevent="handleSubmit">
        <v-text-field
          v-model="form.email"
          :error-messages="errors.email"
          label="Email"
          type="email"
          prepend-icon="mdi-email"
          variant="outlined"
          required
          @blur="validateField('email')"
          @input="clearError('email')"
        ></v-text-field>

        <v-text-field
          v-model="form.password"
          :error-messages="errors.password"
          label="Contraseña"
          type="password"
          prepend-icon="mdi-lock"
          variant="outlined"
          required
          @blur="validateField('password')"
          @input="clearError('password')"
        ></v-text-field>

        <div class="d-flex justify-space-between align-center mb-4">
          <v-checkbox
            v-model="form.rememberMe"
            label="Recordarme"
            hide-details
          ></v-checkbox>

          <v-btn
            variant="text"
            color="primary"
            @click="$emit('forgot-password')"
          >
            ¿Olvidaste tu contraseña?
          </v-btn>
        </div>

        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          :loading="isLoading"
          :disabled="!isFormValid"
        >
          <v-icon left>mdi-login</v-icon>
          Iniciar Sesión
        </v-btn>
      </v-form>
    </v-card-text>

    <v-card-actions class="justify-center pb-4">
      <span class="text-body-2">¿No tienes cuenta?</span>
      <v-btn
        variant="text"
        color="primary"
        @click="$emit('go-to-register')"
      >
        Registrarse
      </v-btn>
    </v-card-actions>

    <!-- Snackbar para errores -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
    >
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="showError = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import { useAuthStore } from '@/stores/auth'

// Props y emits
interface Props {
  redirectTo?: string
}

const props = withDefaults(defineProps<Props>(), {
  redirectTo: '/'
})

const emit = defineEmits<{
  'login-success': [user: any]
  'forgot-password': []
  'go-to-register': []
}>()

// Store
const authStore = useAuthStore()

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

// Estado de UI
const isLoading = ref(false)
const showError = ref(false)
const errorMessage = ref('')

// Computed
const isFormValid = computed(() => {
  return form.value.email && form.value.password && !errors.value.email && !errors.value.password
})

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
    showError.value = false

    const user = await authStore.login({
      email: values.email,
      password: values.password
    })

    // Emitir evento de éxito
    emit('login-success', user)

    // Limpiar formulario
    resetForm()
    form.value = {
      email: '',
      password: '',
      rememberMe: false
    }

  } catch (error: any) {
    errorMessage.value = error.message || 'Error al iniciar sesión'
    showError.value = true
  } finally {
    isLoading.value = false
  }
}

// Manejar envío del formulario
const handleFormSubmitWrapper = handleSubmit(handleFormSubmit)
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}

.v-card-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.v-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
}

.v-text-field {
  margin-bottom: 16px;
}
</style> 