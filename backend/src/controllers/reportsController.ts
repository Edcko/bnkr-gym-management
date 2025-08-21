import { Request, Response } from 'express'
import { asyncHandler } from '../middlewares/errorHandler'
import { UserService } from '../services/userService'
import { ClassService } from '../services/classService'
import { ReservationService } from '../services/reservationService'
import { MembershipService } from '../services/membershipService'

export class ReportsController {
  // Reporte general consolidado
  static getOverviewReport = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días por defecto
    const end = endDate ? new Date(endDate as string) : new Date()
    
    // Obtener todas las estadísticas en paralelo
    const [
      userStats,
      classStats,
      reservationStats,
      membershipStats
    ] = await Promise.all([
      UserService.getUserStats(),
      ClassService.getClassesStats(),
      ReservationService.getReservationStats(),
      MembershipService.getMembershipStats()
    ])
    
    // Calcular métricas consolidadas
    const overview = {
      period: { start, end },
      users: {
        total: userStats.total,
        active: userStats.active,
        growth: 0 // TODO: Implementar cálculo de crecimiento
      },
      classes: {
        total: classStats.total,
        active: classStats.active,
        instructors: classStats.instructors,
        growth: 0 // TODO: Implementar cálculo de crecimiento
      },
      reservations: {
        total: reservationStats.total,
        pending: reservationStats.pending,
        confirmed: reservationStats.confirmed,
        cancelled: reservationStats.cancelled,
        today: reservationStats.today,
        thisWeek: reservationStats.thisWeek,
        thisMonth: reservationStats.thisMonth
      },
      memberships: {
        total: membershipStats.total,
        active: membershipStats.active,
        expired: membershipStats.expired,
        growth: 0 // TODO: Implementar cálculo de crecimiento
      },
      revenue: {
        total: 0, // TODO: Implementar cuando se cree PaymentService
        monthly: 0,
        growth: 0
      }
    }
    
    return res.status(200).json({
      success: true,
      data: overview
    })
  })
  
  // Reporte de ingresos
  static getRevenueReport = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate as string) : new Date()
    
    // TODO: Implementar cuando se cree PaymentService
    return res.status(200).json({
      success: true,
      data: {
        period: { start, end },
        totalRevenue: 0,
        monthlyRevenue: 0,
        growth: 0,
        topProducts: [],
        paymentMethods: []
      }
    })
  })
  
  // Reporte de membresías
  static getMembershipReport = asyncHandler(async (req: Request, res: Response) => {
    const membershipStats = await MembershipService.getMembershipStats()
    
    return res.status(200).json({
      success: true,
      data: membershipStats
    })
  })
  
  // Reporte de clases
  static getClassReport = asyncHandler(async (req: Request, res: Response) => {
    const classStats = await ClassService.getClassesStats()
    
    return res.status(200).json({
      success: true,
      data: classStats
    })
  })
  
  // Reporte de usuarios
  static getUserReport = asyncHandler(async (req: Request, res: Response) => {
    const userStats = await UserService.getUserStats()
    
    return res.status(200).json({
      success: true,
      data: userStats
    })
  })
}
