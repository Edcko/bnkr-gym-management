#!/bin/bash

### Configuración BNKR Gym Management - Deploy Completo
REMOTE_USER="root"
REMOTE_HOST="198.199.68.78"
FRONTEND_DIR="/var/www/bnkr-gym-management/frontend"
BACKEND_DIR="/var/www/bnkr-gym-management/backend"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

echo "🚀 BNKR Gym Management - Deploy Completo"
echo "========================================"
echo "📅 Timestamp: ${TIMESTAMP}"
echo "🌐 Servidor: ${REMOTE_HOST}"
echo ""

# Función para mostrar progreso
show_progress() {
    echo "🔄 $1"
}

# Función para mostrar éxito
show_success() {
    echo "✅ $1"
}

# Función para mostrar error
show_error() {
    echo "❌ $1"
}

# Función para mostrar advertencia
show_warning() {
    echo "⚠️ $1"
}

echo "🏗️  PASO 1: Preparando frontend..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    show_error "Falló la generación del build del frontend. Abortando..."
    exit 1
fi
show_success "Build del frontend generado exitosamente"
cd ..

echo ""
echo "🔧 PASO 2: Preparando backend..."
# Crear directorio temporal para el backend
TEMP_BACKEND="deploy_temp_backend"
rm -rf $TEMP_BACKEND
mkdir -p $TEMP_BACKEND

# Copiar archivos necesarios del backend
cp -r backend/src $TEMP_BACKEND/
cp -r backend/prisma $TEMP_BACKEND/
cp backend/package*.json $TEMP_BACKEND/
cp backend/ecosystem.config.js $TEMP_BACKEND/
cp backend/.env.production $TEMP_BACKEND/.env 2>/dev/null || show_warning "Archivo .env.production no encontrado"

show_success "Backend preparado para deploy"

echo ""
echo "🔐 PASO 3: Realizando respaldos en el servidor..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    # Respaldo frontend
    cd ${FRONTEND_DIR} && \
    if [ -d dist ]; then
        echo '📦 Respaldando frontend actual a dist_backup_${TIMESTAMP}' && \
        cp -r dist dist_backup_${TIMESTAMP} && \
        rm -rf dist
    fi && \
    
    # Respaldo backend
    mkdir -p /var/www/backups/bnkr_back && \
    cd ${BACKEND_DIR} && \
    if [ -d . ]; then
        echo '📦 Respaldando backend actual a backup_${TIMESTAMP}' && \
        tar -czf /var/www/backups/bnkr_back/backup_${TIMESTAMP}.tar.gz . && \
        rm -rf * .*
    fi
"

show_success "Respaldos realizados exitosamente"

echo ""
echo "🚀 PASO 4: Subiendo frontend al servidor..."
scp -r frontend/dist/ ${REMOTE_USER}@${REMOTE_HOST}:${FRONTEND_DIR}/

if [ $? -ne 0 ]; then
    show_error "Falló la transferencia del frontend"
    exit 1
fi
show_success "Frontend subido exitosamente"

echo ""
echo "🚀 PASO 5: Subiendo backend al servidor..."
scp -r ${TEMP_BACKEND}/* ${REMOTE_USER}@${REMOTE_HOST}:${BACKEND_DIR}/

if [ $? -ne 0 ]; then
    show_error "Falló la transferencia del backend"
    exit 1
fi
show_success "Backend subido exitosamente"

echo ""
echo "🔧 PASO 6: Configurando backend en el servidor..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    cd ${BACKEND_DIR} && \
    echo '📦 Instalando dependencias...' && \
    npm install --production && \
    echo '🗄️ Ejecutando migraciones de base de datos...' && \
    npx prisma migrate deploy && \
    echo '🔧 Generando cliente Prisma...' && \
    npx prisma generate && \
    echo '♻️ Reiniciando aplicación con PM2...' && \
    pm2 restart bnkr-backend || pm2 start ecosystem.config.js --name bnkr-backend
"

if [ $? -eq 0 ]; then
    show_success "Backend configurado exitosamente"
else
    show_warning "Backend configurado pero hubo problemas con PM2"
fi

echo ""
echo "♻️ PASO 7: Reiniciando servicios..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    systemctl reload nginx && \
    echo 'Nginx reiniciado exitosamente'
"

if [ $? -eq 0 ]; then
    show_success "Nginx reiniciado exitosamente"
else
    show_warning "Nginx no se pudo reiniciar. Verifica manualmente"
fi

# Limpiar directorio temporal
rm -rf $TEMP_BACKEND

echo ""
echo "🎉 ¡DEPLOY COMPLETO EXITOSO!"
echo "=============================="
echo "🌐 Frontend: http://${REMOTE_HOST}"
echo "🔧 Backend: http://${REMOTE_HOST}:3001"
echo "📊 Estado PM2: pm2 status bnkr-backend"
echo "📅 Timestamp: ${TIMESTAMP}"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs: pm2 logs bnkr-backend"
echo "   Reiniciar: pm2 restart bnkr-backend"
echo "   Estado: pm2 status bnkr-backend"
echo "   Nginx: systemctl status nginx"
