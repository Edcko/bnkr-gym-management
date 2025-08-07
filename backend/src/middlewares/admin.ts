import { Request, Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../types'
import { UserRole } from '@prisma/client'

export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado'
    })
  }

  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador'
    })
  }

  return next()
}

export const instructorMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado'
    })
  }

  if (req.user.role !== UserRole.INSTRUCTOR && req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de instructor o administrador'
    })
  }

  return next()
} 