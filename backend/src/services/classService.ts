import { prisma } from '../config/database';
import { CreateClassRequest, UpdateClassRequest, SearchParams } from '../types';

export class ClassService {
  static async createClass(classData: CreateClassRequest) {
    // Verificar que el instructor existe y tiene el rol correcto
    const instructor = await prisma.user.findFirst({
      where: {
        id: classData.instructorId,
        role: 'INSTRUCTOR'
      }
    });

    if (!instructor) {
      throw new Error('El instructor especificado no existe o no tiene permisos');
    }

    // Verificar que el instructor no tenga clases solapadas
    const hasOverlap = await this.checkInstructorOverlap(
      classData.instructorId,
      new Date(),
      new Date(Date.now() + classData.duration * 60 * 1000)
    );

    if (hasOverlap) {
      throw new Error('El instructor ya tiene una clase programada en este horario');
    }

    const newClass = await prisma.class.create({
      data: {
        name: classData.name,
        description: classData.description,
        duration: classData.duration,
        maxCapacity: classData.maxCapacity,
        price: classData.price,
        instructorId: classData.instructorId
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return newClass;
  }

  static async getAllClasses(params: SearchParams = {}) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as any } },
          { description: { contains: search, mode: 'insensitive' as any } }
        ]
      })
    };

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              reservations: {
                where: {
                  status: 'CONFIRMED'
                }
              }
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.class.count({ where })
    ]);

    return {
      classes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getClassById(id: string) {
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        reservations: {
          where: {
            status: 'CONFIRMED'
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
        },
        schedule: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' }
        }
      }
    });

    if (!classData) {
      throw new Error('Clase no encontrada');
    }

    return classData;
  }

  static async updateClass(id: string, updateData: UpdateClassRequest) {
    // Verificar que la clase existe
    const existingClass = await prisma.class.findUnique({
      where: { id }
    });

    if (!existingClass) {
      throw new Error('Clase no encontrada');
    }

    // Si se está cambiando el instructor, verificar que no haya solapamientos
    if ((updateData as any).instructorId && (updateData as any).instructorId !== existingClass.instructorId) {
      const instructor = await prisma.user.findFirst({
        where: {
          id: (updateData as any).instructorId,
          role: 'INSTRUCTOR'
        }
      });

      if (!instructor) {
        throw new Error('El instructor especificado no existe o no tiene permisos');
      }

      // Verificar solapamientos para el nuevo instructor
      const hasOverlap = await this.checkInstructorOverlap(
        (updateData as any).instructorId,
        new Date(),
        new Date(Date.now() + (updateData.duration || existingClass.duration) * 60 * 1000)
      );

      if (hasOverlap) {
        throw new Error('El instructor ya tiene una clase programada en este horario');
      }
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: updateData,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return updatedClass;
  }

  static async deleteClass(id: string) {
    // Verificar que la clase existe
    const existingClass = await prisma.class.findUnique({
      where: { id },
      include: {
        reservations: {
          where: {
            status: 'CONFIRMED'
          }
        }
      }
    });

    if (!existingClass) {
      throw new Error('Clase no encontrada');
    }

    // Verificar si hay reservas confirmadas
    if (existingClass.reservations.length > 0) {
      throw new Error('No se puede eliminar una clase que tiene reservas confirmadas');
    }

    // Soft delete - marcar como inactiva
    await prisma.class.update({
      where: { id },
      data: { isActive: false }
    });

    return { message: 'Clase eliminada exitosamente' };
  }

  static async getClassesByInstructor(instructorId: string, params: SearchParams = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where = {
      instructorId,
      isActive: true
    };

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        include: {
          _count: {
            select: {
              reservations: {
                where: {
                  status: 'CONFIRMED'
                }
              }
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.class.count({ where })
    ]);

    return {
      classes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getAvailableClasses(params: SearchParams = {}) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as any } },
          { description: { contains: search, mode: 'insensitive' as any } }
        ]
      })
    };

    const classes = await prisma.class.findMany({
      where,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            reservations: {
              where: {
                status: 'CONFIRMED'
              }
            }
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit
    });

    // Filtrar clases con cupos disponibles
    const availableClasses = classes.filter((classData: any) => {
      const confirmedReservations = classData._count.reservations;
      return confirmedReservations < classData.maxCapacity;
    });

    return {
      classes: availableClasses,
      pagination: {
        page,
        limit,
        total: availableClasses.length,
        pages: Math.ceil(availableClasses.length / limit)
      }
    };
  }

  static async getClassSchedule(classId: string) {
    const schedule = await prisma.classSchedule.findMany({
      where: {
        classId,
        isActive: true
      },
      orderBy: { dayOfWeek: 'asc' }
    });

    return schedule;
  }

  static async createClassSchedule(classId: string, scheduleData: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>) {
    // Verificar que la clase existe
    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    });

    if (!existingClass) {
      throw new Error('Clase no encontrada');
    }

    // Crear horarios
    const schedules = await Promise.all(
      scheduleData.map(schedule => 
        prisma.classSchedule.create({
          data: {
            classId,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime
          }
        })
      )
    );

    return schedules;
  }

  static async updateClassSchedule(scheduleId: string, updateData: {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    isActive?: boolean;
  }) {
    const schedule = await prisma.classSchedule.update({
      where: { id: scheduleId },
      data: updateData
    });

    return schedule;
  }

  static async deleteClassSchedule(scheduleId: string) {
    await prisma.classSchedule.delete({
      where: { id: scheduleId }
    });

    return { message: 'Horario eliminado exitosamente' };
  }

  private static async checkInstructorOverlap(
    instructorId: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    const overlappingClasses = await prisma.class.findMany({
      where: {
        instructorId,
        isActive: true,
        // Aquí podrías agregar lógica más compleja para verificar solapamientos
        // Por ahora, solo verificamos que no haya clases en el mismo día
        createdAt: {
          gte: startTime,
          lte: endTime
        }
      }
    });

    return overlappingClasses.length > 0;
  }

  static async getClassStats(classId: string) {
    const [totalReservations, confirmedReservations, cancelledReservations] = await Promise.all([
      prisma.reservation.count({
        where: { classId }
      }),
      prisma.reservation.count({
        where: { 
          classId,
          status: 'CONFIRMED'
        }
      }),
      prisma.reservation.count({
        where: { 
          classId,
          status: 'CANCELLED'
        }
      })
    ]);

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      select: { maxCapacity: true }
    });

    const utilizationRate = classData ? (confirmedReservations / classData.maxCapacity) * 100 : 0;

    return {
      totalReservations,
      confirmedReservations,
      cancelledReservations,
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      availableSpots: classData ? classData.maxCapacity - confirmedReservations : 0
    };
  }
} 