<template>
  <v-app-bar
    app
    color="white"
    elevation="1"
    class="navbar-clean"
  >
    <!-- Logo BNKR -->
    <v-app-bar-nav-icon
      @click="toggleDrawer"
      class="d-md-none"
      color="black"
    ></v-app-bar-nav-icon>

    <v-app-bar-title class="d-flex align-center">
      <h2 class="text-h4 font-weight-bold text-black">BNKR</h2>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <!-- Menú de navegación para desktop -->
    <div class="d-none d-md-flex nav-menu">
      <v-btn
        v-for="item in menuItems"
        :key="item.title"
        :to="item.to"
        variant="text"
        class="nav-btn mx-3"
        color="black"
        hover-color="grey-600"
      >
        {{ item.title }}
      </v-btn>
    </div>

    <!-- Botones de autenticación -->
    <div v-if="!isAuthenticated" class="d-none d-md-flex auth-buttons">
      <v-btn
        :to="{ name: 'login' }"
        variant="text"
        class="mr-4 auth-btn"
        color="black"
      >
        Iniciar Sesión
      </v-btn>
      <v-btn
        :to="{ name: 'register' }"
        color="black"
        variant="outlined"
        class="auth-btn"
        style="border-color: black;"
      >
        Registrarse
      </v-btn>
    </div>
  </v-app-bar>

  <!-- Drawer para móvil -->
  <v-navigation-drawer
    v-model="drawer"
    app
    temporary
    class="d-md-none"
  >
    <v-list>
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/men/78.jpg"
        :title="user?.name || 'Usuario'"
        :subtitle="user?.email || ''"
      ></v-list-item>

      <v-divider></v-divider>

      <v-list-item
        v-for="item in menuItems"
        :key="item.title"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
      ></v-list-item>

      <v-divider v-if="isAuthenticated"></v-divider>

      <v-list-item
        v-if="isAuthenticated"
        @click="logout"
        prepend-icon="mdi-logout"
        title="Cerrar Sesión"
        color="error"
      ></v-list-item>

      <v-list-item
        v-else
        :to="{ name: 'login' }"
        prepend-icon="mdi-login"
        title="Iniciar Sesión"
      ></v-list-item>

      <v-list-item
        v-if="!isAuthenticated"
        :to="{ name: 'register' }"
        prepend-icon="mdi-account-plus"
        title="Registrarse"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const theme = useTheme()
const authStore = useAuthStore()

// Estado
const drawer = ref(false)

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

// Menú de navegación
const menuItems = computed(() => {
  const items = [
    {
      title: 'Inicio',
      to: { name: 'home' },
      icon: 'mdi-home'
    },
    {
      title: 'Clases',
      to: { name: 'classes' },
      icon: 'mdi-dumbbell'
    }
  ]

  if (isAuthenticated.value) {
    if (authStore.isAdmin) {
      items.push(
        {
          title: 'Dashboard',
          to: { name: 'admin-dashboard' },
          icon: 'mdi-view-dashboard'
        },
        {
          title: 'Usuarios',
          to: { name: 'admin-users' },
          icon: 'mdi-account-group'
        },
        {
          title: 'Reportes',
          to: { name: 'admin-reports' },
          icon: 'mdi-chart-bar'
        },
        {
          title: 'Inventario',
          to: { name: 'admin-inventory' },
          icon: 'mdi-package-variant'
        }
      )
    } else if (authStore.isInstructor) {
      items.push(
        {
          title: 'Mis Clases',
          to: { name: 'instructor-classes' },
          icon: 'mdi-teach'
        },
        {
          title: 'Reportes',
          to: { name: 'instructor-reports' },
          icon: 'mdi-chart-line'
        }
      )
    }

    items.push(
      {
        title: 'Chat',
        to: { name: 'chat' },
        icon: 'mdi-chat'
      },
      {
        title: 'FAQ',
        to: { name: 'faq' },
        icon: 'mdi-help-circle'
      }
    )
  }

  return items
})

// Métodos
const toggleDrawer = () => {
  drawer.value = !drawer.value
}

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

const logout = async () => {
  try {
    authStore.logout()
    await router.push({ name: 'home' })
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>

<style scoped>
/* Importar fuentes */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto+Condensed:wght@300;400;700&display=swap');

.navbar-modern {
  background: linear-gradient(135deg, #000000 0%, #1A1A1A 100%) !important;
  border-bottom: 2px solid #FF5722;
}

.logo-container {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo-container:hover {
  transform: scale(1.05);
}

.logo-icon {
  position: relative;
}

.logo-icon::after {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background: radial-gradient(circle, rgba(255, 87, 34, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  z-index: -1;
}

.logo-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .logo-text {
    display: none;
  }
  
  .logo-icon {
    margin-right: 0;
  }
}

.text-gradient {
  background: linear-gradient(45deg, #FF5722, #D32F2F);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Orbitron', monospace;
  letter-spacing: 2px;
}

.nav-menu {
  margin-left: 2rem;
}

@media (max-width: 1024px) {
  .nav-menu {
    margin-left: 1rem;
  }
  
  .nav-btn {
    font-size: 0.9rem;
    padding: 0 0.5rem;
  }
}

.nav-btn {
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  transition: all 0.3s ease;
}

.nav-btn::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #FF5722, #D32F2F);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-btn:hover::after {
  width: 100%;
}

.auth-buttons {
  margin-left: 2rem;
}

@media (max-width: 1024px) {
  .auth-buttons {
    margin-left: 1rem;
  }
  
  .auth-btn {
    font-size: 0.8rem;
    padding: 0 0.75rem;
  }
}

.auth-btn {
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.auth-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 87, 34, 0.3);
}

/* Drawer moderno */
.v-navigation-drawer {
  background: linear-gradient(135deg, #000000 0%, #1A1A1A 100%) !important;
}

.v-list-item {
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0.5rem 0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.v-list-item:hover {
  background: rgba(255, 87, 34, 0.1) !important;
  transform: translateX(5px);
}
</style> 