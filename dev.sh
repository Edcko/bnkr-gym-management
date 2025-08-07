#!/bin/bash

# Script de desarrollo para BNKR Gym Management
echo "🚀 Iniciando entorno de desarrollo de BNKR Gym Management..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

print_status "Docker y Docker Compose encontrados."

# Detener contenedores existentes
print_status "Deteniendo contenedores existentes..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# Construir imágenes de desarrollo
print_status "Construyendo imágenes de desarrollo..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

# Verificar que la construcción fue exitosa
if [ $? -ne 0 ]; then
    print_error "Error en la construcción de las imágenes Docker."
    exit 1
fi

# Iniciar servicios de desarrollo
print_status "Iniciando servicios de desarrollo..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Verificar que los servicios estén ejecutándose
print_status "Verificando estado de los servicios..."
sleep 10

# Verificar PostgreSQL
if docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps postgres | grep -q "Up"; then
    print_status "✅ PostgreSQL está ejecutándose"
else
    print_error "❌ PostgreSQL no está ejecutándose"
    exit 1
fi

# Verificar Backend
if docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps backend | grep -q "Up"; then
    print_status "✅ Backend está ejecutándose"
else
    print_error "❌ Backend no está ejecutándose"
    exit 1
fi

# Verificar Frontend
if docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps frontend | grep -q "Up"; then
    print_status "✅ Frontend está ejecutándose"
else
    print_error "❌ Frontend no está ejecutándose"
    exit 1
fi

# Ejecutar migraciones de base de datos
print_status "Ejecutando migraciones de base de datos..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npx prisma migrate deploy

# Generar cliente de Prisma
print_status "Generando cliente de Prisma..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npx prisma generate

# Verificar endpoints
print_status "Verificando endpoints..."

# Verificar health check del backend
if curl -s http://localhost:3001/health | grep -q "success"; then
    print_status "✅ Backend health check OK"
else
    print_warning "⚠️  Backend health check falló"
fi

# Verificar frontend
if curl -s http://localhost:5175 | grep -q "html"; then
    print_status "✅ Frontend está respondiendo"
else
    print_warning "⚠️  Frontend no está respondiendo"
fi

print_status "🎉 Entorno de desarrollo iniciado exitosamente!"
echo ""
echo "📋 Información del desarrollo:"
echo "   🌐 Frontend: http://localhost:5175"
echo "   🔧 Backend API: http://localhost:3001"
echo "   🗄️  Base de datos: localhost:5432"
echo ""
echo "📝 Comandos útiles:"
echo "   Ver logs: docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f"
echo "   Detener: docker-compose -f docker-compose.yml -f docker-compose.dev.yml down"
echo "   Reiniciar: docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart"
echo "   Ver estado: docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps"
echo ""
echo "🔄 Hot reload activado - Los cambios se reflejarán automáticamente" 