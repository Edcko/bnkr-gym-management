import nodemailer from 'nodemailer';

export const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    
    console.log('Email enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
};

export const emailTemplates = {
  reservationConfirmation: (userName: string, className: string, startTime: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">¡Reserva Confirmada en BNKR!</h2>
      <p>Hola ${userName},</p>
      <p>Tu reserva ha sido confirmada exitosamente.</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Detalles de la Clase:</h3>
        <p><strong>Clase:</strong> ${className}</p>
        <p><strong>Fecha y Hora:</strong> ${startTime}</p>
      </div>
      <p>¡Nos vemos en el gym!</p>
      <p>Equipo BNKR</p>
    </div>
  `,
  
  reservationCancellation: (userName: string, className: string, startTime: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Reserva Cancelada - BNKR</h2>
      <p>Hola ${userName},</p>
      <p>Tu reserva ha sido cancelada exitosamente.</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Detalles de la Clase Cancelada:</h3>
        <p><strong>Clase:</strong> ${className}</p>
        <p><strong>Fecha y Hora:</strong> ${startTime}</p>
      </div>
      <p>Gracias por avisarnos con anticipación.</p>
      <p>Equipo BNKR</p>
    </div>
  `,
  
  reminder24h: (userName: string, className: string, startTime: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Recordatorio - Tu clase en BNKR mañana</h2>
      <p>Hola ${userName},</p>
      <p>Te recordamos que tienes una clase mañana.</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Detalles de la Clase:</h3>
        <p><strong>Clase:</strong> ${className}</p>
        <p><strong>Fecha y Hora:</strong> ${startTime}</p>
      </div>
      <p>¡No olvides traer tu energía y ganas de entrenar!</p>
      <p>Equipo BNKR</p>
    </div>
  `,
  
  lowInventoryAlert: (itemName: string, currentQuantity: number, threshold: number) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ff6b6b;">Alerta de Inventario - BNKR</h2>
      <p>Se ha detectado un nivel bajo de inventario.</p>
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3>Detalles del Item:</h3>
        <p><strong>Item:</strong> ${itemName}</p>
        <p><strong>Cantidad Actual:</strong> ${currentQuantity}</p>
        <p><strong>Umbral Mínimo:</strong> ${threshold}</p>
      </div>
      <p>Por favor, reabastece el inventario lo antes posible.</p>
      <p>Equipo BNKR</p>
    </div>
  `,
  
  welcomeEmail: (userName: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">¡Bienvenido a BNKR!</h2>
      <p>Hola ${userName},</p>
      <p>¡Gracias por unirte a nuestra comunidad de Cardio-Boxing!</p>
      <p>En BNKR encontrarás:</p>
      <ul>
        <li>Clases de alta intensidad</li>
        <li>Instructores certificados</li>
        <li>Comunidad motivadora</li>
        <li>Resultados garantizados</li>
      </ul>
      <p>¡Comienza tu transformación hoy mismo!</p>
      <p>Equipo BNKR</p>
    </div>
  `
}; 