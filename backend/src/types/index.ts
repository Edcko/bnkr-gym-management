import { Request } from 'express';
import { UserRole, ReservationStatus, MembershipType, MembershipStatus, PaymentStatus, MessageType } from '@prisma/client';

// Tipos de usuario
export interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

// Tipos para autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

// Tipos para clases
export interface CreateClassRequest {
  name: string;
  description?: string;
  duration: number;
  maxCapacity: number;
  price: number;
  instructorId: string;
}

export interface UpdateClassRequest {
  name?: string;
  description?: string;
  duration?: number;
  maxCapacity?: number;
  price?: number;
  isActive?: boolean;
}

// Tipos para reservas
export interface CreateReservationRequest {
  classId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface UpdateReservationRequest {
  status?: ReservationStatus;
  notes?: string;
}

// Tipos para membresías
export interface CreateMembershipRequest {
  userId: string;
  type: MembershipType;
  startDate: string;
  endDate: string;
  price: number;
}

export interface UpdateMembershipRequest {
  type?: MembershipType;
  status?: MembershipStatus;
  endDate?: string;
}

// Tipos para pagos
export interface CreatePaymentRequest {
  membershipId?: string;
  userId: string;
  amount: number;
  currency?: string;
  description?: string;
}

export interface StripePaymentRequest {
  paymentMethodId: string;
  amount: number;
  currency: string;
  description: string;
}

// Tipos para inventario
export interface CreateInventoryItemRequest {
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  threshold: number;
  price?: number;
  supplier?: string;
  location?: string;
}

export interface UpdateInventoryItemRequest {
  name?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  threshold?: number;
  price?: number;
  supplier?: string;
  location?: string;
  isActive?: boolean;
}

// Tipos para mensajes
export interface CreateMessageRequest {
  receiverId?: string;
  content: string;
  type?: MessageType;
}

// Tipos para FAQ
export interface CreateFAQRequest {
  question: string;
  answer: string;
  category: string;
  order?: number;
}

export interface UpdateFAQRequest {
  question?: string;
  answer?: string;
  category?: string;
  order?: number;
  isActive?: boolean;
}

// Tipos para reportes
export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  instructorId?: string;
  classId?: string;
  userId?: string;
}

export interface AttendanceReport {
  totalReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  attendanceRate: number;
  byClass: Array<{
    className: string;
    totalReservations: number;
    confirmedReservations: number;
    attendanceRate: number;
  }>;
  byInstructor: Array<{
    instructorName: string;
    totalReservations: number;
    confirmedReservations: number;
    attendanceRate: number;
  }>;
}

export interface RevenueReport {
  totalRevenue: number;
  membershipRevenue: number;
  classRevenue: number;
  byMonth: Array<{
    month: string;
    revenue: number;
    memberships: number;
    classes: number;
  }>;
}

export interface CapacityReport {
  totalCapacity: number;
  totalReservations: number;
  utilizationRate: number;
  byClass: Array<{
    className: string;
    capacity: number;
    reservations: number;
    utilizationRate: number;
  }>;
}

// Tipos para validación
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

// Tipos para WebSocket
export interface SocketMessage {
  type: 'message' | 'notification' | 'system';
  content: string;
  senderId?: string;
  receiverId?: string;
  timestamp: Date;
}

// Tipos para notificaciones
export interface Notification {
  id: string;
  type: 'reservation' | 'inventory' | 'payment' | 'system';
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

// Tipos para búsqueda y filtros
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  search?: string;
  filters?: Record<string, any>;
}

// Tipos para archivos
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// Tipos para logs del sistema
export interface SystemLogEntry {
  level: 'info' | 'warning' | 'error';
  message: string;
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
} 