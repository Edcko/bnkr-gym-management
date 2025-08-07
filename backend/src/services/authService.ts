import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { LoginRequest, RegisterRequest, UserPayload } from '../types';
import { sendEmail, emailTemplates } from '../config/email';

export class AuthService {
  static async register(userData: RegisterRequest) {
    const { email, password, name, role = 'CLIENT', ...otherData } = userData;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        ...otherData
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        emergencyContact: true,
        emergencyPhone: true,
        isActive: true,
        createdAt: true
      }
    });

    // Enviar email de bienvenida (opcional)
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendEmail(
          user.email,
          '¡Bienvenido a BNKR!',
          emailTemplates.welcomeEmail(user.name)
        );
      } catch (error) {
        console.error('Error enviando email de bienvenida:', error);
        // No fallar el registro si el email falla
      }
    }

    // Generar token JWT
    const token = this.generateToken(user);

    return {
      user,
      token
    };
  }

  static async login(credentials: LoginRequest) {
    const { email, password } = credentials;

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new Error('Tu cuenta ha sido desactivada');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token JWT
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    // Retornar datos del usuario (sin passwordHash)
    const { passwordHash, ...userData } = user;

    return {
      user: userData,
      token
    };
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new Error('La contraseña actual es incorrecta');
    }

    // Hash de la nueva contraseña
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  static async resetPassword(email: string) {
    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('No se encontró una cuenta con este email');
    }

    // Generar token temporal para reset de contraseña
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Enviar email con link de reset
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const resetEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Restablecer Contraseña - BNKR</h2>
        <p>Hola ${user.name},</p>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
          Restablecer Contraseña
        </a>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
        <p>Equipo BNKR</p>
      </div>
    `;

    await sendEmail(
      user.email,
      'Restablecer Contraseña - BNKR',
      resetEmailHtml
    );

    return { message: 'Se ha enviado un email con instrucciones para restablecer tu contraseña' };
  }

  static async confirmResetPassword(token: string, newPassword: string) {
    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      if (decoded.type !== 'password_reset') {
        throw new Error('Token inválido');
      }

      // Hash de la nueva contraseña
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { passwordHash: newPasswordHash }
      });

      return { message: 'Contraseña restablecida exitosamente' };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token inválido o expirado');
      }
      throw error;
    }
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        emergencyContact: true,
        emergencyPhone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }

  static async updateProfile(userId: string, updateData: Partial<RegisterRequest>) {
    const { password, email, ...safeUpdateData } = updateData;

    // No permitir cambiar email o contraseña desde aquí
    if (email) {
      throw new Error('No se puede cambiar el email desde esta función');
    }

    if (password) {
      throw new Error('No se puede cambiar la contraseña desde esta función');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: safeUpdateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        emergencyContact: true,
        emergencyPhone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return user;
  }

  private static generateToken(user: UserPayload): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      } as any
    );
  }
} 