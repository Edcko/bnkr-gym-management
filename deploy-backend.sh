#!/bin/bash

### Configuración BNKR Backend
REMOTE_USER="root"
REMOTE_HOST="198.199.68.78"
REMOTE_DIR="/var/www/bnkr-gym-management/backend"
BACKUP_DIR="/var/www/backups/bnkr_back"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

echo "🔧 BNKR Gym Management - Deploy Backend"
echo "======================================="

echo "📦 Paso 1: Preparando archivos del backend..."
# Crear directorio temporal para el deploy
TEMP_DIR="deploy_temp_backend"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# Copiar archivos necesarios
cp -r backend/src $TEMP_DIR/
cp -r backend/prisma $TEMP_DIR/
cp backend/package*.json $TEMP_DIR/
cp backend/ecosystem.config.js $TEMP_DIR/
cp backend/.env.production $TEMP_DIR/.env 2>/dev/null || echo "⚠️ Archivo .env.production no encontrado"

echo "🔐 Paso 2: Realizando respaldo en el servidor..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "
  mkdir -p ${BACKUP_DIR} && \
  cd ${REMOTE_DIR} && \
  if [ -d . ]; then
    echo '📦 Respaldando backend actual a ${BACKUP_DIR}/backup_${TIMESTAMP}' && \
    tar -czf ${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz . && \
    rm -rf * .*
  else
    echo '⚠️ No existe backend actual, se omitió respaldo.'
  fi
"

echo "🚀 Paso 3: Subiendo nuevo backend al servidor..."
scp -r ${TEMP_DIR}/* ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

if [ $? -eq 0 ]; then
  echo "🔧 Paso 4: Instalando dependencias y configurando en el servidor..."
  ssh ${REMOTE_USER}@${REMOTE_HOST} "
    cd ${REMOTE_DIR} && \
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
    echo "✅ ¡Despliegue del backend BNKR completado con éxito!"
    echo "🔧 Backend disponible en: http://198.199.68.78:3001"
    echo "📊 Estado PM2: pm2 status bnkr-backend"
  else
    echo "⚠️ El despliegue fue exitoso, pero falló la configuración. Verifica manualmente."
  fi
else
  echo "❌ Error: Falló la transferencia del backend."
  exit 1
fi

# Limpiar directorio temporal
rm -rf $TEMP_DIR
echo "🧹 Directorio temporal limpiado."
