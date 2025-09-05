#!/bin/bash

### Configuración Post-Deploy del Backend BNKR
REMOTE_USER="root"
REMOTE_HOST="198.199.68.78"
BACKEND_DIR="/var/www/bnkr-gym-management/backend"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

echo "🔧 BNKR Gym Management - Configuración Post-Deploy del Backend"
echo "=============================================================="
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

echo "🔍 PASO 1: Verificando estado del servidor..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    echo '📊 Estado del sistema:' && \
    echo '   - Memoria disponible:' && free -h && \
    echo '   - Espacio en disco:' && df -h /var/www && \
    echo '   - Procesos PM2:' && pm2 list 2>/dev/null || echo 'PM2 no está instalado o no hay procesos'
"

echo ""
echo "📦 PASO 2: Instalando dependencias del backend..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    cd ${BACKEND_DIR} && \
    echo '🔧 Verificando Node.js...' && \
    node --version && \
    npm --version && \
    echo '📦 Instalando dependencias...' && \
    npm install --production && \
    echo '✅ Dependencias instaladas exitosamente'
"

if [ $? -ne 0 ]; then
    show_error "Falló la instalación de dependencias"
    exit 1
fi
show_success "Dependencias instaladas exitosamente"

echo ""
echo "🗄️ PASO 3: Configurando base de datos..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    cd ${BACKEND_DIR} && \
    echo '🔧 Verificando Prisma...' && \
    npx prisma --version && \
    echo '🗄️ Ejecutando migraciones...' && \
    npx prisma migrate deploy && \
    echo '🔧 Generando cliente Prisma...' && \
    npx prisma generate && \
    echo '✅ Base de datos configurada exitosamente'
"

if [ $? -ne 0 ]; then
    show_error "Falló la configuración de la base de datos"
    exit 1
fi
show_success "Base de datos configurada exitosamente"

echo ""
echo "⚙️ PASO 4: Configurando PM2..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    echo '🔧 Verificando PM2...' && \
    pm2 --version && \
    echo '📋 Listando procesos PM2 actuales...' && \
    pm2 list && \
    echo '🔄 Deteniendo proceso bnkr-backend si existe...' && \
    pm2 stop bnkr-backend 2>/dev/null || echo 'Proceso no existía' && \
    pm2 delete bnkr-backend 2>/dev/null || echo 'Proceso no existía' && \
    echo '🚀 Iniciando nuevo proceso...' && \
    cd ${BACKEND_DIR} && \
    pm2 start ecosystem.config.js --name bnkr-backend && \
    echo '💾 Guardando configuración PM2...' && \
    pm2 save && \
    echo '🔄 Configurando PM2 para inicio automático...' && \
    pm2 startup
"

if [ $? -ne 0 ]; then
    show_warning "Hubo problemas con PM2, pero continuando..."
else
    show_success "PM2 configurado exitosamente"
fi

echo ""
echo "🔍 PASO 5: Verificando estado final..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    echo '📊 Estado de PM2:' && \
    pm2 list && \
    echo '' && \
    echo '📋 Logs del proceso:' && \
    pm2 logs bnkr-backend --lines 5 && \
    echo '' && \
    echo '🌐 Verificando puerto 3001:' && \
    netstat -tlnp | grep :3001 || echo 'Puerto 3001 no está escuchando'
"

echo ""
echo "♻️ PASO 6: Reiniciando Nginx..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    systemctl reload nginx && \
    echo '✅ Nginx reiniciado exitosamente' && \
    systemctl status nginx --no-pager -l
"

echo ""
echo "🎉 ¡CONFIGURACIÓN POST-DEPLOY COMPLETADA!"
echo "=========================================="
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
echo "   Logs Nginx: tail -f /var/log/nginx/error.log"
echo ""
echo "🔍 Verificaciones recomendadas:"
echo "   1. Probar login en: http://${REMOTE_HOST}"
echo "   2. Verificar API en: http://${REMOTE_HOST}:3001/api/health"
echo "   3. Revisar logs: pm2 logs bnkr-backend"


