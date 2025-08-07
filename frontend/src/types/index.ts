// Tipos de usuario
export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin' | 'instructor'
  createdAt: string
  updatedAt: string
}

// Tipos de clase
export interface Class {
  id: string
  name: string
  description: string
  duration: number
  capacity: number
  instructorId: string
  instructor?: User
  level: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  image?: string
  createdAt: string
  updatedAt: string
}

// Tipos de reservación
export interface Reservation {
  id: string
  userId: string
  classId: string
  instructorId: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  user?: User
  class?: Class
  instructor?: User
  createdAt: string
  updatedAt: string
}

// Tipos de newsletter
export interface NewsletterSubscription {
  id: string
  firstName: string
  lastName: string
  email: string
  createdAt: string
}

// Tipos de autenticación
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Tipos de API
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
} 