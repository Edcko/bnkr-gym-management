import { Request, Response } from 'express'
import { UserService, CreateUserData, UpdateUserData } from '../services/userService'
import { asyncHandler } from '../middlewares/errorHandler'
import { AuthenticatedRequest } from '../types'
import { UserRole } from '@prisma/client'

export class UserController {
  // Crear nuevo usuario
  static createUser = asyncHandler(async (req: Request, res: Response) => {
    const userData: CreateUserData = req.body

    const user = await UserService.createUser(userData)

    // No devolver la contraseña
    const { passwordHash, ...userWithoutPassword } = user

    return res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: userWithoutPassword
    })
  })

  // Obtener usuario por ID
  static getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const user = await UserService.getUserById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    // No devolver la contraseña
    const { passwordHash, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      data: userWithoutPassword
    })
  })

  // Obtener todos los usuarios
  static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const role = req.query.role as UserRole

    const result = await UserService.getAllUsers(page, limit, role)

    return res.status(200).json({
      success: true,
      data: result
    })
  })

  // Obtener usuarios por rol
  static getUsersByRole = asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    if (!Object.values(UserRole).includes(role as UserRole)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido'
      })
    }

    const result = await UserService.getUsersByRole(role as UserRole, page, limit)

    return res.status(200).json({
      success: true,
      data: result
    })
  })

  // Buscar usuarios
  static searchUsers = asyncHandler(async (req: Request, res: Response) => {
    const { query } = req.query
    const role = req.query.role as UserRole

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query de búsqueda requerida'
      })
    }

    const users = await UserService.searchUsers(query, role)

    return res.status(200).json({
      success: true,
      data: users
    })
  })

  // Actualizar usuario
  static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const updateData: UpdateUserData = req.body

    const user = await UserService.updateUser(id, updateData)

    // No devolver la contraseña
    const { passwordHash, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: userWithoutPassword
    })
  })

  // Cambiar contraseña
  static changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva contraseña son requeridas'
      })
    }

    const user = await UserService.changePassword(userId, currentPassword, newPassword)

    // No devolver la contraseña
    const { passwordHash, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      message: 'Contraseña cambiada exitosamente',
      data: userWithoutPassword
    })
  })

  // Eliminar usuario
  static deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const user = await UserService.deleteUser(id)

    // No devolver la contraseña
    const { passwordHash, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      data: userWithoutPassword
    })
  })

  // Activar/Desactivar usuario
  static toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const user = await UserService.toggleUserStatus(id)

    // No devolver la contraseña
    const { passwordHash, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      message: `Usuario ${user.isActive ? 'activado' : 'desactivado'} exitosamente`,
      data: userWithoutPassword
    })
  })

  // Obtener estadísticas de usuarios
  static getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await UserService.getUserStats()

    return res.status(200).json({
      success: true,
      data: stats
    })
  })

  // Obtener usuarios activos por rol
  static getActiveUsersByRole = asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.params

    if (!Object.values(UserRole).includes(role as UserRole)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido'
      })
    }

    const users = await UserService.getActiveUsersByRole(role as UserRole)

    return res.status(200).json({
      success: true,
      data: users
    })
  })

  // Obtener perfil del usuario autenticado
  static getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id

    const user = await UserService.getUserById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    // No devolver la contraseña
    const { passwordHash, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      data: userWithoutPassword
    })
  })

  // Actualizar perfil del usuario autenticado
  static updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const updateData: UpdateUserData = req.body

    // No permitir cambiar el rol desde el perfil
    delete updateData.role
    delete updateData.isActive

    const user = await UserService.updateUser(userId, updateData)

    // No devolver la contraseña
    const { passwordHash, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: userWithoutPassword
    })
  })

  // Métodos específicos para clientes
  static getAllClients = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    const result = await UserService.getUsersByRole('CLIENT', page, limit)

    return res.status(200).json({
      success: true,
      data: result
    })
  })

  static getClientById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const user = await UserService.getUserById(id)

    if (!user || user.role !== 'CLIENT') {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      })
    }

    // No devolver la contraseña
    const { passwordHash, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      data: userWithoutPassword
    })
  })

  static createClient = asyncHandler(async (req: Request, res: Response) => {
    const userData: CreateUserData = { ...req.body, role: 'CLIENT' }

    const user = await UserService.createUser(userData)

    // No devolver la contraseña
    const { passwordHash, ...userWithoutPassword } = user

    return res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: userWithoutPassword
    })
  })

  static updateClient = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const updateData: UpdateUserData = req.body

    // No permitir cambiar el rol a cliente
    delete updateData.role

    const user = await UserService.updateUser(id, updateData)

    // No devolver la contraseña
    const { passwordHash, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: userWithoutPassword
    })
  })

  static deleteClient = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const user = await UserService.deleteUser(id)

    // No devolver la contraseña
    const { passwordHash, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      message: 'Cliente eliminado exitosamente',
      data: userWithoutPassword
    })
  })

  static getClientStats = asyncHandler(async (req: Request, res: Response) => {
    try {
      const stats = await UserService.getUserStats()

      return res.status(200).json({
        success: true,
        data: {
          totalClients: 0,
          activeClients: 0,
          newClientsThisMonth: 0
        }
      })
    } catch (error) {
      return res.status(200).json({
        success: true,
        data: {
          totalClients: 0,
          activeClients: 0,
          newClientsThisMonth: 0
        }
      })
    }
  })

  // Métodos específicos para empleados
  static getAllEmployees = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    const result = await UserService.getUsersByRole('INSTRUCTOR', page, limit)

    return res.status(200).json({
      success: true,
      data: result
    })
  })

  static getEmployeeById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const user = await UserService.getUserById(id)

    if (!user || user.role !== 'INSTRUCTOR') {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      })
    }

    // No devolver la contraseña
    const { passwordHash, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      data: userWithoutPassword
    })
  })

  static createEmployee = asyncHandler(async (req: Request, res: Response) => {
    const userData: CreateUserData = { ...req.body, role: 'INSTRUCTOR' }

    const user = await UserService.createUser(userData)

    // No devolver la contraseña
    const { passwordHash, ...userWithoutPassword } = user

    return res.status(201).json({
      success: true,
      message: 'Empleado creado exitosamente',
      data: userWithoutPassword
    })
  })

  static updateEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const updateData: UpdateUserData = req.body

    // No permitir cambiar el rol a empleado
    delete updateData.role

    const user = await UserService.updateUser(id, updateData)

    // No devolver la contraseña
    const { passwordHash, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      message: 'Empleado actualizado exitosamente',
      data: userWithoutPassword
    })
  })

  static deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const user = await UserService.deleteUser(id)

    // No devolver la contraseña
    const { passwordHash, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      message: 'Empleado eliminado exitosamente',
      data: userWithoutPassword
    })
  })

  static getEmployeeStats = asyncHandler(async (req: Request, res: Response) => {
    try {
      const stats = await UserService.getUserStats()

      return res.status(200).json({
        success: true,
        data: {
          totalEmployees: 0,
          activeEmployees: 0,
          newEmployeesThisMonth: 0
        }
      })
    } catch (error) {
      return res.status(200).json({
        success: true,
        data: {
          totalEmployees: 0,
          activeEmployees: 0,
          newEmployeesThisMonth: 0
        }
      })
    }
  })
}