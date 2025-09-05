/**
 * Utilidades para formateo de fechas
 */

/**
 * Formatea una fecha ISO a formato legible en español
 * @param dateString - Fecha en formato ISO string
 * @returns Fecha formateada en formato DD/MM/YYYY
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-ES')
}

/**
 * Formatea una fecha ISO a formato legible con hora en español
 * @param dateString - Fecha en formato ISO string
 * @returns Fecha y hora formateada en formato DD/MM/YYYY HH:MM
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('es-ES')
}

/**
 * Formatea una fecha ISO a formato legible con hora completa en español
 * @param dateString - Fecha en formato ISO string
 * @returns Fecha y hora formateada en formato DD/MM/YYYY HH:MM:SS
 */
export const formatDateTimeFull = (dateString: string): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * Formatea una fecha ISO a formato relativo (hace X tiempo)
 * @param dateString - Fecha en formato ISO string
 * @returns Fecha relativa en español
 */
export const formatRelativeDate = (dateString: string): string => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Hace un momento'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `Hace ${days} día${days > 1 ? 's' : ''}`
  } else {
    return formatDate(dateString)
  }
}
