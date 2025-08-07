import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpiar la base de datos
  console.log('🧹 Limpiando base de datos...')
  await prisma.reservation.deleteMany()
  await prisma.classSchedule.deleteMany()
  await prisma.class.deleteMany()
  await prisma.user.deleteMany()

  // Crear usuarios de prueba
  console.log('👥 Creando usuarios de prueba...')
  
  const saltRounds = 12
  const passwordHash = await bcrypt.hash('Password123', saltRounds)

  // Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin BNKR',
      email: 'admin@bnkr.com',
      passwordHash,
      role: UserRole.ADMIN,
      phone: '+1 (555) 123-4567',
      isActive: true
    }
  })

  // Instructores
  const instructor1 = await prisma.user.create({
    data: {
      name: 'Carlos Rodríguez',
      email: 'carlos@bnkr.com',
      passwordHash,
      role: UserRole.INSTRUCTOR,
      phone: '+1 (555) 234-5678',
      isActive: true
    }
  })

  const instructor2 = await prisma.user.create({
    data: {
      name: 'María García',
      email: 'maria@bnkr.com',
      passwordHash,
      role: UserRole.INSTRUCTOR,
      phone: '+1 (555) 345-6789',
      isActive: true
    }
  })

  const instructor3 = await prisma.user.create({
    data: {
      name: 'David Martínez',
      email: 'david@bnkr.com',
      passwordHash,
      role: UserRole.INSTRUCTOR,
      phone: '+1 (555) 456-7890',
      isActive: true
    }
  })

  // Clientes
  const client1 = await prisma.user.create({
    data: {
      name: 'Ana López',
      email: 'ana@example.com',
      passwordHash,
      role: UserRole.CLIENT,
      phone: '+1 (555) 567-8901',
      isActive: true
    }
  })

  const client2 = await prisma.user.create({
    data: {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      passwordHash,
      role: UserRole.CLIENT,
      phone: '+1 (555) 678-9012',
      isActive: true
    }
  })

  const client3 = await prisma.user.create({
    data: {
      name: 'Sofia Torres',
      email: 'sofia@example.com',
      passwordHash,
      role: UserRole.CLIENT,
      phone: '+1 (555) 789-0123',
      isActive: true
    }
  })

  // Crear clases
  console.log('🏋️ Creando clases de prueba...')

  const cardioBoxing = await prisma.class.create({
    data: {
      name: 'Cardio Boxing Intensivo',
      description: 'Sesión de alta intensidad que combina técnicas de boxeo con ejercicios cardiovasculares para quemar calorías y mejorar la resistencia.',
      duration: 60,
      maxCapacity: 20,
      price: 25.00,
      instructorId: instructor1.id,
      isActive: true
    }
  })

  const kickboxing = await prisma.class.create({
    data: {
      name: 'Kickboxing Avanzado',
      description: 'Clase avanzada que combina técnicas de boxeo y kickboxing para mejorar la fuerza, coordinación y resistencia.',
      duration: 75,
      maxCapacity: 15,
      price: 30.00,
      instructorId: instructor2.id,
      isActive: true
    }
  })

  const boxingBasics = await prisma.class.create({
    data: {
      name: 'Boxeo Básico',
      description: 'Clase para principiantes que enseña los fundamentos del boxeo, incluyendo postura, golpes básicos y movimientos defensivos.',
      duration: 45,
      maxCapacity: 25,
      price: 20.00,
      instructorId: instructor3.id,
      isActive: true
    }
  })

  const strengthTraining = await prisma.class.create({
    data: {
      name: 'Entrenamiento de Fuerza',
      description: 'Sesión enfocada en el desarrollo de fuerza muscular usando pesas y ejercicios funcionales.',
      duration: 60,
      maxCapacity: 18,
      price: 28.00,
      instructorId: instructor1.id,
      isActive: true
    }
  })

  const hiitCardio = await prisma.class.create({
    data: {
      name: 'HIIT Cardio',
      description: 'Entrenamiento de intervalos de alta intensidad diseñado para maximizar la quema de calorías y mejorar la condición cardiovascular.',
      duration: 45,
      maxCapacity: 22,
      price: 22.00,
      instructorId: instructor2.id,
      isActive: true
    }
  })

  // Crear horarios de clases
  console.log('📅 Creando horarios de clases...')

  // Cardio Boxing - Lunes, Miércoles, Viernes
  await prisma.classSchedule.createMany({
    data: [
      {
        classId: cardioBoxing.id,
        dayOfWeek: 1, // Lunes
        startTime: '06:00',
        endTime: '07:00',
        isActive: true
      },
      {
        classId: cardioBoxing.id,
        dayOfWeek: 3, // Miércoles
        startTime: '06:00',
        endTime: '07:00',
        isActive: true
      },
      {
        classId: cardioBoxing.id,
        dayOfWeek: 5, // Viernes
        startTime: '06:00',
        endTime: '07:00',
        isActive: true
      }
    ]
  })

  // Kickboxing - Martes, Jueves
  await prisma.classSchedule.createMany({
    data: [
      {
        classId: kickboxing.id,
        dayOfWeek: 2, // Martes
        startTime: '18:00',
        endTime: '19:15',
        isActive: true
      },
      {
        classId: kickboxing.id,
        dayOfWeek: 4, // Jueves
        startTime: '18:00',
        endTime: '19:15',
        isActive: true
      }
    ]
  })

  // Boxeo Básico - Lunes, Miércoles, Viernes
  await prisma.classSchedule.createMany({
    data: [
      {
        classId: boxingBasics.id,
        dayOfWeek: 1, // Lunes
        startTime: '19:00',
        endTime: '19:45',
        isActive: true
      },
      {
        classId: boxingBasics.id,
        dayOfWeek: 3, // Miércoles
        startTime: '19:00',
        endTime: '19:45',
        isActive: true
      },
      {
        classId: boxingBasics.id,
        dayOfWeek: 5, // Viernes
        startTime: '19:00',
        endTime: '19:45',
        isActive: true
      }
    ]
  })

  // Entrenamiento de Fuerza - Martes, Jueves
  await prisma.classSchedule.createMany({
    data: [
      {
        classId: strengthTraining.id,
        dayOfWeek: 2, // Martes
        startTime: '07:00',
        endTime: '08:00',
        isActive: true
      },
      {
        classId: strengthTraining.id,
        dayOfWeek: 4, // Jueves
        startTime: '07:00',
        endTime: '08:00',
        isActive: true
      }
    ]
  })

  // HIIT Cardio - Sábado
  await prisma.classSchedule.createMany({
    data: [
      {
        classId: hiitCardio.id,
        dayOfWeek: 6, // Sábado
        startTime: '09:00',
        endTime: '09:45',
        isActive: true
      }
    ]
  })

  // Crear algunas reservas de ejemplo
  console.log('📋 Creando reservas de ejemplo...')

  // Obtener la próxima fecha de lunes
  const today = new Date()
  const nextMonday = new Date(today)
  nextMonday.setDate(today.getDate() + (8 - today.getDay()) % 7)
  nextMonday.setHours(6, 0, 0, 0)

  // Reserva para Cardio Boxing
  await prisma.reservation.create({
    data: {
      userId: client1.id,
      classId: cardioBoxing.id,
      instructorId: instructor1.id,
      startTime: nextMonday,
      endTime: new Date(nextMonday.getTime() + 60 * 60 * 1000), // +1 hora
      status: 'CONFIRMED',
      notes: 'Primera clase de cardio boxing'
    }
  })

  // Reserva para Kickboxing
  const nextTuesday = new Date(nextMonday)
  nextTuesday.setDate(nextMonday.getDate() + 1)
  nextTuesday.setHours(18, 0, 0, 0)

  await prisma.reservation.create({
    data: {
      userId: client2.id,
      classId: kickboxing.id,
      instructorId: instructor2.id,
      startTime: nextTuesday,
      endTime: new Date(nextTuesday.getTime() + 75 * 60 * 1000), // +1.25 horas
      status: 'CONFIRMED',
      notes: 'Clase de kickboxing avanzado'
    }
  })

  // Reserva para Boxeo Básico
  await prisma.reservation.create({
    data: {
      userId: client3.id,
      classId: boxingBasics.id,
      instructorId: instructor3.id,
      startTime: nextMonday,
      endTime: new Date(nextMonday.getTime() + 45 * 60 * 1000), // +45 minutos
      status: 'PENDING',
      notes: 'Clase de boxeo para principiantes'
    }
  })

  console.log('✅ Seed completado exitosamente!')
  console.log('\n📊 Datos creados:')
  console.log(`- ${await prisma.user.count()} usuarios`)
  console.log(`- ${await prisma.class.count()} clases`)
  console.log(`- ${await prisma.classSchedule.count()} horarios`)
  console.log(`- ${await prisma.reservation.count()} reservas`)
  
  console.log('\n🔑 Credenciales de prueba:')
  console.log('Admin: admin@bnkr.com / Password123')
  console.log('Instructor: carlos@bnkr.com / Password123')
  console.log('Cliente: ana@example.com / Password123')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 