<template>
  <div class="support-page">
    <div class="support-container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">Soporte al Cliente</h1>
        <p class="page-subtitle">Estamos aquí para ayudarte</p>
      </div>

      <!-- Opciones de contacto rápido -->
      <div class="quick-contact-grid">
        <v-card class="contact-card" elevation="2" @click="contactMethod = 'chat'">
          <v-card-text class="contact-content">
            <v-icon size="48" color="#4CAF50" class="contact-icon">mdi-chat</v-icon>
            <h3 class="contact-title">Chat en Vivo</h3>
            <p class="contact-description">Habla con nuestro equipo en tiempo real</p>
            <v-chip color="success" size="small">Disponible</v-chip>
          </v-card-text>
        </v-card>

        <v-card class="contact-card" elevation="2" @click="contactMethod = 'email'">
          <v-card-text class="contact-content">
            <v-icon size="48" color="#2196F3" class="contact-icon">mdi-email</v-icon>
            <h3 class="contact-title">Email</h3>
            <p class="contact-description">Envíanos un mensaje detallado</p>
            <v-chip color="info" size="small">Respuesta en 24h</v-chip>
          </v-card-text>
        </v-card>

        <v-card class="contact-card" elevation="2" @click="contactMethod = 'phone'">
          <v-card-text class="contact-content">
            <v-icon size="48" color="#FF9800" class="contact-icon">mdi-phone</v-icon>
            <h3 class="contact-title">Teléfono</h3>
            <p class="contact-description">Llámanos directamente</p>
            <v-chip color="warning" size="small">Lun-Vie 8AM-8PM</v-chip>
          </v-card-text>
        </v-card>

        <v-card class="contact-card" elevation="2" @click="contactMethod = 'whatsapp'">
          <v-card-text class="contact-content">
            <v-icon size="48" color="#25D366" class="contact-icon">mdi-whatsapp</v-icon>
            <h3 class="contact-title">WhatsApp</h3>
            <p class="contact-description">Mensaje rápido por WhatsApp</p>
            <v-chip color="success" size="small">Respuesta rápida</v-chip>
          </v-card-text>
        </v-card>
      </div>

      <!-- Información de contacto -->
      <v-card class="contact-info-card" elevation="2">
        <v-card-title>Información de Contacto</v-card-title>
        <v-card-text>
          <div class="contact-info-grid">
            <div class="contact-info-item">
              <v-icon color="primary" size="24">mdi-map-marker</v-icon>
              <div class="contact-info-content">
                <h4>Dirección</h4>
                <p>Av. Principal 123, Ciudad<br>Zona Centro, CP 12345</p>
              </div>
            </div>
            <div class="contact-info-item">
              <v-icon color="primary" size="24">mdi-phone</v-icon>
              <div class="contact-info-content">
                <h4>Teléfono</h4>
                <p>+52 (55) 1234-5678<br>+52 (55) 1234-5679</p>
              </div>
            </div>
            <div class="contact-info-item">
              <v-icon color="primary" size="24">mdi-email</v-icon>
              <div class="contact-info-content">
                <h4>Email</h4>
                <p>soporte@bnkrgym.com<br>info@bnkrgym.com</p>
              </div>
            </div>
            <div class="contact-info-item">
              <v-icon color="primary" size="24">mdi-clock</v-icon>
              <div class="contact-info-content">
                <h4>Horarios</h4>
                <p>Lunes a Viernes: 8:00 AM - 8:00 PM<br>Sábados: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- FAQ -->
      <v-card class="faq-card" elevation="2">
        <v-card-title>Preguntas Frecuentes</v-card-title>
        <v-card-text>
          <v-expansion-panels>
            <v-expansion-panel
              v-for="faq in faqs"
              :key="faq.id"
              class="faq-panel"
            >
              <v-expansion-panel-title class="faq-question">
                {{ faq.question }}
              </v-expansion-panel-title>
              <v-expansion-panel-text class="faq-answer">
                {{ faq.answer }}
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>

      <!-- Formulario de contacto -->
      <v-card class="contact-form-card" elevation="2">
        <v-card-title>Enviar Mensaje</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="submitContactForm" class="contact-form">
            <div class="form-row">
              <v-text-field
                v-model="contactForm.name"
                label="Nombre completo"
                variant="outlined"
                :rules="[rules.required]"
                class="form-field"
              ></v-text-field>
              <v-text-field
                v-model="contactForm.email"
                label="Email"
                type="email"
                variant="outlined"
                :rules="[rules.required, rules.email]"
                class="form-field"
              ></v-text-field>
            </div>

            <div class="form-row">
              <v-text-field
                v-model="contactForm.phone"
                label="Teléfono (opcional)"
                variant="outlined"
                class="form-field"
              ></v-text-field>
              <v-select
                v-model="contactForm.subject"
                :items="contactSubjects"
                label="Asunto"
                variant="outlined"
                :rules="[rules.required]"
                class="form-field"
              ></v-select>
            </div>

            <v-textarea
              v-model="contactForm.message"
              label="Mensaje"
              variant="outlined"
              :rules="[rules.required, rules.minLength]"
              rows="6"
              class="form-field"
            ></v-textarea>

            <div class="form-actions">
              <v-btn
                type="submit"
                color="primary"
                size="large"
                :loading="submitting"
                class="submit-btn"
              >
                Enviar Mensaje
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>

      <!-- Chat en vivo -->
      <v-dialog v-model="showChat" max-width="400" persistent>
        <v-card class="chat-dialog">
          <v-card-title class="chat-header">
            <div class="chat-title">
              <v-icon color="success" size="20">mdi-circle</v-icon>
              <span>Chat en Vivo</span>
            </div>
            <v-btn icon @click="showChat = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          
          <v-card-text class="chat-content">
            <div class="chat-messages" ref="chatMessages">
              <div 
                v-for="message in chatMessages" 
                :key="message.id"
                :class="['chat-message', message.type]"
              >
                <div class="message-content">
                  <p class="message-text">{{ message.text }}</p>
                  <span class="message-time">{{ message.time }}</span>
                </div>
              </div>
            </div>
            
            <div class="chat-input">
              <v-text-field
                v-model="newMessage"
                placeholder="Escribe tu mensaje..."
                variant="outlined"
                density="compact"
                @keyup.enter="sendMessage"
                class="message-input"
              ></v-text-field>
              <v-btn 
                icon 
                color="primary" 
                @click="sendMessage"
                :disabled="!newMessage.trim()"
              >
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useToast } from '@/stores/toast'

const toast = useToast()

// Estados
const contactMethod = ref('')
const submitting = ref(false)
const showChat = ref(false)
const newMessage = ref('')

// Formulario de contacto
const contactForm = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

// Validaciones
const rules = {
  required: (value: string) => !!value || 'Este campo es requerido',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Email inválido'
  },
  minLength: (value: string) => value.length >= 10 || 'Mínimo 10 caracteres'
}

// Asuntos de contacto
const contactSubjects = [
  'Consulta general',
  'Problema con membresía',
  'Cancelación de clase',
  'Problema técnico',
  'Sugerencia',
  'Reclamo',
  'Otro'
]

// FAQ
const faqs = ref([
  {
    id: 1,
    question: '¿Cómo puedo cancelar mi membresía?',
    answer: 'Puedes cancelar tu membresía desde tu perfil en la sección de membresías, o contactando directamente con nuestro equipo de soporte.'
  },
  {
    id: 2,
    question: '¿Puedo reprogramar una clase?',
    answer: 'Sí, puedes reprogramar una clase hasta 2 horas antes del inicio desde la sección de reservas en tu dashboard.'
  },
  {
    id: 3,
    question: '¿Qué incluye mi membresía Premium?',
    answer: 'La membresía Premium incluye acceso ilimitado a todas las clases, entrenamiento personalizado, acceso a spa y sauna, casillero personal y toallas incluidas.'
  },
  {
    id: 4,
    question: '¿Cómo funcionan los puntos de lealtad?',
    answer: 'Ganas puntos por cada clase que tomas, por renovar tu membresía y por referir amigos. Los puntos se pueden canjear por descuentos y servicios especiales.'
  },
  {
    id: 5,
    question: '¿Puedo congelar mi membresía?',
    answer: 'Sí, puedes congelar tu membresía por hasta 3 meses por año. Esta opción está disponible en tu perfil de membresía.'
  },
  {
    id: 6,
    question: '¿Qué debo traer a mi primera clase?',
    answer: 'Para tu primera clase, solo necesitas traer ropa cómoda para ejercitar. Proporcionamos toallas, agua y todo el equipo necesario.'
  }
])

// Chat en vivo
const chatMessages = ref([
  {
    id: 1,
    type: 'agent',
    text: '¡Hola! Bienvenido al chat de soporte de BNKR Gym. ¿En qué puedo ayudarte hoy?',
    time: '14:30'
  }
])

const chatMessagesRef = ref()

// Métodos
const submitContactForm = async () => {
  submitting.value = true
  
  try {
    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast.show('Mensaje enviado exitosamente. Te responderemos pronto.', 'success')
    
    // Limpiar formulario
    contactForm.value = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    }
  } catch (error) {
    toast.show('Error al enviar el mensaje. Intenta de nuevo.', 'error')
  } finally {
    submitting.value = false
  }
}

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  
  // Agregar mensaje del usuario
  chatMessages.value.push({
    id: Date.now(),
    type: 'user',
    text: newMessage.value,
    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  })
  
  const userMessage = newMessage.value
  newMessage.value = ''
  
  // Simular respuesta del agente
  setTimeout(() => {
    chatMessages.value.push({
      id: Date.now() + 1,
      type: 'agent',
      text: `Gracias por tu mensaje: "${userMessage}". Un agente te responderá en breve.`,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    })
  }, 1000)
}

// Watchers
watch(contactMethod, (newMethod) => {
  if (newMethod === 'chat') {
    showChat.value = true
  } else if (newMethod === 'email') {
    // Scroll al formulario
    document.querySelector('.contact-form-card')?.scrollIntoView({ behavior: 'smooth' })
  } else if (newMethod === 'phone') {
    toast.show('Llámanos al +52 (55) 1234-5678', 'info')
  } else if (newMethod === 'whatsapp') {
    toast.show('Abre WhatsApp y envía un mensaje al +52 (55) 1234-5678', 'info')
  }
})

watch(chatMessages, async () => {
  await nextTick()
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
})
</script>

<style scoped>
.support-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.support-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #666;
}

.quick-contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.contact-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.contact-content {
  text-align: center;
  padding: 30px 20px;
}

.contact-icon {
  margin-bottom: 16px;
}

.contact-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.contact-description {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
}

.contact-info-card {
  margin-bottom: 30px;
  border-radius: 12px;
}

.contact-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.contact-info-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.contact-info-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.contact-info-content p {
  color: #666;
  line-height: 1.4;
  margin: 0;
}

.faq-card {
  margin-bottom: 30px;
  border-radius: 12px;
}

.faq-panel {
  margin-bottom: 8px;
}

.faq-question {
  font-weight: 600;
  color: #1a1a1a;
}

.faq-answer {
  color: #666;
  line-height: 1.6;
}

.contact-form-card {
  border-radius: 12px;
}

.contact-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-field {
  margin-bottom: 20px;
}

.form-actions {
  text-align: center;
  margin-top: 30px;
}

.submit-btn {
  min-width: 200px;
}

.chat-dialog {
  border-radius: 12px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #4CAF50;
  color: white;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.chat-content {
  padding: 0;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f8f9fa;
}

.chat-message {
  margin-bottom: 16px;
  display: flex;
}

.chat-message.user {
  justify-content: flex-end;
}

.chat-message.agent {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.chat-message.user .message-content {
  background: #2196F3;
  color: white;
  border-bottom-right-radius: 4px;
}

.chat-message.agent .message-content {
  background: white;
  color: #1a1a1a;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
}

.message-text {
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

.chat-input {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.message-input {
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .support-page {
    padding: 10px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .quick-contact-grid {
    grid-template-columns: 1fr;
  }
  
  .contact-info-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .chat-content {
    height: 350px;
  }
}
</style> 