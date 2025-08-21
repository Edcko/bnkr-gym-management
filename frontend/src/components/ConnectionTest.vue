<template>
  <v-card class="ma-4 pa-4">
    <v-card-title class="text-h5 mb-4">
      🔗 Prueba de Conexión con el Backend
    </v-card-title>
    
    <v-card-text>
      <v-alert
        v-if="connectionStatus"
        :type="connectionStatus.success ? 'success' : 'error'"
        :title="connectionStatus.success ? '✅ Conexión Exitosa' : '❌ Error de Conexión'"
        class="mb-4"
      >
        {{ connectionStatus.message }}
        <br>
        <small v-if="connectionStatus.timestamp">
          Timestamp: {{ new Date(connectionStatus.timestamp).toLocaleString() }}
        </small>
      </v-alert>

      <v-row>
        <v-col cols="12" md="6">
          <v-btn
            @click="testHealthEndpoint"
            :loading="testingHealth"
            color="primary"
            block
            class="mb-3"
          >
            🏥 Probar Endpoint de Salud
          </v-btn>
          
          <v-btn
            @click="testAuthEndpoint"
            :loading="testingAuth"
            color="secondary"
            block
            class="mb-3"
          >
            🔐 Probar Endpoint de Autenticación
          </v-btn>
          
          <v-btn
            @click="testUsersEndpoint"
            :loading="testingUsers"
            color="info"
            block
            class="mb-3"
          >
            👥 Probar Endpoint de Usuarios
          </v-btn>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="pa-3">
            <v-card-title class="text-h6">📊 Estado de la Conexión</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon :color="backendStatus ? 'success' : 'error'">
                      {{ backendStatus ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>Backend (Puerto 3001)</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ backendStatus ? 'Conectado' : 'Desconectado' }}
                  </v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon :color="apiConfig ? 'success' : 'error'">
                      {{ apiConfig ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>Configuración de API</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ apiConfig }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-divider class="my-4"></v-divider>
      
      <v-card-title class="text-h6">📝 Log de Pruebas</v-card-title>
      <v-card-text>
        <v-list density="compact" max-height="200" class="overflow-y-auto">
          <v-list-item
            v-for="(log, index) in testLogs"
            :key="index"
            :class="log.type === 'error' ? 'error' : log.type === 'success' ? 'success' : 'info'"
          >
            <template v-slot:prepend>
              <v-icon :color="getLogColor(log.type)">
                {{ getLogIcon(log.type) }}
              </v-icon>
            </template>
            <v-list-item-title>{{ log.message }}</v-list-item-title>
            <v-list-item-subtitle>{{ log.timestamp }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/utils/api'

// Estado
const connectionStatus = ref<any>(null)
const testingHealth = ref(false)
const testingAuth = ref(false)
const testingUsers = ref(false)
const backendStatus = ref(false)
const apiConfig = ref('')
const testLogs = ref<Array<{type: 'success' | 'error' | 'info', message: string, timestamp: string}>>([])

// Métodos
const addLog = (type: 'success' | 'error' | 'info', message: string) => {
  testLogs.value.unshift({
    type,
    message,
    timestamp: new Date().toLocaleTimeString()
  })
  
  // Mantener solo los últimos 10 logs
  if (testLogs.value.length > 10) {
    testLogs.value = testLogs.value.slice(0, 10)
  }
}

const getLogColor = (type: string) => {
  switch (type) {
    case 'success': return 'success'
    case 'error': return 'error'
    default: return 'info'
  }
}

const getLogIcon = (type: string) => {
  switch (type) {
    case 'success': return 'mdi-check-circle'
    case 'error': return 'mdi-close-circle'
    default: return 'mdi-information'
  }
}

const testHealthEndpoint = async () => {
  testingHealth.value = true
  addLog('info', 'Probando endpoint de salud...')
  
  try {
    const response = await api.get('/health')
    connectionStatus.value = response.data
    backendStatus.value = true
    addLog('success', `Endpoint de salud respondió: ${response.data.message}`)
  } catch (error: any) {
    connectionStatus.value = {
      success: false,
      message: `Error: ${error.message}`,
      timestamp: new Date().toISOString()
    }
    backendStatus.value = false
    addLog('error', `Error en endpoint de salud: ${error.message}`)
  } finally {
    testingHealth.value = false
  }
}

const testAuthEndpoint = async () => {
  testingAuth.value = true
  addLog('info', 'Probando endpoint de autenticación...')
  
  try {
    const response = await api.get('/auth/profile')
    addLog('success', 'Endpoint de autenticación respondió correctamente')
  } catch (error: any) {
    if (error.response?.status === 401) {
      addLog('info', 'Endpoint de autenticación requiere token (comportamiento esperado)')
    } else {
      addLog('error', `Error en endpoint de autenticación: ${error.message}`)
    }
  } finally {
    testingAuth.value = false
  }
}

const testUsersEndpoint = async () => {
  testingUsers.value = true
  addLog('info', 'Probando endpoint de usuarios...')
  
  try {
    const response = await api.get('/users')
    addLog('success', `Endpoint de usuarios respondió: ${response.data.data?.length || 0} usuarios encontrados`)
  } catch (error: any) {
    if (error.response?.status === 401) {
      addLog('info', 'Endpoint de usuarios requiere autenticación (comportamiento esperado)')
    } else {
      addLog('error', `Error en endpoint de usuarios: ${error.message}`)
    }
  } finally {
    testingUsers.value = false
  }
}

// Inicialización
onMounted(async () => {
  // Verificar configuración de API
  apiConfig.value = api.defaults.baseURL || 'No configurado'
  
  // Probar conexión inicial
  await testHealthEndpoint()
  
  addLog('info', 'Componente de prueba inicializado')
})
</script>

<style scoped>
.error {
  background-color: rgba(244, 67, 54, 0.1);
}

.success {
  background-color: rgba(76, 175, 80, 0.1);
}

.info {
  background-color: rgba(33, 150, 243, 0.1);
}
</style>

