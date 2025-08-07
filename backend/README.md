# BNKR Gym Management - Backend

Backend API para el sistema de gestión del gym BNKR, construido con Node.js, TypeScript, Express y Prisma.

## 🚀 Características

- **Autenticación JWT** con bcrypt para hash de contraseñas
- **Autorización basada en roles** (Admin, Instructor, Cliente)
- **Validación de datos** con express-validator
- **Documentación automática** con Swagger/OpenAPI
- **Chat en tiempo real** con Socket.IO
- **Notificaciones por email** con Nodemailer
- **Rate limiting** para protección contra ataques
- **Logging y manejo de errores** centralizado
- **Base de datos PostgreSQL** con Prisma ORM

## 📋 Prerrequisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   cd backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   ```
   
   Editar `.env` con tus configuraciones:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/bnkr_gym?schema=public"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_EXPIRES_IN="24h"
   
   # Server
   PORT=3000
   NODE_ENV="development"
   
   # Email
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT=587
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"
   EMAIL_FROM="BNKR Gym <noreply@bnkrgym.com>"
   ```

4. **Configurar la base de datos**
   ```bash
   # Generar el cliente de Prisma
   npm run prisma:generate
   
   # Ejecutar migraciones
   npm run prisma:migrate
   
   # (Opcional) Poblar con datos de ejemplo
   npm run db:seed
   ```

5. **Iniciar el servidor**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm run build
   npm start
   ```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/reset-password` - Solicitar reset de contraseña
- `POST /api/auth/confirm-reset-password` - Confirmar reset de contraseña
- `GET /api/auth/profile` - Obtener perfil del usuario
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/change-password` - Cambiar contraseña

### Clases
- `GET /api/classes` - Obtener todas las clases
- `GET /api/classes/available` - Obtener clases con cupos disponibles
- `GET /api/classes/:id` - Obtener clase por ID
- `POST /api/classes` - Crear nueva clase (Instructor/Admin)
- `PUT /api/classes/:id` - Actualizar clase (Instructor/Admin)
- `DELETE /api/classes/:id` - Eliminar clase (Admin)
- `GET /api/classes/:classId/schedule` - Obtener horarios de una clase
- `POST /api/classes/:classId/schedule` - Crear horarios (Instructor/Admin)
- `GET /api/classes/:classId/stats` - Obtener estadísticas de una clase

### Documentación
- `GET /api-docs` - Documentación Swagger UI
- `GET /health` - Health check del servidor

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor en modo desarrollo
npm run build        # Compilar TypeScript
npm start           # Iniciar servidor en producción

# Base de datos
npm run prisma:generate    # Generar cliente Prisma
npm run prisma:migrate     # Ejecutar migraciones
npm run prisma:studio      # Abrir Prisma Studio
npm run db:seed           # Poblar base de datos

# Testing
npm test              # Ejecutar tests
npm run test:watch    # Ejecutar tests en modo watch
npm run test:coverage # Ejecutar tests con coverage
```

## 🏗️ Estructura del Proyecto

```
src/
├── config/          # Configuraciones (DB, Email, etc.)
├── controllers/     # Controladores de la API
├── middlewares/     # Middlewares personalizados
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
├── types/           # Tipos TypeScript
├── utils/           # Utilidades y helpers
└── index.ts         # Punto de entrada de la aplicación
```

## 🔐 Roles y Permisos

### Admin
- Acceso completo a todas las funcionalidades
- Gestión de usuarios, clases, reservas
- Reportes y estadísticas
- Configuración del sistema

### Instructor
- Gestión de sus propias clases
- Ver reservas de sus clases
- Chat con estudiantes
- Reportes de asistencia

### Cliente
- Ver clases disponibles
- Hacer reservas
- Ver sus reservas
- Chat con instructores
- Acceso a FAQ

## 📧 Notificaciones por Email

El sistema envía automáticamente emails para:
- Confirmación de registro
- Confirmación de reservas
- Cancelación de reservas
- Recordatorios 24h antes de clases
- Reset de contraseñas
- Alertas de inventario bajo

## 🗄️ Base de Datos

### Entidades Principales
- **User**: Usuarios del sistema (Admin, Instructor, Cliente)
- **Class**: Clases de Cardio-Boxing
- **Reservation**: Reservas de clases
- **Membership**: Membresías de usuarios
- **Payment**: Pagos y facturación
- **InventoryItem**: Items del inventario
- **Message**: Mensajes del chat interno
- **FAQ**: Preguntas frecuentes

## 🔒 Seguridad

- **Helmet**: Headers de seguridad
- **CORS**: Configuración de origen cruzado
- **Rate Limiting**: Protección contra ataques DDoS
- **JWT**: Autenticación stateless
- **bcrypt**: Hash seguro de contraseñas
- **Validación**: Sanitización de datos de entrada

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Generar reporte de coverage
npm run test:coverage
```

## 📊 Monitoreo

- **Health Check**: `/health`
- **Logs**: Console y archivos de log
- **Métricas**: Endpoints de estadísticas
- **Errores**: Manejo centralizado con stack traces

## 🚀 Despliegue

### Docker
```bash
# Construir imagen
docker build -t bnkr-backend .

# Ejecutar contenedor
docker run -p 3000:3000 bnkr-backend
```

### Variables de Entorno de Producción
```env
NODE_ENV=production
DATABASE_URL=your_production_db_url
JWT_SECRET=your_production_jwt_secret
EMAIL_HOST=your_smtp_host
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

- Email: support@bnkrgym.com
- Documentación: `/api-docs`
- Issues: GitHub Issues 