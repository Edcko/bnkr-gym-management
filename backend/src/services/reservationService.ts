import { PrismaClient, Reservation, ReservationStatus, Class, User } from '@prisma/client'

const prisma = new PrismaClient()

export class ReservationService {
  // Crear una nueva reserva
  static async createReservation(data: {
    userId: string
    classId: string
    instructorId: string
    startTime: Date
    endTime: Date
    notes?: string
  }): Promise<Reservation> {
    // Verificar que la clase existe y está activa
    const classExists = await prisma.class.findUnique({
      where: { id: data.classId, isActive: true }
    })

    if (!classExists) {
      throw new Error('Clase no encontrada o inactiva')
    }

    // Verificar que el instructor existe
    const instructorExists = await prisma.user.findUnique({
      where: { id: data.instructorId, isActive: true }
    })

    if (!instructorExists) {
      throw new Error('Instructor no encontrado')
    }

    // Verificar que no hay conflicto de horarios
    const conflictingReservation = await prisma.reservation.findFirst({
      where: {
        userId: data.userId,
        status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
        OR: [
          {
            startTime: { lt: data.endTime },
            endTime: { gt: data.startTime }
          }
        ]
      }
    })

    if (conflictingReservation) {
      throw new Error('Ya tienes una reserva en este horario')
    }

    // Verificar capacidad de la clase
    const currentReservations = await prisma.reservation.count({
      where: {
        classId: data.classId,
        status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
        startTime: { gte: data.startTime },
        endTime: { lte: data.endTime }
      }
    })

    if (currentReservations >= classExists.maxCapacity) {
      throw new Error('La clase está llena')
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: data.userId,
        classId: data.classId,
        instructorId: data.instructorId,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
        status: ReservationStatus.PENDING
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true
          }
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return reservation
  }

  // Obtener reserva por ID
  static async getReservationById(id: string): Promise<Reservation | null> {
    return await prisma.reservation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true
          }
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  // Obtener reservas de un usuario
  static async getUserReservations(userId: string, status?: ReservationStatus): Promise<Reservation[]> {
    const where: any = { userId }
    
    if (status) {
      where.status = status
    }

    return await prisma.reservation.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true
          }
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    })
  }

  // Obtener reservas de una clase
  static async getClassReservations(classId: string, date?: Date): Promise<Reservation[]> {
    const where: any = { classId }
    
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      where.startTime = {
        gte: startOfDay,
        lte: endOfDay
      }
    }

    return await prisma.reservation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    })
  }

  // Obtener reservas de un instructor
  static async getInstructorReservations(instructorId: string, date?: Date): Promise<Reservation[]> {
    const where: any = { instructorId }
    
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      where.startTime = {
        gte: startOfDay,
        lte: endOfDay
      }
    }

    return await prisma.reservation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    })
  }

  // Obtener todas las reservas (admin)
  static async getAllReservations(page: number = 1, limit: number = 10, status?: ReservationStatus): Promise<{
    reservations: Reservation[]
    total: number
    totalPages: number
  }> {
    const skip = (page - 1) * limit
    const where: any = {}
    
    if (status) {
      where.status = status
    }

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          class: {
            select: {
              id: true,
              name: true,
              description: true,
              duration: true,
              price: true
            }
          },
          instructor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { startTime: 'asc' }
      }),
      prisma.reservation.count({ where })
    ])

    return {
      reservations,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }

  // Actualizar reserva
  static async updateReservation(id: string, data: {
    startTime?: Date
    endTime?: Date
    status?: ReservationStatus
    notes?: string
  }): Promise<Reservation> {
    return await prisma.reservation.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true
          }
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  // Confirmar reserva
  static async confirmReservation(id: string): Promise<Reservation> {
    return await prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CONFIRMED },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true
          }
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  // Cancelar reserva
  static async cancelReservation(id: string, userId?: string): Promise<Reservation> {
    const where: any = { id }
    
    // Si se proporciona userId, verificar que la reserva pertenece al usuario
    if (userId) {
      where.userId = userId
    }

    return await prisma.reservation.update({
      where,
      data: { status: ReservationStatus.CANCELLED },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true
          }
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  // Obtener próximas reservas de un usuario
  static async getUpcomingReservations(userId: string): Promise<Reservation[]> {
    return await prisma.reservation.findMany({
      where: {
        userId,
        status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
        startTime: { gte: new Date() }
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true
          }
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    })
  }

  // Obtener reservas pasadas de un usuario
  static async getPastReservations(userId: string): Promise<Reservation[]> {
    return await prisma.reservation.findMany({
      where: {
        userId,
        endTime: { lt: new Date() }
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true
          }
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { startTime: 'desc' }
    })
  }

  // Obtener estadísticas de reservas
  static async getReservationStats(): Promise<{
    total: number
    pending: number
    confirmed: number
    cancelled: number
    today: number
    thisWeek: number
    thisMonth: number
  }> {
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      total,
      pending,
      confirmed,
      cancelled,
      today,
      thisWeek,
      thisMonth
    ] = await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: ReservationStatus.PENDING } }),
      prisma.reservation.count({ where: { status: ReservationStatus.CONFIRMED } }),
      prisma.reservation.count({ where: { status: ReservationStatus.CANCELLED } }),
      prisma.reservation.count({
        where: {
          startTime: { gte: startOfDay }
        }
      }),
      prisma.reservation.count({
        where: {
          startTime: { gte: startOfWeek }
        }
      }),
      prisma.reservation.count({
        where: {
          startTime: { gte: startOfMonth }
        }
      })
    ])

    return {
      total,
      pending,
      confirmed,
      cancelled,
      today,
      thisWeek,
      thisMonth
    }
  }

  // Verificar disponibilidad de horario
  static async checkAvailability(classId: string, startTime: Date, endTime: Date): Promise<{
    available: boolean
    currentReservations: number
    maxCapacity: number
  }> {
    const classInfo = await prisma.class.findUnique({
      where: { id: classId }
    })

    if (!classInfo) {
      throw new Error('Clase no encontrada')
    }

    const currentReservations = await prisma.reservation.count({
      where: {
        classId,
        status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
        startTime: { lt: endTime },
        endTime: { gt: startTime }
      }
    })

    return {
      available: currentReservations < classInfo.maxCapacity,
      currentReservations,
      maxCapacity: classInfo.maxCapacity
    }
  }
}