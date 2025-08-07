#!/bin/bash

# Script de backup para BNKR Gym Management
echo "💾 Iniciando backup de BNKR Gym Management..."

# Configuración
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="/root/bnkr-gym-management"

# Crear directorio de backup si no existe
mkdir -p $BACKUP_DIR

# Backup de base de datos
echo "📊 Haciendo backup de la base de datos..."
sudo -u postgres pg_dump bnkr_gym > $BACKUP_DIR/db_backup_$DATE.sql

# Comprimir backup de base de datos
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Backup de archivos del proyecto
echo "📁 Haciendo backup de archivos del proyecto..."
tar -czf $BACKUP_DIR/project_backup_$DATE.tar.gz -C /var/www bnkr-gym

# Backup de configuración
echo "⚙️  Haciendo backup de configuración..."
tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz \
    $PROJECT_DIR/backend/.env \
    $PROJECT_DIR/frontend/.env \
    /etc/nginx/sites-available/bnkr-gym \
    /etc/nginx/sites-enabled/bnkr-gym

# Crear archivo de información del backup
cat > $BACKUP_DIR/backup_info_$DATE.txt << EOF
Backup realizado el: $(date)
Servidor: $(hostname)
IP: $(hostname -I | awk '{print $1}')
Base de datos: bnkr_gym
Archivos incluidos:
- Base de datos: db_backup_$DATE.sql.gz
- Proyecto: project_backup_$DATE.tar.gz
- Configuración: config_backup_$DATE.tar.gz

Tamaños:
$(ls -lh $BACKUP_DIR/*$DATE*)
EOF

# Eliminar backups antiguos (mantener últimos 7 días)
echo "🧹 Limpiando backups antiguos..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "backup_info_*.txt" -mtime +7 -delete

# Mostrar información del backup
echo "✅ Backup completado exitosamente!"
echo ""
echo "📋 Información del backup:"
echo "   📊 Base de datos: db_backup_$DATE.sql.gz"
echo "   📁 Proyecto: project_backup_$DATE.tar.gz"
echo "   ⚙️  Configuración: config_backup_$DATE.tar.gz"
echo "   📝 Información: backup_info_$DATE.txt"
echo ""
echo "💾 Ubicación: $BACKUP_DIR"
echo "📏 Tamaño total: $(du -sh $BACKUP_DIR | awk '{print $1}')" 