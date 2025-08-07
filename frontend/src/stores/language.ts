import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLanguage = defineStore('language', () => {
  const currentLanguage = ref<'es' | 'en'>('es')

  const setLanguage = (lang: 'es' | 'en') => {
    currentLanguage.value = lang
    localStorage.setItem('language', lang)
  }

  const toggleLanguage = () => {
    const newLang = currentLanguage.value === 'es' ? 'en' : 'es'
    setLanguage(newLang)
  }

  const initLanguage = () => {
    const savedLang = localStorage.getItem('language') as 'es' | 'en'
    if (savedLang) {
      currentLanguage.value = savedLang
    }
  }

  return {
    currentLanguage,
    setLanguage,
    toggleLanguage,
    initLanguage
  }
}) 