# 🏋️ BNKR Gym Management System

Sistema completo de gestión para gimnasio BNKR con frontend en Vue.js y backend en Node.js/TypeScript.

## 🚀 Características

### 👥 Gestión de Usuarios
- Registro y autenticación de usuarios
- Roles: Cliente, Instructor, Administrador
- Perfiles de usuario completos
- Gestión de estados (activo/inactivo)

### 📅 Gestión de Clases
- Creación y gestión de clases
- Asignación de instructores
- Horarios y capacidad
- Estados de clases

### 🎫 Gestión de Membresías
- Diferentes tipos de membresía
- Renovación automática
- Historial de pagos
- Estados de membresía

### 📋 Sistema de Reservas
- Reserva de clases
- Confirmación y cancelación
- Historial de reservas
- Verificación de disponibilidad

### 💳 Sistema de Pagos
- Integración con Stripe
- Procesamiento de pagos
- Historial de transacciones
- Reembolsos

### 📊 Panel de Administración
- Dashboard con estadísticas
- Gestión de usuarios
- Reportes y analytics
- Configuración del sistema

## 🛠️ Tecnologías

### Frontend
- **Vue.js 3** - Framework de JavaScript
- **Vite** - Build tool
- **Vuetify** - UI Framework
- **Pinia** - State management
- **Vue Router** - Routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime de JavaScript
- **TypeScript** - Lenguaje de programación
- **Express.js** - Framework web
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas

### DevOps
- **PM2** - Gestión de procesos
- **Nginx** - Servidor web y proxy reverso
- **Docker** - Containerización (opcional)

## 📦 Instalación Local

### Prerrequisitos
- Node.js 18.x o superior
- PostgreSQL 15.x o superior
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/bnkr-gym-management.git
cd bnkr-gym-management
```

2. **Instalar dependencias**
```bash
npm run install:all
```

3. **Configurar base de datos**
```bash
# Crear base de datos PostgreSQL
createdb bnkr_gym

# Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus configuraciones
```

4. **Ejecutar migraciones**
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

5. **Iniciar en desarrollo**
```bash
npm run dev
```

## 🚀 Despliegue en Producción

### Opción 1: Despliegue Directo en Servidor

1. **Crear Droplet en Digital Ocean**
   - Ubuntu 22.04 LTS
   - 1GB RAM, 1 vCPU (mínimo)

2. **Conectar al servidor**
```bash
ssh root@tu-ip-del-servidor
```

3. **Clonar y configurar**
```bash
git clone https://github.com/tu-usuario/bnkr-gym-management.git
cd bnkr-gym-management
chmod +x deploy-server.sh setup-project.sh
./deploy-server.sh
./setup-project.sh
```

4. **Configurar variables de entorno**
```bash
nano backend/.env
nano frontend/.env
```

5. **Reiniciar servicios**
```bash
pm2 restart bnkr-backend
sudo systemctl reload nginx
```

### Opción 2: Docker (Recomendado)

1. **Preparar build**
```bash
./build-prod.sh
```

2. **Configurar variables**
```bash
cp env.production.example .env.production
# Editar .env.production
```

3. **Desplegar**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 Estructura del Proyecto

```
bnkr-gym-management/
├── backend/                 # Backend Node.js/TypeScript
│   ├── src/
│   │   ├── controllers/     # Controladores de la API
│   │   ├── services/        # Lógica de negocio
│   │   ├── routes/          # Rutas de la API
│   │   ├── middlewares/     # Middlewares
│   │   └── index.ts         # Punto de entrada
│   ├── prisma/              # Configuración de base de datos
│   └── package.json
├── frontend/                # Frontend Vue.js
│   ├── src/
│   │   ├── components/      # Componentes Vue
│   │   ├── views/           # Páginas
│   │   ├── stores/          # Stores de Pinia
│   │   ├── router/          # Configuración de rutas
│   │   └── main.ts          # Punto de entrada
│   └── package.json
├── scripts/                 # Scripts de despliegue
├── docs/                    # Documentación
└── README.md
```

## 🔧 Configuración

### Variables de Entorno Backend (.env)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/bnkr_gym
JWT_SECRET=tu-jwt-secret-super-seguro
CORS_ORIGIN=http://tu-dominio.com
```

### Variables de Entorno Frontend (.env)
```env
VITE_API_URL=http://tu-dominio.com:3001
```

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Clases
- `GET /api/classes` - Listar clases
- `POST /api/classes` - Crear clase
- `GET /api/classes/:id` - Obtener clase
- `PUT /api/classes/:id` - Actualizar clase
- `DELETE /api/classes/:id` - Eliminar clase

### Membresías
- `GET /api/memberships` - Listar membresías
- `POST /api/memberships` - Crear membresía
- `GET /api/memberships/:id` - Obtener membresía
- `PUT /api/memberships/:id` - Actualizar membresía

### Reservas
- `GET /api/reservations` - Listar reservas
- `POST /api/reservations` - Crear reserva
- `GET /api/reservations/:id` - Obtener reserva
- `PUT /api/reservations/:id` - Actualizar reserva

## 🛡️ Seguridad

- Autenticación JWT
- Encriptación de contraseñas con bcrypt
- Validación de entrada con express-validator
- CORS configurado
- Headers de seguridad en Nginx
- Rate limiting

## 📈 Monitoreo

### Logs
```bash
# Backend
pm2 logs bnkr-backend

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Estado de Servicios
```bash
# PM2
pm2 status

# Servicios del sistema
sudo systemctl status nginx
sudo systemctl status postgresql
```

## 🔄 Actualizaciones

### Despliegue Directo
```bash
git pull origin main
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 restart bnkr-backend
sudo systemctl reload nginx
```

### Docker
```bash
git pull origin main
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## 🆘 Solución de Problemas

### Backend no responde
```bash
pm2 status
pm2 logs bnkr-backend
pm2 restart bnkr-backend
```

### Frontend no carga
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Base de datos no conecta
```bash
sudo systemctl status postgresql
sudo -u postgres psql -c "\l"
```

## 📞 Soporte

Para soporte técnico o reportar bugs:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para BNKR Gym** 