# 🚀 Guía de Despliegue - BNKR Gym Management

## 📋 Requisitos Previos

- Docker (versión 20.10 o superior)
- Docker Compose (versión 2.0 o superior)
- Git

## 🛠️ Instalación y Despliegue

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd bnkr-gym-management
```

### 2. Configurar Variables de Entorno

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Editar el archivo `.env` con las siguientes variables:
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://bnkr_user:bnkr_password@postgres:5432/bnkr_gym
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:80
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
```

Editar el archivo `.env` con las siguientes variables:
```env
VITE_API_URL=http://localhost:3001
```

### 3. Despliegue Automático

Ejecutar el script de despliegue:
```bash
./deploy.sh
```

### 4. Despliegue Manual

Si prefieres hacer el despliegue manualmente:

```bash
# Construir las imágenes
docker-compose build

# Iniciar los servicios
docker-compose up -d

# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy

# Generar cliente de Prisma
docker-compose exec backend npx prisma generate
```

## 🌐 Acceso a la Aplicación

Una vez desplegado, puedes acceder a:

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3001
- **Base de datos**: localhost:5432

## 📊 Monitoreo y Logs

### Ver logs de todos los servicios:
```bash
docker-compose logs -f
```

### Ver logs de un servicio específico:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Verificar estado de los servicios:
```bash
docker-compose ps
```

## 🔧 Comandos Útiles

### Reiniciar servicios:
```bash
docker-compose restart
```

### Detener todos los servicios:
```bash
docker-compose down
```

### Detener y eliminar volúmenes:
```bash
docker-compose down -v
```

### Actualizar la aplicación:
```bash
git pull
docker-compose build --no-cache
docker-compose up -d
```

## 🗄️ Base de Datos

### Acceder a la base de datos:
```bash
docker-compose exec postgres psql -U bnkr_user -d bnkr_gym
```

### Ejecutar migraciones:
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Generar cliente de Prisma:
```bash
docker-compose exec backend npx prisma generate
```

### Ver estado de las migraciones:
```bash
docker-compose exec backend npx prisma migrate status
```

## 🔒 Configuración de Seguridad

### Cambiar contraseñas por defecto:
1. Editar `docker-compose.yml`
2. Cambiar `POSTGRES_PASSWORD`
3. Actualizar `DATABASE_URL` en el backend
4. Reiniciar servicios

### Configurar SSL/HTTPS:
1. Crear certificados SSL
2. Colocarlos en `./nginx/ssl/`
3. Configurar nginx para HTTPS
4. Actualizar `CORS_ORIGIN` en el backend

## 🐛 Solución de Problemas

### El backend no responde:
```bash
# Verificar logs
docker-compose logs backend

# Verificar conectividad con la base de datos
docker-compose exec backend npx prisma db push

# Reiniciar el servicio
docker-compose restart backend
```

### El frontend no carga:
```bash
# Verificar logs
docker-compose logs frontend

# Verificar que el backend esté funcionando
curl http://localhost:3001/health

# Reiniciar el servicio
docker-compose restart frontend
```

### Problemas con la base de datos:
```bash
# Verificar logs
docker-compose logs postgres

# Reiniciar la base de datos
docker-compose restart postgres

# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy
```

## 📈 Escalabilidad

### Para producción con múltiples instancias:
1. Configurar un load balancer
2. Usar una base de datos externa
3. Configurar Redis para cache
4. Implementar monitoreo con Prometheus/Grafana

### Para desarrollo local:
```bash
# Usar puertos diferentes
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## 🔄 Actualizaciones

### Actualizar la aplicación:
```bash
# Obtener cambios
git pull origin main

# Reconstruir y reiniciar
docker-compose build --no-cache
docker-compose up -d

# Ejecutar migraciones si es necesario
docker-compose exec backend npx prisma migrate deploy
```

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. Verificar los logs: `docker-compose logs -f`
2. Verificar el estado de los servicios: `docker-compose ps`
3. Verificar la conectividad de red: `docker network ls`
4. Revisar la documentación de Docker y Docker Compose

---

**Nota**: Este es un despliegue de desarrollo. Para producción, asegúrate de:
- Cambiar todas las contraseñas por defecto
- Configurar SSL/HTTPS
- Implementar backup de la base de datos
- Configurar monitoreo y alertas
- Usar variables de entorno seguras 