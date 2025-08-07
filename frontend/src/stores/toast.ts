import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToast = defineStore('toast', () => {
  const message = ref('')
  const type = ref<'success' | 'error' | 'warning' | 'info'>('info')
  const isVisible = ref(false)
  const timeout = ref(3000)

  const showToast = (msg: string, toastType: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) => {
    message.value = msg
    type.value = toastType
    timeout.value = duration
    isVisible.value = true

    setTimeout(() => {
      isVisible.value = false
    }, duration)
  }

  const hideToast = () => {
    isVisible.value = false
  }

  return {
    message,
    type,
    isVisible,
    show: showToast,
    hide: hideToast,
    timeout
  }
}) 