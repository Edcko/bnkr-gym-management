import { PrismaClient, User, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: UserRole
  phone?: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  role?: UserRole
  isActive?: boolean
  password?: string
}

export interface UserStats {
  total: number
  clients: number
  employees: number
  admins: number
  instructors: number
  active: number
  inactive: number
}

export class UserService {
  // Crear nuevo usuario
  static async createUser(userData: CreateUserData): Promise<User> {
    const { password, ...userDataWithoutPassword } = userData
    
    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })
    
    if (existingUser) {
      throw new Error('El email ya está registrado')
    }
    
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Crear usuario
    const user = await prisma.user.create({
      data: {
        ...userDataWithoutPassword,
        passwordHash: hashedPassword
      }
    })
    
    return user
  }
  
  // Obtener usuario por ID
  static async getUserById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id }
    })
  }
  
  // Obtener usuario por email
  static async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email }
    })
  }
  
  // Obtener todos los usuarios con paginación
  static async getAllUsers(page: number = 1, limit: number = 10, role?: UserRole) {
    const skip = (page - 1) * limit
    
    const where = role ? { role } : {}
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          address: true,
          emergencyContact: true,
          emergencyPhone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.user.count({ where })
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    return {
      users,
      total,
      totalPages,
      currentPage: page,
      limit
    }
  }
  
  // Obtener usuarios por rol
  static async getUsersByRole(role: UserRole, page: number = 1, limit: number = 10) {
    return await this.getAllUsers(page, limit, role)
  }
  
  // Buscar usuarios
  static async searchUsers(query: string, role?: UserRole) {
    const where = {
      AND: [
        role ? { role } : {},
        {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } },
            { phone: { contains: query } }
          ]
        }
      ]
    }
    
    return await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        emergencyContact: true,
        emergencyPhone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })
  }
  
  // Actualizar usuario
  static async updateUser(id: string, updateData: UpdateUserData): Promise<User> {
    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!existingUser) {
      throw new Error('Usuario no encontrado')
    }
    
    // Si se está actualizando el email, verificar que no exista
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email }
      })
      
      if (emailExists) {
        throw new Error('El email ya está registrado')
      }
    }
    
    // Preparar datos para actualización (excluir password si existe)
    const { password, ...dataToUpdate } = updateData
    
    // Si hay contraseña nueva, encriptarla
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12)
      ;(dataToUpdate as any).passwordHash = hashedPassword
    }
    
    // Actualizar usuario
    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate
    })
    
    return user
  }
  
  // Cambiar contraseña
  static async changePassword(id: string, currentPassword: string, newPassword: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!user) {
      throw new Error('Usuario no encontrado')
    }
    
    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
    
    if (!isPasswordValid) {
      throw new Error('Contraseña actual incorrecta')
    }
    
    // Encriptar nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)
    
    // Actualizar contraseña
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { passwordHash: hashedNewPassword }
    })
    
    return updatedUser
  }
  
  // Eliminar usuario (soft delete)
  static async deleteUser(id: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!user) {
      throw new Error('Usuario no encontrado')
    }
    
    // Soft delete - marcar como inactivo
    const deletedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false }
    })
    
    return deletedUser
  }
  
  // Activar/Desactivar usuario
  static async toggleUserStatus(id: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!user) {
      throw new Error('Usuario no encontrado')
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive }
    })
    
    return updatedUser
  }
  
  // Obtener estadísticas de usuarios
  static async getUserStats(): Promise<UserStats> {
    const [
      total,
      clients,
      employees,
      admins,
      instructors,
      active,
      inactive
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.CLIENT } }),
      prisma.user.count({ 
        where: { 
          role: { in: [UserRole.ADMIN, UserRole.INSTRUCTOR] } 
        } 
      }),
      prisma.user.count({ where: { role: UserRole.ADMIN } }),
      prisma.user.count({ where: { role: UserRole.INSTRUCTOR } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } })
    ])
    
    return {
      total,
      clients,
      employees,
      admins,
      instructors,
      active,
      inactive
    }
  }
  
  // Obtener usuarios activos por rol
  static async getActiveUsersByRole(role: UserRole) {
    return await prisma.user.findMany({
      where: {
        role,
        isActive: true
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true
      }
    })
  }
  
  // Verificar si el usuario tiene permisos de admin
  static async isAdmin(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })
    
    return user?.role === UserRole.ADMIN
  }
  
  // Verificar si el usuario tiene permisos de instructor o admin
  static async isInstructorOrAdmin(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })
    
    return user?.role === UserRole.INSTRUCTOR || user?.role === UserRole.ADMIN
  }
} 