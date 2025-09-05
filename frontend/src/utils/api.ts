import axios from 'axios'
import type { 
  User, 
  Class, 
  Reservation, 
  NewsletterSubscription,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ApiResponse,
  PaginatedResponse
} from '@/types'

// Configuración base de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Servicios de API
export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', credentials),
  
  register: (userData: RegisterData) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', userData),
  
  logout: () => api.post('/auth/logout'),
  
  getProfile: () => api.get<ApiResponse<User>>('/auth/profile'),
}

export const newsletterService = {
  subscribe: (data: { firstName: string; lastName: string; email: string }) =>
    api.post<ApiResponse<NewsletterSubscription>>('/newsletter/subscribe', data),
}

export const classService = {
  getAll: () => api.get<ApiResponse<Class[]>>('/classes'),
  
  getById: (id: string) => api.get<ApiResponse<Class>>(`/classes/${id}`),
  
  create: (classData: Partial<Class>) => api.post<ApiResponse<Class>>('/classes', classData),
  
  update: (id: string, classData: Partial<Class>) => api.put<ApiResponse<Class>>(`/classes/${id}`, classData),
  
  delete: (id: string) => api.delete(`/classes/${id}`),
}

export const reservationService = {
  getAll: () => api.get<ApiResponse<Reservation[]>>('/reservations'),
  
  getByUser: (userId: string) => api.get<ApiResponse<Reservation[]>>(`/reservations/user/${userId}`),
  
  create: (reservationData: Partial<Reservation>) => api.post<ApiResponse<Reservation>>('/reservations', reservationData),
  
  update: (id: string, reservationData: Partial<Reservation>) => api.put<ApiResponse<Reservation>>(`/reservations/${id}`, reservationData),
  
  delete: (id: string) => api.delete(`/reservations/${id}`),
}

export const userService = {
  getAll: () => api.get<ApiResponse<User[]>>('/users'),
  
  getById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),
  
  update: (id: string, userData: Partial<User>) => api.put<ApiResponse<User>>(`/users/${id}`, userData),
  
  delete: (id: string) => api.delete(`/users/${id}`),
}

export { api }
export default api 