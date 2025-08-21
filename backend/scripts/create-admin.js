const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createFirstAdmin() {
  try {
    console.log('🔧 Creando primer usuario administrador...');
    
    // Verificar si ya existe un administrador
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (existingAdmin) {
      console.log('⚠️  Ya existe un usuario administrador:', existingAdmin.email);
      return;
    }

    // Crear el primer administrador
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash('admin123', saltRounds);

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@bnkr.com',
        passwordHash,
        name: 'Administrador BNKR',
        role: 'ADMIN',
        phone: '+1234567890',
        isActive: true,
        dateOfBirth: new Date('1990-01-01'),
        address: 'Dirección del administrador',
        emergencyContact: 'Contacto de emergencia',
        emergencyPhone: '+1234567890'
      }
    });

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log('   📧 Email:', adminUser.email);
    console.log('   🔑 Contraseña: admin123');
    console.log('   👤 Nombre:', adminUser.name);
    console.log('   🎭 Rol:', adminUser.role);
    console.log('   🆔 ID:', adminUser.id);
    
    console.log('\n🚀 Ahora puedes iniciar sesión con:');
    console.log('   Email: admin@bnkr.com');
    console.log('   Contraseña: admin123');

  } catch (error) {
    console.error('❌ Error creando administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
createFirstAdmin();
