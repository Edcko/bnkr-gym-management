<script setup lang="ts">
import Toast from '@/components/Toast.vue'
import { useLanguage } from '@/stores/language'
import { useAuth } from '@/stores/auth'
import { t } from '@/utils/translations'
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import ThemeToggle from '@/components/ThemeToggle.vue'

const language = useLanguage()
const auth = useAuth()

// Inicializar tema
const themeStore = useThemeStore()

onMounted(() => {
  language.initLanguage()
  auth.initAuth()
  // Inicializar tema y configurar listener para cambios del sistema
  themeStore.initTheme()
  themeStore.setupSystemThemeListener()
})

// Aplicación con navbar elegante
</script>

<template>
  <v-app>
    <!-- Navbar - Estilo Modest Muscle -->
    <v-app-bar app color="transparent" elevation="0" class="navbar-modest">
      <!-- Logo -->
      <div class="logo-container">
        <v-icon size="24" color="#ff6b35" class="logo-icon">mdi-dumbbell</v-icon>
        <span class="logo-text">BNKR</span>
        <v-icon size="24" color="#ff6b35" class="logo-icon">mdi-dumbbell</v-icon>
      </div>
      
      <v-spacer></v-spacer>
      
      <!-- Navegación centrada -->
      <div class="nav-center">
        <v-btn variant="text" color="white" class="nav-btn">
          {{ t('training', language.currentLanguage) }}
          <v-icon size="16" class="ml-1">mdi-chevron-down</v-icon>
        </v-btn>
        <v-btn variant="text" color="white" class="nav-btn">
          {{ t('movement', language.currentLanguage) }}
          <v-icon size="16" class="ml-1">mdi-chevron-down</v-icon>
        </v-btn>
        <v-btn variant="text" color="white" class="nav-btn">
          {{ t('apparel', language.currentLanguage) }}
          <v-icon size="16" class="ml-1">mdi-cart</v-icon>
        </v-btn>
      </div>
      
      <v-spacer></v-spacer>
      
      <!-- Redes sociales, idioma y botón -->
      <div class="nav-right">
        <div class="social-icons">
          <v-btn icon color="white" size="small" class="social-btn">
            <v-icon size="20">mdi-instagram</v-icon>
          </v-btn>
          <v-btn icon color="white" size="small" class="social-btn">
            <v-icon size="20">mdi-facebook</v-icon>
          </v-btn>
          <v-btn icon color="white" size="small" class="social-btn">
            <v-icon size="20">mdi-youtube</v-icon>
          </v-btn>
        </div>
        
        <!-- Selector de idioma -->
        <v-btn 
          icon 
          color="white" 
          size="small" 
          @click="language.toggleLanguage()"
          class="language-btn"
        >
          <span class="language-text">{{ language.currentLanguage.toUpperCase() }}</span>
        </v-btn>
        
        <!-- Theme Toggle -->
        <ThemeToggle />
        
        <!-- Botón de login/register o logout -->
        <template v-if="!auth.isAuthenticated">
          <v-btn 
            to="/login" 
            variant="text" 
            color="white" 
            class="nav-btn"
          >
            {{ t('login', language.currentLanguage) }}
          </v-btn>
          <v-btn 
            to="/register" 
            variant="outlined" 
            color="#ff6b35" 
            class="join-btn"
          >
            {{ t('joinMovement', language.currentLanguage) }}
          </v-btn>
        </template>
        
        <template v-else>
          <v-btn 
            @click="auth.logout" 
            variant="text" 
            color="white" 
            class="nav-btn"
          >
            {{ t('logout', language.currentLanguage) }}
          </v-btn>
        </template>
      </div>
    </v-app-bar>

    <!-- Contenido principal -->
    <v-main>
      <router-view />
    </v-main>

    <!-- Toast Notifications - Solo para usuarios logueados -->
    <Toast v-if="auth.isAuthenticated" />

    <!-- Footer - Estilo Modest Muscle -->
    <footer class="footer-modest">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">BNKR</h3>
          <p class="footer-text">
            Transforma tu vida con nuestras clases intensivas de Cardio-Boxing. 
            Únete al movimiento y descubre tu verdadero potencial.
          </p>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-subtitle">{{ t('contact', language.currentLanguage) }}</h4>
          <div class="contact-info">
            <div class="contact-item">
              <h5 class="contact-name">BNKR BOCA</h5>
              <p class="footer-text">+52 229 211 9924</p>
              <p class="footer-text">Av Progreso 579, Plaza San Ángel, Jardines de Mocambo, 94299 Veracruz, Ver.</p>
            </div>
            <div class="contact-item">
              <h5 class="contact-name">BNKR ORIZ</h5>
              <p class="footer-text">+52 272 201 2222</p>
              <p class="footer-text">Norte 26 No. 925 Col. El edén, 94324 Orizaba, Veracruz</p>
            </div>
          </div>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-subtitle">{{ t('schedules', language.currentLanguage) }}</h4>
          <p class="footer-text">Lun-Vie: 6:00 AM - 10:00 PM</p>
          <p class="footer-text">Sáb-Dom: 7:00 AM - 8:00 PM</p>
          <p class="footer-text">Clases especiales: 24/7</p>
        </div>
      </div>
      
      <div class="footer-bottom">
        <div class="footer-divider"></div>
        <p class="footer-copyright">
          © {{ new Date().getFullYear() }} BNKR Gym Management. {{ t('allRightsReserved', language.currentLanguage) }}
        </p>
      </div>
    </footer>
  </v-app>
</template>

<style>
/* Reset básico */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
  background: #1a1a1a;
  color: white;
  padding-top: 0; /* Asegurar que no haya padding adicional */
}

.v-application {
  background: #1a1a1a !important;
}

.v-main {
  padding: 0 !important;
  padding-top: 80px !important; /* Espacio para el navbar fijo */
  min-height: calc(100vh - 80px); /* Altura mínima considerando el navbar */
  position: relative;
  z-index: 1; /* Z-index menor que el navbar */
}

/* Navbar - Estilo Modest Muscle */
.navbar-modest {
  background: transparent !important;
  padding: 20px 40px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  height: 80px; /* Altura fija para el navbar */
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  letter-spacing: 0.1em;
}

.logo-icon {
  color: #ff6b35 !important;
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-btn {
  font-weight: 500;
  text-transform: none;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  color: white !important;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.social-icons {
  display: flex;
  gap: 10px;
}

.social-btn {
  color: white !important;
  transition: all 0.2s ease;
}

.social-btn:hover {
  color: #ff6b35 !important;
}

.language-btn {
  color: white !important;
  transition: all 0.2s ease;
  min-width: 40px;
}

.language-btn:hover {
  color: #ff6b35 !important;
}

.language-text {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.join-btn {
  border-color: #ff6b35 !important;
  color: #ff6b35 !important;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.05em;
  padding: 8px 20px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.join-btn:hover {
  background-color: #ff6b35 !important;
  color: white !important;
}

/* Footer - Estilo Modest Muscle */
.footer-modest {
  background: #1a1a1a;
  color: white;
  padding: 60px 40px 30px;
  width: 100%;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.footer-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 10px;
}

.footer-subtitle {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 10px;
}

.footer-text {
  font-size: 1rem;
  color: #cccccc;
  line-height: 1.6;
  font-weight: 300;
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-divider {
  height: 1px;
  background: #333333;
  margin-bottom: 20px;
}

.footer-copyright {
  text-align: center;
  color: #999999;
  font-size: 0.9rem;
  font-weight: 300;
}

/* Estilos para la información de contacto */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contact-item {
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid #333333;
}

.contact-name {
  font-size: 1rem;
  font-weight: 700;
  color: #ff6b35;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive navbar */
@media (max-width: 1024px) {
  .nav-center {
    gap: 20px;
  }
  
  .nav-btn {
    font-size: 0.8rem;
    padding: 6px 12px;
  }
}

/* Asegurar que todas las páginas tengan el espaciado correcto */
.dashboard-page,
.classes-page,
.reservations-page,
.membership-page,
.profile-page {
  padding-top: 0 !important; /* El padding-top ya está en .v-main */
}

/* Asegurar que el contenido principal no se superponga con el navbar */
.v-application {
  background: #1a1a1a !important;
  padding-top: 0 !important;
}

/* Asegurar que el router-view tenga el espaciado correcto */
.router-view {
  padding-top: 0 !important;
}

@media (max-width: 768px) {
  .navbar-modest {
    padding: 15px 20px;
    height: 70px; /* Altura menor en móviles */
  }
  
  .v-main {
    padding-top: 70px !important; /* Ajustar padding para móviles */
    min-height: calc(100vh - 70px);
  }
  
  .nav-center {
    display: none;
  }
  
  .social-icons {
    gap: 5px;
  }
  
  .join-btn {
    font-size: 0.8rem;
    padding: 6px 12px;
  }
  
  .footer-modest {
    padding: 40px 20px 20px;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style>
