import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/payments - Obtener todos los pagos
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, method, userId } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    // Construir filtros
    const where: any = {};
    
    if (status) where.status = status;
    if (method) where.method = method;
    if (userId) where.userId = userId;
    
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          membership: {
            select: {
              id: true,
              type: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.payment.count({ where })
    ]);
    
    const totalPages = Math.ceil(total / Number(limit));
    
    res.json({
      success: true,
      data: payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// GET /api/payments/stats - Obtener estadísticas de pagos
export const getPaymentStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }
    
    const [
      totalPayments,
      totalRevenue,
      pendingPayments,
      completedPayments,
      failedPayments,
      monthlyRevenue
    ] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.payment.count({ where: { ...where, status: 'PENDING' } }),
      prisma.payment.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.payment.count({ where: { ...where, status: 'FAILED' } }),
      prisma.payment.groupBy({
        by: ['createdAt'],
        where: { ...where, status: 'COMPLETED' },
        _sum: { amount: true }
      })
    ]);
    
    res.json({
      success: true,
      data: {
        totalPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingPayments,
        completedPayments,
        failedPayments,
        successRate: totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// GET /api/payments/:id - Obtener pago por ID
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        membership: {
          select: {
            id: true,
            type: true,
            price: true
          }
        }
      }
    });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    
    return res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error obteniendo pago:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// POST /api/payments - Crear nuevo pago
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { userId, membershipId, amount, method, status = 'PENDING' } = req.body;
    
    // Validar datos requeridos
    if (!userId || !membershipId || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }
    
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar que la membresía existe
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId }
    });
    
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membresía no encontrada'
      });
    }
    
    const payment = await prisma.payment.create({
      data: {
        userId,
        membershipId,
        amount: Number(amount),
        description: `Pago por ${method}`,
        status
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        membership: {
          select: {
            id: true,
            type: true
          }
        }
      }
    });
    
    return res.status(201).json({
      success: true,
      data: payment,
      message: 'Pago creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando pago:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// PUT /api/payments/:id - Actualizar pago existente
export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, amount, description } = req.body;
    
    // Verificar que el pago existe
    const existingPayment = await prisma.payment.findUnique({
      where: { id }
    });
    
    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(amount && { amount: Number(amount) }),
        ...(description && { description })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        membership: {
          select: {
            id: true,
            type: true
          }
        }
      }
    });
    
    return res.json({
      success: true,
      data: payment,
      message: 'Pago actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando pago:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// DELETE /api/payments/:id - Eliminar pago
export const deletePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar que el pago existe
    const existingPayment = await prisma.payment.findUnique({
      where: { id }
    });
    
    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    
    await prisma.payment.delete({
      where: { id }
    });
    
    return res.json({
      success: true,
      message: 'Pago eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando pago:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
