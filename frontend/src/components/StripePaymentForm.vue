<template>
  <div class="stripe-payment-form">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-credit-card</v-icon>
        Pago con Tarjeta
      </v-card-title>
      
      <v-card-text>
        <div class="payment-summary mb-4">
          <div class="d-flex justify-space-between align-center">
            <span class="text-h6">{{ description }}</span>
            <span class="text-h5 font-weight-bold">{{ formatCurrency(amount) }}</span>
          </div>
        </div>

        <div v-if="loading" class="text-center py-4">
          <v-progress-circular indeterminate color="primary" size="32" />
          <p class="mt-2">Procesando pago...</p>
        </div>

        <div v-else-if="error" class="error-message mb-4">
          <v-alert type="error" variant="tonal">
            {{ error }}
          </v-alert>
        </div>

        <div v-else>
          <!-- Stripe Elements Container -->
          <div id="card-element" class="stripe-card-element mb-4"></div>
          
          <!-- Card Errors -->
          <div v-if="cardError" class="card-error mb-4">
            <v-alert type="error" variant="tonal">
              {{ cardError }}
            </v-alert>
          </div>

          <!-- Payment Button -->
          <v-btn
            color="primary"
            size="large"
            block
            :loading="processing"
            :disabled="!stripe || !elements || processing"
            @click="handlePayment"
          >
            <v-icon left>mdi-lock</v-icon>
            Pagar {{ formatCurrency(amount) }}
          </v-btn>

          <!-- Security Notice -->
          <div class="security-notice mt-4">
            <v-icon size="small" color="success" class="mr-1">mdi-shield-check</v-icon>
            <span class="text-caption text-medium-emphasis">
              Tus datos están protegidos con encriptación SSL de 256 bits
            </span>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
// Add Stripe to window object for TypeScript
declare global {
  interface Window {
    Stripe: any;
  }
}

import { ref, onMounted, onUnmounted, watch } from 'vue'
import { usePaymentsStore } from '@/stores/payments'
import { useToast } from '@/stores/toast'
import { useAuth } from '@/stores/auth'

interface PaymentProps {
  amount: number
  currency?: string
  description: string
  membershipId?: string
  reservationId?: string
}

const props = withDefaults(defineProps<PaymentProps>(), {
  currency: 'USD'
})

const emit = defineEmits<{
  success: [payment: any]
  error: [error: string]
}>()

const paymentsStore = usePaymentsStore()
const toast = useToast()
const userStore = useAuth()

// Reactive data
const loading = ref(false)
const processing = ref(false)
const error = ref('')
const cardError = ref('')
const stripe = ref<any>(null)
const elements = ref<any>(null)
const cardElement = ref<any>(null)

// Load Stripe script
const loadStripe = () => {
  return new Promise((resolve, reject) => {
    if (window.Stripe) {
      resolve(window.Stripe)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.onload = () => resolve(window.Stripe)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// Initialize Stripe
const initializeStripe = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // Load Stripe if not already loaded
    const Stripe = await loadStripe()
    
    // Initialize Stripe with your publishable key
    // In production, this should come from environment variables
    if (Stripe && typeof Stripe === 'function') {
      stripe.value = Stripe('pk_test_your_publishable_key_here')
    } else {
      throw new Error('Stripe no se pudo cargar correctamente')
    }
    
    // Create elements instance
    elements.value = stripe.value.elements()
    
    // Create card element
    cardElement.value = elements.value.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#9e2146',
        },
      },
    })
    
    // Mount card element
    cardElement.value.mount('#card-element')
    
    // Handle card errors
    cardElement.value.on('change', (event: any) => {
      cardError.value = event.error ? event.error.message : ''
    })
    
  } catch (err) {
    console.error('Error initializing Stripe:', err)
    error.value = 'Error al cargar el sistema de pagos'
  } finally {
    loading.value = false
  }
}

// Handle payment
const handlePayment = async () => {
  if (!stripe.value || !elements.value || processing.value) return
  
  try {
    processing.value = true
    cardError.value = ''
    
    // Create payment intent
    const paymentIntent = await paymentsStore.create({
      userId: userStore.user?.id || '',
      membershipId: props.membershipId || '', // Required field
      amount: props.amount,
      method: 'CREDIT_CARD', // Default method for Stripe payments
      status: 'PENDING',
      description: props.description
    })
    
    if (!paymentIntent) {
      throw new Error('Error al crear el intent de pago')
    }
    
    // Confirm payment with Stripe
    const { error: stripeError, paymentIntent: confirmedIntent } = await stripe.value.confirmCardPayment(
      paymentIntent.client_secret,
      {
        payment_method: {
          card: cardElement.value,
          billing_details: {
            // You can add billing details here if needed
          },
        },
      }
    )
    
    if (stripeError) {
      cardError.value = stripeError.message || 'Error al procesar el pago'
      throw new Error(stripeError.message)
    }
    
    if (confirmedIntent.status === 'succeeded') {
      // Confirm payment with backend
      const payment = await paymentsStore.confirmPayment(paymentIntent.id)
      
      // Update payment record with success
      await paymentsStore.update(payment.id, {
        status: 'COMPLETED',
        stripePaymentId: confirmedIntent.id
      })
      
      toast.show('Pago procesado exitosamente', 'success')
      emit('success', payment)
    } else {
      throw new Error('El pago no pudo ser confirmado')
    }
    
  } catch (err: any) {
    console.error('Payment error:', err)
    const errorMessage = err.message || 'Error al procesar el pago'
    toast.show(errorMessage, 'error')
    emit('error', errorMessage)
  } finally {
    processing.value = false
  }
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: props.currency
  }).format(amount / 100) // Convert cents to dollars
}

// Watch for amount changes
watch(() => props.amount, () => {
  // Re-initialize if amount changes significantly
  if (stripe.value && elements.value) {
    // You might want to re-create the payment intent here
  }
})

// Lifecycle
onMounted(() => {
  initializeStripe()
})

onUnmounted(() => {
  if (cardElement.value) {
    cardElement.value.destroy()
  }
})
</script>

<style scoped>
.stripe-payment-form {
  max-width: 500px;
  margin: 0 auto;
}

.payment-summary {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.stripe-card-element {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  background: white;
  min-height: 40px;
}

.card-error {
  margin-top: 8px;
}

.security-notice {
  text-align: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.error-message {
  margin-bottom: 16px;
}
</style> 