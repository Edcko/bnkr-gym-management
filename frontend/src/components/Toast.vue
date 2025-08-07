<template>
  <Transition name="toast">
    <div v-if="toast.isVisible" class="toast-container">
      <div :class="['toast', `toast-${toast.type}`]">
        <div class="toast-content">
          <v-icon :icon="getIcon()" size="20" class="toast-icon"></v-icon>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <v-btn 
          icon 
          size="small" 
          variant="text" 
          @click="toast.hide()"
          class="toast-close"
        >
          <v-icon size="16">mdi-close</v-icon>
        </v-btn>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useToast } from '@/stores/toast'

const toast = useToast()

const getIcon = () => {
  switch (toast.type) {
    case 'success':
      return 'mdi-check-circle'
    case 'error':
      return 'mdi-alert-circle'
    case 'warning':
      return 'mdi-alert'
    case 'info':
      return 'mdi-information'
    default:
      return 'mdi-information'
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 10px;
  backdrop-filter: blur(10px);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.toast-icon {
  flex-shrink: 0;
}

.toast-message {
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  margin-left: 12px;
}

/* Toast types */
.toast-success {
  background: rgba(76, 175, 80, 0.95);
  color: white;
  border-left: 4px solid #4CAF50;
}

.toast-error {
  background: rgba(244, 67, 54, 0.95);
  color: white;
  border-left: 4px solid #F44336;
}

.toast-warning {
  background: rgba(255, 193, 7, 0.95);
  color: #333;
  border-left: 4px solid #FFC107;
}

.toast-info {
  background: rgba(33, 150, 243, 0.95);
  color: white;
  border-left: 4px solid #2196F3;
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 768px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .toast {
    padding: 12px 16px;
  }
  
  .toast-message {
    font-size: 0.9rem;
  }
}
</style> 