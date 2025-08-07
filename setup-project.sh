#!/bin/bash

# Script para configurar el proyecto en el servidor
echo "⚙️  Configurando proyecto BNKR Gym Management..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Verificar que estamos en el directorio del proyecto
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "No se encontró el proyecto. Asegúrate de estar en el directorio correcto."
    exit 1
fi

print_step "Configurando backend..."

# Configurar backend
cd backend

# Instalar dependencias
print_status "Instalando dependencias del backend..."
npm install

# Configurar variables de entorno
if [ ! -f ".env" ]; then
    print_status "Creando archivo .env para el backend..."
    cat > .env << EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://bnkr_user:bnkr_password@localhost:5432/bnkr_gym
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:80
EOF
    print_warning "Por favor edita el archivo backend/.env con tus configuraciones."
fi

# Generar cliente de Prisma
print_status "Generando cliente de Prisma..."
npx prisma generate

# Ejecutar migraciones
print_status "Ejecutando migraciones de base de datos..."
npx prisma migrate deploy

cd ..

print_step "Configurando frontend..."

# Configurar frontend
cd frontend

# Instalar dependencias
print_status "Instalando dependencias del frontend..."
npm install

# Configurar variables de entorno
if [ ! -f ".env" ]; then
    print_status "Creando archivo .env para el frontend..."
    cat > .env << EOF
VITE_API_URL=http://localhost:3001
EOF
    print_warning "Por favor edita el archivo frontend/.env con tus configuraciones."
fi

# Construir frontend
print_status "Construyendo frontend para producción..."
npm run build

cd ..

print_step "Configurando Nginx..."

# Configurar Nginx
sudo tee /etc/nginx/sites-available/bnkr-gym << 'EOF'
server {
    listen 80;
    server_name localhost;

    # Configuración para archivos estáticos del frontend
    location / {
        root /var/www/bnkr-gym/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Configuración de cache para archivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary Accept-Encoding;
        }
    }

    # Configuración para API del backend
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Configuración para health check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }

    # Configuración de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
EOF

# Habilitar sitio
sudo ln -sf /etc/nginx/sites-available/bnkr-gym /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar configuración de Nginx
sudo nginx -t

# Copiar archivos del frontend
sudo mkdir -p /var/www/bnkr-gym
sudo cp -r frontend/dist /var/www/bnkr-gym/frontend/
sudo chown -R www-data:www-data /var/www/bnkr-gym

print_step "Configurando PM2..."

# Crear archivo de configuración de PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'bnkr-backend',
      script: './backend/src/index.ts',
      cwd: './backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
EOF

print_step "Iniciando servicios..."

# Iniciar backend con PM2
cd backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

cd ..

# Reiniciar Nginx
sudo systemctl reload nginx

print_status "✅ Configuración del proyecto completada!"

echo ""
echo "📋 Servicios iniciados:"
echo "   🔧 Backend: http://localhost:3001"
echo "   🌐 Frontend: http://localhost:80"
echo "   🗄️  Base de datos: PostgreSQL en localhost:5432"
echo ""
echo "📝 Comandos útiles:"
echo "   Ver logs del backend: pm2 logs bnkr-backend"
echo "   Reiniciar backend: pm2 restart bnkr-backend"
echo "   Ver estado de PM2: pm2 status"
echo "   Ver logs de Nginx: sudo tail -f /var/log/nginx/access.log"
echo ""
echo "🔗 Tu aplicación debería estar disponible en:"
echo "   http://tu-ip-del-servidor" 