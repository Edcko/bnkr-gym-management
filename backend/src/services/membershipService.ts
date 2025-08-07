import { PrismaClient, Membership, MembershipType, MembershipStatus, User } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

export class MembershipService {
  // Crear una nueva membresía
  static async createMembership(data: {
    userId: string
    type: MembershipType
    startDate: Date
    endDate: Date
    price: number
  }): Promise<Membership> {
    const membership = await prisma.membership.create({
      data: {
        userId: data.userId,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        price: new Decimal(data.price),
        status: MembershipStatus.ACTIVE
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return membership
  }

  // Obtener membresía por ID
  static async getMembershipById(id: string): Promise<Membership | null> {
    return await prisma.membership.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  // Obtener membresía activa de un usuario
  static async getActiveMembership(userId: string): Promise<Membership | null> {
    return await prisma.membership.findFirst({
      where: {
        userId,
        status: MembershipStatus.ACTIVE,
        endDate: {
          gte: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Obtener todas las membresías de un usuario
  static async getUserMemberships(userId: string): Promise<Membership[]> {
    return await prisma.membership.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Obtener todas las membresías (para admin)
  static async getAllMemberships(page: number = 1, limit: number = 10): Promise<{
    memberships: Membership[]
    total: number
    totalPages: number
  }> {
    const skip = (page - 1) * limit

    const [memberships, total] = await Promise.all([
      prisma.membership.findMany({
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
          payments: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.membership.count()
    ])

    return {
      memberships,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }

  // Actualizar membresía
  static async updateMembership(id: string, data: {
    type?: MembershipType
    startDate?: Date
    endDate?: Date
    status?: MembershipStatus
    price?: number
  }): Promise<Membership> {
    const updateData: any = { ...data }
    
    if (data.price !== undefined) {
      updateData.price = new Decimal(data.price)
    }

    return await prisma.membership.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  // Renovar membresía
  static async renewMembership(id: string, months: number = 1): Promise<Membership> {
    const membership = await prisma.membership.findUnique({
      where: { id }
    })

    if (!membership) {
      throw new Error('Membresía no encontrada')
    }

    const newEndDate = new Date(membership.endDate)
    newEndDate.setMonth(newEndDate.getMonth() + months)

    return await prisma.membership.update({
      where: { id },
      data: {
        endDate: newEndDate,
        status: MembershipStatus.ACTIVE
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  // Cambiar tipo de membresía
  static async changeMembershipType(id: string, newType: MembershipType): Promise<Membership> {
    const membership = await prisma.membership.findUnique({
      where: { id }
    })

    if (!membership) {
      throw new Error('Membresía no encontrada')
    }

    // Calcular nuevo precio basado en el tipo
    const prices = {
      BASIC: 49.99,
      PREMIUM: 89.99,
      UNLIMITED: 129.99
    }

    return await prisma.membership.update({
      where: { id },
      data: {
        type: newType,
        price: new Decimal(prices[newType])
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  // Cancelar membresía
  static async cancelMembership(id: string): Promise<Membership> {
    return await prisma.membership.update({
      where: { id },
      data: {
        status: MembershipStatus.CANCELLED,
        endDate: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  // Congelar membresía
  static async freezeMembership(id: string, freezeUntil: Date): Promise<Membership> {
    const membership = await prisma.membership.findUnique({
      where: { id }
    })

    if (!membership) {
      throw new Error('Membresía no encontrada')
    }

    // Extender la fecha de fin por el período de congelación
    const freezeDuration = freezeUntil.getTime() - new Date().getTime()
    const newEndDate = new Date(membership.endDate.getTime() + freezeDuration)

    return await prisma.membership.update({
      where: { id },
      data: {
        endDate: newEndDate
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  // Obtener estadísticas de membresías
  static async getMembershipStats(): Promise<{
    total: number
    active: number
    expired: number
    cancelled: number
    byType: Record<MembershipType, number>
    revenue: number
  }> {
    const [
      total,
      active,
      expired,
      cancelled,
      byType,
      revenue
    ] = await Promise.all([
      prisma.membership.count(),
      prisma.membership.count({
        where: {
          status: MembershipStatus.ACTIVE,
          endDate: { gte: new Date() }
        }
      }),
      prisma.membership.count({
        where: {
          status: MembershipStatus.ACTIVE,
          endDate: { lt: new Date() }
        }
      }),
      prisma.membership.count({
        where: { status: MembershipStatus.CANCELLED }
      }),
      prisma.membership.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      prisma.membership.aggregate({
        _sum: { price: true },
        where: { status: MembershipStatus.ACTIVE }
      })
    ])

    const byTypeMap = byType.reduce((acc, item) => {
      acc[item.type] = item._count.type
      return acc
    }, {} as Record<MembershipType, number>)

    return {
      total,
      active,
      expired,
      cancelled,
      byType: byTypeMap,
      revenue: revenue._sum.price?.toNumber() || 0
    }
  }

  // Verificar si un usuario tiene membresía activa
  static async hasActiveMembership(userId: string): Promise<boolean> {
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        status: MembershipStatus.ACTIVE,
        endDate: { gte: new Date() }
      }
    })

    return !!membership
  }

  // Obtener días restantes de membresía
  static async getRemainingDays(userId: string): Promise<number> {
    const membership = await this.getActiveMembership(userId)
    
    if (!membership) {
      return 0
    }

    const now = new Date()
    const endDate = membership.endDate
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return Math.max(0, diffDays)
  }

  // Procesar expiración automática de membresías
  static async processExpiredMemberships(): Promise<number> {
    const result = await prisma.membership.updateMany({
      where: {
        status: MembershipStatus.ACTIVE,
        endDate: { lt: new Date() }
      },
      data: {
        status: MembershipStatus.EXPIRED
      }
    })

    return result.count
  }
} 