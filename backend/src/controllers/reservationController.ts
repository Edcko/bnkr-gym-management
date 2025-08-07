import { Request, Response } from 'express'
import { ReservationService } from '../services/reservationService'
import { asyncHandler } from '../middlewares/errorHandler'
import { AuthenticatedRequest } from '../types'
import { ReservationStatus } from '@prisma/client'

export class ReservationController {
  // Crear nueva reserva
  static createReservation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const { classId, instructorId, startTime, endTime, notes } = req.body

    const reservation = await ReservationService.createReservation({
      userId,
      classId,
      instructorId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      notes
    })

    return res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: reservation
    })
  })

  // Obtener reserva por ID
  static getReservationById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const reservation = await ReservationService.getReservationById(id)

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      })
    }

    return res.status(200).json({
      success: true,
      data: reservation
    })
  })

  // Obtener reservas del usuario
  static getUserReservations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const { status } = req.query

    const reservations = await ReservationService.getUserReservations(
      userId,
      status as ReservationStatus
    )

    return res.status(200).json({
      success: true,
      data: reservations
    })
  })

  // Obtener próximas reservas del usuario
  static getUpcomingReservations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id

    const reservations = await ReservationService.getUpcomingReservations(userId)

    return res.status(200).json({
      success: true,
      data: reservations
    })
  })

  // Obtener reservas pasadas del usuario
  static getPastReservations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id

    const reservations = await ReservationService.getPastReservations(userId)

    return res.status(200).json({
      success: true,
      data: reservations
    })
  })

  // Obtener reservas de una clase
  static getClassReservations = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params
    const { date } = req.query

    const reservations = await ReservationService.getClassReservations(
      classId,
      date ? new Date(date as string) : undefined
    )

    return res.status(200).json({
      success: true,
      data: reservations
    })
  })

  // Obtener reservas de un instructor
  static getInstructorReservations = asyncHandler(async (req: Request, res: Response) => {
    const { instructorId } = req.params
    const { date } = req.query

    const reservations = await ReservationService.getInstructorReservations(
      instructorId,
      date ? new Date(date as string) : undefined
    )

    return res.status(200).json({
      success: true,
      data: reservations
    })
  })

  // Obtener todas las reservas (admin/instructor)
  static getAllReservations = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const status = req.query.status as ReservationStatus

    const result = await ReservationService.getAllReservations(page, limit, status)

    return res.status(200).json({
      success: true,
      data: result
    })
  })

  // Actualizar reserva
  static updateReservation = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const updateData = req.body

    if (updateData.startTime) {
      updateData.startTime = new Date(updateData.startTime)
    }
    if (updateData.endTime) {
      updateData.endTime = new Date(updateData.endTime)
    }

    const reservation = await ReservationService.updateReservation(id, updateData)

    return res.status(200).json({
      success: true,
      message: 'Reserva actualizada exitosamente',
      data: reservation
    })
  })

  // Confirmar reserva
  static confirmReservation = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const reservation = await ReservationService.confirmReservation(id)

    return res.status(200).json({
      success: true,
      message: 'Reserva confirmada exitosamente',
      data: reservation
    })
  })

  // Cancelar reserva
  static cancelReservation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const userId = req.user!.id

    const reservation = await ReservationService.cancelReservation(id, userId)

    return res.status(200).json({
      success: true,
      message: 'Reserva cancelada exitosamente',
      data: reservation
    })
  })

  // Obtener estadísticas de reservas
  static getReservationStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await ReservationService.getReservationStats()

    return res.status(200).json({
      success: true,
      data: stats
    })
  })

  // Verificar disponibilidad
  static checkAvailability = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params
    const { startTime, endTime } = req.query

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren startTime y endTime'
      })
    }

    const availability = await ReservationService.checkAvailability(
      classId,
      new Date(startTime as string),
      new Date(endTime as string)
    )

    return res.status(200).json({
      success: true,
      data: availability
    })
  })
} 