const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugLogin() {
  try {
    console.log('🔍 Debuggeando problema de login...');
    
    // Buscar el usuario administrador
    const user = await prisma.user.findUnique({
      where: { email: 'admin@bnkr.com' }
    });

    if (!user) {
      console.log('❌ Usuario admin@bnkr.com no encontrado');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('   📧 Email:', user.email);
    console.log('   👤 Nombre:', user.name);
    console.log('   🎭 Rol:', user.role);
    console.log('   🆔 ID:', user.id);
    console.log('   🔒 Password Hash:', user.passwordHash.substring(0, 20) + '...');
    console.log('   ✅ Activo:', user.isActive);

    // Probar la contraseña
    const testPassword = 'admin123';
    console.log('\n🔑 Probando contraseña:', testPassword);
    
    const isPasswordValid = await bcrypt.compare(testPassword, user.passwordHash);
    console.log('   🔐 Contraseña válida:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('\n🔄 Generando nuevo hash para admin123...');
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(testPassword, saltRounds);
      
      console.log('   📝 Hash anterior:', user.passwordHash.substring(0, 20) + '...');
      console.log('   📝 Hash nuevo:', newPasswordHash.substring(0, 20) + '...');
      
      // Actualizar la contraseña
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash }
      });
      
      console.log('✅ Contraseña actualizada exitosamente');
      console.log('🚀 Ahora puedes hacer login con:');
      console.log('   Email: admin@bnkr.com');
      console.log('   Contraseña: admin123');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
debugLogin();

