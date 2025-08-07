import { Request, Response } from 'express'
import { MembershipService } from '../services/membershipService'
import { asyncHandler } from '../middlewares/errorHandler'
import { AuthenticatedRequest } from '../types'
import { MembershipType, MembershipStatus } from '@prisma/client'

export class MembershipController {
  // Crear nueva membresía
  static createMembership = asyncHandler(async (req: Request, res: Response) => {
    const { userId, type, startDate, endDate, price } = req.body

    const membership = await MembershipService.createMembership({
      userId,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      price: parseFloat(price)
    })

    return res.status(201).json({
      success: true,
      message: 'Membresía creada exitosamente',
      data: membership
    })
  })

  // Obtener membresía por ID
  static getMembershipById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const membership = await MembershipService.getMembershipById(id)

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membresía no encontrada'
      })
    }

    return res.status(200).json({
      success: true,
      data: membership
    })
  })

  // Obtener membresía activa del usuario
  static getActiveMembership = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id

    const membership = await MembershipService.getActiveMembership(userId)

    return res.status(200).json({
      success: true,
      data: membership
    })
  })

  // Obtener todas las membresías del usuario
  static getUserMemberships = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id

    const memberships = await MembershipService.getUserMemberships(userId)

    return res.status(200).json({
      success: true,
      data: memberships
    })
  })

  // Obtener todas las membresías (admin)
  static getAllMemberships = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    const result = await MembershipService.getAllMemberships(page, limit)

    return res.status(200).json({
      success: true,
      data: result
    })
  })

  // Actualizar membresía
  static updateMembership = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const updateData = req.body

    if (updateData.price) {
      updateData.price = parseFloat(updateData.price)
    }

    const membership = await MembershipService.updateMembership(id, updateData)

    return res.status(200).json({
      success: true,
      message: 'Membresía actualizada exitosamente',
      data: membership
    })
  })

  // Renovar membresía
  static renewMembership = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { months = 1 } = req.body

    const membership = await MembershipService.renewMembership(id, months)

    return res.status(200).json({
      success: true,
      message: 'Membresía renovada exitosamente',
      data: membership
    })
  })

  // Cambiar tipo de membresía
  static changeMembershipType = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { newType } = req.body

    const membership = await MembershipService.changeMembershipType(id, newType)

    return res.status(200).json({
      success: true,
      message: 'Tipo de membresía cambiado exitosamente',
      data: membership
    })
  })

  // Cancelar membresía
  static cancelMembership = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const membership = await MembershipService.cancelMembership(id)

    return res.status(200).json({
      success: true,
      message: 'Membresía cancelada exitosamente',
      data: membership
    })
  })

  // Congelar membresía
  static freezeMembership = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { freezeUntil } = req.body

    const membership = await MembershipService.freezeMembership(id, new Date(freezeUntil))

    return res.status(200).json({
      success: true,
      message: 'Membresía congelada exitosamente',
      data: membership
    })
  })

  // Obtener estadísticas de membresías
  static getMembershipStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await MembershipService.getMembershipStats()

    return res.status(200).json({
      success: true,
      data: stats
    })
  })

  // Verificar si usuario tiene membresía activa
  static hasActiveMembership = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id

    const hasActive = await MembershipService.hasActiveMembership(userId)

    return res.status(200).json({
      success: true,
      data: { hasActive }
    })
  })

  // Obtener días restantes
  static getRemainingDays = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id

    const remainingDays = await MembershipService.getRemainingDays(userId)

    return res.status(200).json({
      success: true,
      data: { remainingDays }
    })
  })

  // Procesar expiración automática
  static processExpiredMemberships = asyncHandler(async (req: Request, res: Response) => {
    const expiredCount = await MembershipService.processExpiredMemberships()

    return res.status(200).json({
      success: true,
      message: `${expiredCount} membresías procesadas como expiradas`,
      data: { expiredCount }
    })
  })

  // Obtener planes disponibles
  static getAvailablePlans = asyncHandler(async (req: Request, res: Response) => {
    const plans = [
      {
        id: 'BASIC',
        name: 'Básico',
        price: 49.99,
        description: 'Acceso a clases básicas',
        features: [
          'Acceso a clases básicas',
          'Gimnasio básico',
          'Casillero temporal'
        ]
      },
      {
        id: 'PREMIUM',
        name: 'Premium',
        price: 89.99,
        description: 'Acceso completo a todas las clases y servicios',
        features: [
          'Acceso ilimitado a todas las clases',
          'Entrenamiento personalizado',
          'Acceso a spa y sauna',
          'Casillero personal',
          'Toallas incluidas',
          'Puntos de lealtad premium'
        ]
      },
      {
        id: 'UNLIMITED',
        name: 'Ilimitado',
        price: 129.99,
        description: 'Todo incluido + servicios premium',
        features: [
          'Todo lo del plan Premium',
          'Entrenador personal dedicado',
          'Evaluaciones nutricionales',
          'Clases privadas incluidas',
          'Acceso 24/7',
          'Estacionamiento incluido'
        ]
      }
    ]

    return res.status(200).json({
      success: true,
      data: plans
    })
  })
} 