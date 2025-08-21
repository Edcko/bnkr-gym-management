import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  // Estado del tema
  const currentTheme = ref<Theme>('auto')
  const isDark = ref(false)
  
  // Inicializar tema desde localStorage o preferencia del sistema
  const initTheme = () => {
    const savedTheme = localStorage.getItem('bnkr-theme') as Theme
    if (savedTheme) {
      currentTheme.value = savedTheme
    } else {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      currentTheme.value = prefersDark ? 'dark' : 'light'
    }
    
    applyTheme()
  }
  
  // Aplicar tema
  const applyTheme = () => {
    let shouldBeDark = false
    
    switch (currentTheme.value) {
      case 'dark':
        shouldBeDark = true
        break
      case 'light':
        shouldBeDark = false
        break
      case 'auto':
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        break
    }
    
    isDark.value = shouldBeDark
    
    // Aplicar clase al body
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
    
    // Guardar en localStorage
    localStorage.setItem('bnkr-theme', currentTheme.value)
  }
  
  // Cambiar tema
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    applyTheme()
  }
  
  // Toggle entre light/dark
  const toggleTheme = () => {
    if (currentTheme.value === 'auto') {
      setTheme(isDark.value ? 'light' : 'dark')
    } else {
      setTheme(currentTheme.value === 'dark' ? 'light' : 'dark')
    }
  }
  
  // Escuchar cambios en preferencia del sistema
  const setupSystemThemeListener = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      if (currentTheme.value === 'auto') {
        applyTheme()
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    
    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleChange)
  }
  
  // Watcher para cambios de tema
  watch(currentTheme, () => {
    applyTheme()
  })
  
  return {
    // State
    currentTheme,
    isDark,
    
    // Actions
    initTheme,
    setTheme,
    toggleTheme,
    setupSystemThemeListener
  }
})
