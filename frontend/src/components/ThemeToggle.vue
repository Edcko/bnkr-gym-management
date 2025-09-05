<template>
  <div class="theme-toggle">
    <v-btn 
      @click="toggleTheme" 
      variant="text" 
      color="white" 
      class="theme-btn-navbar"
      :title="`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`"
    >
      <!-- Icono del sol (modo claro) -->
      <v-icon 
        size="20" 
        :color="!isDark ? '#dc143c' : 'white'"
        class="theme-icon"
      >
        mdi-weather-sunny
      </v-icon>
      
      <!-- Icono de la luna (modo oscuro) -->
      <v-icon 
        size="20" 
        :color="isDark ? '#dc143c' : 'white'"
        class="theme-icon"
      >
        mdi-weather-night
      </v-icon>
    </v-btn>
    
    <!-- Tooltip del tema actual -->
    <div class="theme-tooltip" :class="{ 'visible': showTooltip }">
      <span class="tooltip-text">
        {{ isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const showTooltip = ref(false)
let tooltipTimeout: number | null = null

// Computed
const isDark = computed(() => themeStore.isDark)

// Métodos
const toggleTheme = () => {
  themeStore.toggleTheme()
  showTooltipMessage()
}

const showTooltipMessage = () => {
  showTooltip.value = true
  
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout)
  }
  
  tooltipTimeout = window.setTimeout(() => {
    showTooltip.value = false
  }, 2000)
}

// Lifecycle
onMounted(() => {
  // Inicializar tema si no se ha hecho
  if (!themeStore.currentTheme) {
    themeStore.initTheme()
  }
})

onUnmounted(() => {
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout)
  }
})
</script>

<style scoped>
.theme-toggle {
  position: relative;
  display: inline-block;
  margin: 0 10px;
}

.theme-btn-navbar {
  min-width: auto !important;
  padding: 0 8px !important;
  height: 40px !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
}

.theme-btn-navbar:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  transform: translateY(-1px) !important;
}

.theme-icon {
  transition: all 0.3s ease;
}

.theme-icon:hover {
  transform: scale(1.1);
}

/* Tooltip */
.theme-tooltip {
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%) translateY(5px);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
}

.theme-tooltip.visible {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

/* Responsive */
@media (max-width: 768px) {
  .theme-btn-navbar {
    height: 36px !important;
    padding: 0 6px !important;
  }
  
  .theme-icon {
    font-size: 18px;
  }
}
</style>
