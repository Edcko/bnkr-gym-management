<template>
  <div class="theme-toggle">
    <button 
      @click="toggleTheme" 
      class="theme-btn"
      :class="{ 'dark': isDark, 'light': !isDark }"
      :title="`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`"
    >
      <!-- Icono del sol (modo claro) -->
      <div class="icon-container sun-icon" :class="{ 'active': !isDark }">
        <v-icon size="18" color="#f59e0b">mdi-weather-sunny</v-icon>
      </div>
      
      <!-- Icono de la luna (modo oscuro) -->
      <div class="icon-container moon-icon" :class="{ 'active': isDark }">
        <v-icon size="18" color="#6366f1">mdi-weather-night</v-icon>
      </div>
      
      <!-- Indicador de estado -->
      <div class="theme-indicator" :class="{ 'dark': isDark, 'light': !isDark }">
        <div class="indicator-dot"></div>
      </div>
    </button>
    
    <!-- Tooltip del tema actual -->
    <div class="theme-tooltip" :class="{ 'visible': showTooltip }">
      <span class="tooltip-text">
        {{ isDark ? 'Modo Oscuro' : 'Modo Claro' }}
      </span>
      <div class="tooltip-arrow"></div>
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
}

.theme-btn {
  position: relative;
  width: 48px;
  height: 24px;
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.theme-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.theme-btn.light {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
}

.theme-btn.dark {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.theme-btn.light:hover {
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.theme-btn.dark:hover {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.icon-container {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.icon-container.active {
  opacity: 1;
  transform: scale(1.1);
}

.sun-icon {
  color: #f59e0b;
}

.moon-icon {
  color: #6366f1;
}

.theme-indicator {
  position: absolute;
  top: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.theme-indicator.light {
  left: 2px;
  transform: translateX(0);
}

.theme-indicator.dark {
  left: 2px;
  transform: translateX(24px);
}

.indicator-dot {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  transition: all 0.3s ease;
}

.theme-indicator.dark .indicator-dot {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

/* Tooltip */
.theme-tooltip {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
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

.tooltip-arrow {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid rgba(0, 0, 0, 0.8);
}

/* Responsive */
@media (max-width: 768px) {
  .theme-btn {
    width: 44px;
    height: 22px;
  }
  
  .theme-indicator {
    width: 18px;
    height: 18px;
  }
  
  .theme-indicator.dark {
    transform: translateX(22px);
  }
  
  .icon-container {
    width: 14px;
    height: 14px;
  }
  
  .icon-container v-icon {
    font-size: 16px;
  }
}

/* Animaciones */
@keyframes sunRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes moonFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
}

.sun-icon.active {
  animation: sunRotate 2s linear infinite;
}

.moon-icon.active {
  animation: moonFloat 2s ease-in-out infinite;
}
</style>
