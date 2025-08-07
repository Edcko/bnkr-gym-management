#!/bin/bash

# Script de build para producción - BNKR Gym Management
echo "🏗️  Iniciando build de producción para BNKR Gym Management..."

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

# Verificar archivo de variables de entorno
if [ ! -f ".env.production" ]; then
    print_warning "Archivo .env.production no encontrado."
    print_status "Copiando archivo de ejemplo..."
    cp env.production.example .env.production
    print_warning "Por favor edita el archivo .env.production con tus configuraciones antes de continuar."
    exit 1
fi

print_status "Archivo .env.production encontrado."

# Limpiar builds anteriores
print_step "Limpiando builds anteriores..."
docker-compose -f docker-compose.prod.yml down
docker system prune -f

# Construir imágenes de producción
print_step "Construyendo imágenes de producción..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Verificar que la construcción fue exitosa
if [ $? -ne 0 ]; then
    print_error "Error en la construcción de las imágenes Docker."
    exit 1
fi

print_status "✅ Build de producción completado exitosamente!"

# Crear archivo de configuración para Digital Ocean
print_step "Creando configuración para Digital Ocean..."

# Crear archivo de configuración para Digital Ocean App Platform
cat > digitalocean-app.yaml << EOF
name: bnkr-gym-management
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/bnkr-gym-management
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "3001"
  - key: DATABASE_URL
    value: \${db.DATABASE_URL}
  - key: JWT_SECRET
    value: \${JWT_SECRET}
  - key: CORS_ORIGIN
    value: \${FRONTEND_URL}

- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/bnkr-gym-management
    branch: main
  run_command: npm run build && npx serve -s dist -l 80
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: VITE_API_URL
    value: \${BACKEND_URL}

databases:
- name: db
  engine: PG
  version: "15"
  production: false
EOF

print_status "✅ Archivo digitalocean-app.yaml creado."

# Crear script de despliegue para Digital Ocean
cat > deploy-digitalocean.sh << 'EOF'
#!/bin/bash

echo "🚀 Desplegando en Digital Ocean..."

# Verificar que doctl esté instalado
if ! command -v doctl &> /dev/null; then
    echo "❌ doctl no está instalado. Instala Digital Ocean CLI primero."
    exit 1
fi

# Verificar autenticación
if ! doctl account get &> /dev/null; then
    echo "❌ No estás autenticado en Digital Ocean. Ejecuta 'doctl auth init' primero."
    exit 1
fi

# Desplegar aplicación
echo "📦 Desplegando aplicación..."
doctl apps create --spec digitalocean-app.yaml

echo "✅ Despliegue completado!"
echo "🔗 Tu aplicación estará disponible en la URL proporcionada por Digital Ocean."
EOF

chmod +x deploy-digitalocean.sh

print_status "✅ Script de despliegue para Digital Ocean creado."

# Crear archivo de configuración para Docker Swarm (alternativa)
cat > docker-stack.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: bnkr_gym_prod
      POSTGRES_USER: bnkr_prod_user
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - bnkr-network
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure

  backend:
    image: bnkr-backend:latest
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://bnkr_prod_user:\${POSTGRES_PASSWORD}@postgres:5432/bnkr_gym_prod
      JWT_SECRET: \${JWT_SECRET}
      CORS_ORIGIN: \${FRONTEND_URL}
    ports:
      - "3001:3001"
    networks:
      - bnkr-network
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
    depends_on:
      - postgres

  frontend:
    image: bnkr-frontend:latest
    environment:
      VITE_API_URL: \${BACKEND_URL}
    ports:
      - "80:80"
    networks:
      - bnkr-network
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    networks:
      - bnkr-network
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:

networks:
  bnkr-network:
    driver: overlay
EOF

print_status "✅ Archivo docker-stack.yml creado para Docker Swarm."

echo ""
echo "🎉 Build de producción completado!"
echo ""
echo "📋 Archivos generados:"
echo "   📦 Imágenes Docker construidas"
echo "   ⚙️  digitalocean-app.yaml (para Digital Ocean App Platform)"
echo "   🐳 docker-stack.yml (para Docker Swarm)"
echo "   🚀 deploy-digitalocean.sh (script de despliegue)"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Edita .env.production con tus configuraciones"
echo "   2. Sube el código a GitHub"
echo "   3. Ejecuta ./deploy-digitalocean.sh para desplegar en Digital Ocean"
echo ""
echo "🔗 Alternativas de despliegue:"
echo "   - Digital Ocean App Platform: Usa digitalocean-app.yaml"
echo "   - Digital Ocean Droplet con Docker: Usa docker-compose.prod.yml"
echo "   - Docker Swarm: Usa docker-stack.yml" 