import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Importar estilos globales
import './assets/styles/main.css'
import './assets/styles/theme.css'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

// VeeValidate
import { configure } from 'vee-validate'
import * as rules from '@vee-validate/rules'

// Configurar VeeValidate
configure({
  validateOnInput: true,
  validateOnBlur: true,
  validateOnChange: true,
  validateOnModelUpdate: true
})

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          primary: '#ff6b35',
          secondary: '#424242',
          accent: '#ff6b35',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          background: '#1a1a1a',
          surface: '#2d2d2d',
          'on-background': '#ffffff',
          'on-surface': '#ffffff'
        }
      },
      light: {
        colors: {
          primary: '#ff6b35',
          secondary: '#424242',
          accent: '#ff6b35',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107'
        }
      }
    }
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
