# 🚀 Despliegue en Digital Ocean - BNKR Gym Management

## 📋 Opciones de Despliegue

### 1. Digital Ocean App Platform (Recomendado)
- **Ventajas**: Fácil de configurar, escalable, SSL automático
- **Costo**: ~$12-24/mes
- **Complejidad**: Baja

### 2. Digital Ocean Droplet con Docker
- **Ventajas**: Control total, más económico
- **Costo**: ~$6-12/mes
- **Complejidad**: Media

### 3. Digital Ocean Kubernetes (DOKS)
- **Ventajas**: Máxima escalabilidad, orquestación avanzada
- **Costo**: ~$20-40/mes
- **Complejidad**: Alta

## 🛠️ Opción 1: Digital Ocean App Platform

### Paso 1: Preparar el Proyecto

```bash
# Ejecutar el script de build
./build-prod.sh
```

### Paso 2: Configurar Variables de Entorno

Editar el archivo `.env.production`:

```env
# Configuración de Base de Datos
POSTGRES_PASSWORD=tu-contraseña-super-segura

# Configuración de JWT
JWT_SECRET=tu-jwt-secret-super-seguro

# URLs de la aplicación (se configurarán después del despliegue)
FRONTEND_URL=https://tu-app.ondigitalocean.app
BACKEND_URL=https://tu-app.ondigitalocean.app

# Configuración de seguridad
NODE_ENV=production
```

### Paso 3: Subir a GitHub

```bash
# Inicializar repositorio (si no existe)
git init
git add .
git commit -m "Initial commit for production deployment"

# Crear repositorio en GitHub y subir
git remote add origin https://github.com/tu-usuario/bnkr-gym-management.git
git push -u origin main
```

### Paso 4: Instalar Digital Ocean CLI

```bash
# macOS
brew install doctl

# Linux
snap install doctl

# Windows
# Descargar desde https://github.com/digitalocean/doctl/releases
```

### Paso 5: Autenticarse en Digital Ocean

```bash
doctl auth init
```

### Paso 6: Desplegar la Aplicación

```bash
# Ejecutar el script de despliegue
./deploy-digitalocean.sh
```

### Paso 7: Configurar Dominio Personalizado (Opcional)

1. Ir a la consola de Digital Ocean
2. Seleccionar tu aplicación
3. Ir a "Settings" > "Domains"
4. Agregar tu dominio
5. Configurar DNS en tu proveedor de dominios

## 🐳 Opción 2: Digital Ocean Droplet con Docker

### Paso 1: Crear Droplet

1. Ir a Digital Ocean Console
2. Crear nuevo Droplet
3. Seleccionar:
   - **Image**: Ubuntu 22.04 LTS
   - **Size**: Basic $6/mo (1GB RAM, 1 vCPU)
   - **Datacenter**: Cercano a tus usuarios
   - **Authentication**: SSH Key (recomendado)

### Paso 2: Conectar al Droplet

```bash
ssh root@tu-ip-del-droplet
```

### Paso 3: Instalar Docker y Docker Compose

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Agregar usuario al grupo docker
usermod -aG docker $USER
```

### Paso 4: Clonar el Proyecto

```bash
# Instalar Git
apt install git -y

# Clonar repositorio
git clone https://github.com/tu-usuario/bnkr-gym-management.git
cd bnkr-gym-management
```

### Paso 5: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.production.example .env.production

# Editar variables
nano .env.production
```

### Paso 6: Desplegar con Docker Compose

```bash
# Construir y ejecutar
docker-compose -f docker-compose.prod.yml up -d

# Verificar estado
docker-compose -f docker-compose.prod.yml ps
```

### Paso 7: Configurar Nginx (Opcional)

```bash
# Instalar Nginx
apt install nginx -y

# Configurar proxy reverso
cat > /etc/nginx/sites-available/bnkr-gym << 'EOF'
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Habilitar sitio
ln -s /etc/nginx/sites-available/bnkr-gym /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 🔧 Configuración de SSL con Let's Encrypt

### Para Droplet con Nginx:

```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
certbot --nginx -d tu-dominio.com

# Configurar renovación automática
crontab -e
# Agregar línea: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoreo y Logs

### Ver logs en App Platform:
```bash
doctl apps logs tu-app-id
```

### Ver logs en Droplet:
```bash
# Logs de todos los servicios
docker-compose -f docker-compose.prod.yml logs -f

# Logs específicos
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

## 🔄 Actualizaciones

### App Platform:
```bash
# Hacer cambios en el código
git add .
git commit -m "Update application"
git push origin main

# Digital Ocean detectará automáticamente los cambios
```

### Droplet:
```bash
# Conectar al servidor
ssh root@tu-ip

# Actualizar código
cd bnkr-gym-management
git pull origin main

# Reconstruir y reiniciar
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## 🛡️ Seguridad

### Configuraciones Recomendadas:

1. **Firewall**:
```bash
# Configurar UFW
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

2. **Variables de Entorno Seguras**:
```bash
# Generar contraseñas seguras
openssl rand -base64 32
```

3. **Backup de Base de Datos**:
```bash
# Crear script de backup
cat > /root/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f /root/bnkr-gym-management/docker-compose.prod.yml exec -T postgres pg_dump -U bnkr_prod_user bnkr_gym_prod > /root/backups/db_backup_$DATE.sql
EOF

chmod +x /root/backup-db.sh
mkdir -p /root/backups

# Agregar a crontab (backup diario a las 2 AM)
crontab -e
# Agregar: 0 2 * * * /root/backup-db.sh
```

## 💰 Estimación de Costos

### App Platform:
- **Backend**: $12/mes
- **Frontend**: $12/mes
- **Database**: $15/mes
- **Total**: ~$39/mes

### Droplet:
- **Droplet Basic**: $6/mes
- **Total**: ~$6/mes

## 🆘 Solución de Problemas

### App Platform no se despliega:
```bash
# Verificar logs
doctl apps logs tu-app-id

# Verificar configuración
doctl apps get tu-app-id
```

### Droplet no responde:
```bash
# Verificar estado del servidor
systemctl status docker
systemctl status nginx

# Verificar logs de Docker
docker-compose -f docker-compose.prod.yml logs
```

### Base de datos no conecta:
```bash
# Verificar variables de entorno
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE

# Verificar conectividad
docker-compose -f docker-compose.prod.yml exec backend npx prisma db push
```

---

**Nota**: Para producción, considera usar un dominio personalizado y configurar SSL. También es recomendable configurar monitoreo y alertas para detectar problemas proactivamente. 