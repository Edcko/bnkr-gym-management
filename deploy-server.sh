#!/bin/bash

# Script de despliegue directo en servidor - BNKR Gym Management
echo "🚀 Iniciando despliegue directo en servidor..."

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

# Verificar que estamos en un servidor Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    print_warning "Este script está diseñado para ejecutarse en un servidor Linux."
fi

print_step "Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

print_step "Instalando dependencias del sistema..."
sudo apt install -y curl wget git build-essential

print_step "Instalando Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

print_step "Instalando PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

print_step "Instalando Nginx..."
sudo apt install -y nginx

print_step "Instalando PM2 para gestión de procesos..."
sudo npm install -g pm2

print_step "Configurando PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear usuario y base de datos
sudo -u postgres psql -c "CREATE USER bnkr_user WITH PASSWORD 'bnkr_password';"
sudo -u postgres psql -c "CREATE DATABASE bnkr_gym OWNER bnkr_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bnkr_gym TO bnkr_user;"

print_step "Configurando firewall..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

print_status "✅ Instalación de dependencias completada!"

echo ""
echo "📋 Próximos pasos:"
echo "   1. Clonar el repositorio: git clone <tu-repo>"
echo "   2. Configurar variables de entorno"
echo "   3. Instalar dependencias del proyecto"
echo "   4. Ejecutar migraciones de base de datos"
echo "   5. Configurar Nginx"
echo "   6. Iniciar servicios con PM2"
echo ""
echo "🔗 Para continuar, ejecuta: ./setup-project.sh" 