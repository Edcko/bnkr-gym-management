# 🚀 Despliegue Directo en Servidor - BNKR Gym Management

## 📋 Requisitos del Servidor

- **Sistema Operativo**: Ubuntu 20.04 LTS o superior
- **RAM**: Mínimo 1GB (recomendado 2GB)
- **Almacenamiento**: Mínimo 10GB
- **CPU**: 1 vCPU mínimo

## 🛠️ Pasos de Despliegue

### Paso 1: Crear Droplet en Digital Ocean

1. Ir a [Digital Ocean Console](https://cloud.digitalocean.com/)
2. Crear nuevo Droplet
3. Configuración recomendada:
   - **Image**: Ubuntu 22.04 LTS
   - **Size**: Basic $6/mo (1GB RAM, 1 vCPU, 25GB SSD)
   - **Datacenter**: Cercano a tus usuarios
   - **Authentication**: SSH Key (recomendado)

### Paso 2: Conectar al Servidor

```bash
ssh root@tu-ip-del-servidor
```

### Paso 3: Preparar el Servidor

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/bnkr-gym-management.git
cd bnkr-gym-management

# Hacer ejecutables los scripts
chmod +x deploy-server.sh setup-project.sh

# Ejecutar script de preparación del servidor
./deploy-server.sh
```

### Paso 4: Configurar el Proyecto

```bash
# Ejecutar script de configuración del proyecto
./setup-project.sh
```

### Paso 5: Configurar Variables de Entorno

#### Backend (.env)
```bash
nano backend/.env
```

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://bnkr_user:bnkr_password@localhost:5432/bnkr_gym
JWT_SECRET=tu-jwt-secret-super-seguro-cambia-esto
CORS_ORIGIN=http://tu-ip-del-servidor
```

#### Frontend (.env)
```bash
nano frontend/.env
```

```env
VITE_API_URL=http://tu-ip-del-servidor:3001
```

### Paso 6: Reiniciar Servicios

```bash
# Reiniciar backend
pm2 restart bnkr-backend

# Reiniciar Nginx
sudo systemctl reload nginx
```

## 🔧 Configuración de Dominio (Opcional)

### Paso 1: Configurar DNS

1. Ir a tu proveedor de dominios
2. Crear registro A apuntando a tu IP del servidor
3. Esperar propagación (puede tomar hasta 24 horas)

### Paso 2: Configurar Nginx para el Dominio

```bash
sudo nano /etc/nginx/sites-available/bnkr-gym
```

Cambiar `server_name localhost;` por `server_name tu-dominio.com;`

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Paso 3: Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com

# Configurar renovación automática
sudo crontab -e
# Agregar línea: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoreo y Logs

### Ver Logs del Backend
```bash
pm2 logs bnkr-backend
```

### Ver Logs de Nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Ver Estado de Servicios
```bash
# Estado de PM2
pm2 status

# Estado de servicios del sistema
sudo systemctl status nginx
sudo systemctl status postgresql
```

## 🔄 Actualizaciones

### Actualizar Código
```bash
# Conectar al servidor
ssh root@tu-ip-del-servidor

# Ir al directorio del proyecto
cd bnkr-gym-management

# Obtener cambios
git pull origin main

# Reinstalar dependencias si es necesario
cd backend && npm install
cd ../frontend && npm install

# Reconstruir frontend
cd frontend && npm run build

# Reiniciar servicios
pm2 restart bnkr-backend
sudo systemctl reload nginx
```

### Actualizar Base de Datos
```bash
cd backend
npx prisma migrate deploy
```

## 🛡️ Seguridad

### Configurar Firewall
```bash
# Verificar estado del firewall
sudo ufw status

# Si no está activo, activarlo
sudo ufw enable
```

### Cambiar Contraseñas por Defecto
```bash
# Cambiar contraseña de PostgreSQL
sudo -u postgres psql -c "ALTER USER bnkr_user PASSWORD 'nueva-contraseña-super-segura';"

# Actualizar DATABASE_URL en backend/.env
nano backend/.env
```

### Configurar Backup Automático
```bash
# Crear script de backup
sudo nano /root/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# Backup de base de datos
sudo -u postgres pg_dump bnkr_gym > $BACKUP_DIR/db_backup_$DATE.sql

# Backup de archivos del proyecto
tar -czf $BACKUP_DIR/project_backup_$DATE.tar.gz /var/www/bnkr-gym

# Eliminar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Hacer ejecutable
chmod +x /root/backup-db.sh

# Agregar a crontab (backup diario a las 2 AM)
crontab -e
# Agregar: 0 2 * * * /root/backup-db.sh
```

## 🆘 Solución de Problemas

### El Backend No Responde
```bash
# Verificar si está ejecutándose
pm2 status

# Ver logs
pm2 logs bnkr-backend

# Reiniciar si es necesario
pm2 restart bnkr-backend
```

### El Frontend No Carga
```bash
# Verificar archivos estáticos
ls -la /var/www/bnkr-gym/frontend/dist/

# Verificar logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar configuración de Nginx
sudo nginx -t
```

### Base de Datos No Conecta
```bash
# Verificar estado de PostgreSQL
sudo systemctl status postgresql

# Verificar conectividad
sudo -u postgres psql -c "\l"

# Verificar variables de entorno
cd backend && cat .env | grep DATABASE_URL
```

### Problemas de Permisos
```bash
# Corregir permisos de archivos del frontend
sudo chown -R www-data:www-data /var/www/bnkr-gym

# Corregir permisos del proyecto
sudo chown -R $USER:$USER /root/bnkr-gym-management
```

## 📈 Optimización

### Configurar Cache de Nginx
```bash
sudo nano /etc/nginx/sites-available/bnkr-gym
```

Agregar configuración de cache:
```nginx
# Cache para archivos estáticos
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;
}

# Cache para API (cuidado con datos dinámicos)
location /api/ {
    proxy_pass http://localhost:3001/api/;
    proxy_cache_valid 200 1m;
    proxy_cache_valid 404 1m;
    # ... resto de configuración
}
```

### Configurar Compresión
```bash
sudo nano /etc/nginx/nginx.conf
```

Verificar que la compresión esté habilitada:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

## 💰 Estimación de Costos

- **Droplet Basic**: $6/mes
- **Dominio**: $10-15/año (opcional)
- **Total**: ~$6-7/mes

## 📞 Comandos Útiles

```bash
# Ver información del sistema
htop
df -h
free -h

# Ver puertos en uso
netstat -tlnp

# Ver procesos
ps aux | grep node

# Reiniciar todo el sistema
sudo reboot

# Ver logs del sistema
sudo journalctl -f
```

---

**Nota**: Este despliegue es para desarrollo/producción pequeña. Para aplicaciones con mucho tráfico, considera usar un load balancer y múltiples instancias. 