<template>
  <div class="classes">
    <!-- Hero Section - Estilo Modest Muscle -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Nuestras Clases</h1>
        <p class="hero-subtitle">
          Descubre nuestras clases intensivas de Cardio-Boxing diseñadas para transformar tu cuerpo y mente.
        </p>
      </div>
    </section>

    <!-- Classes Grid - Estilo Modest Muscle -->
    <section class="classes-grid">
      <div class="classes-content">
        <h2 class="section-title">Programas Disponibles</h2>
        <div class="classes-container">
          <div 
            v-for="clase in clases" 
            :key="clase.id" 
            class="class-card-wrapper"
          >
            <v-card class="class-card" elevation="0">
              <v-img
                :src="clase.imagen"
                height="250"
                cover
                class="class-image"
              ></v-img>
              
              <v-card-text class="pa-6">
                <div class="class-header">
                  <h3 class="class-title">{{ clase.nombre }}</h3>
                  <v-chip 
                    :color="clase.nivel === 'Principiante' ? 'green' : clase.nivel === 'Intermedio' ? 'orange' : 'red'"
                    size="small"
                    variant="outlined"
                  >
                    {{ clase.nivel }}
                  </v-chip>
                </div>
                
                <p class="class-description">
                  {{ clase.descripcion }}
                </p>
                
                <div class="class-details">
                  <div class="detail-item">
                    <v-icon size="18" class="mr-3">mdi-clock</v-icon>
                    <span>{{ clase.duracion }}</span>
                  </div>
                  <div class="detail-item">
                    <v-icon size="18" class="mr-3">mdi-fire</v-icon>
                    <span>{{ clase.intensidad }}</span>
                  </div>
                  <div class="detail-item">
                    <v-icon size="18" class="mr-3">mdi-account-group</v-icon>
                    <span>{{ clase.capacidad }} personas</span>
                  </div>
                </div>
                
                <div class="class-tags">
                  <v-chip 
                    v-for="tag in clase.tags" 
                    :key="tag"
                    size="small"
                    variant="outlined"
                    class="mr-2 mb-2"
                  >
                    {{ tag }}
                  </v-chip>
                </div>
              </v-card-text>
              
              <v-card-actions class="pa-6 pt-0">
                <v-btn
                  color="black"
                  variant="outlined"
                  block
                  size="large"
                  @click="reservarClase(clase)"
                  class="reserve-btn"
                >
                  Reservar Clase
                </v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section - Estilo Modest Muscle -->
    <section class="cta">
      <div class="cta-content">
        <h2>¿Listo para comenzar?</h2>
        <p>
          Únete a BNKR y transforma tu vida con nuestras clases de Cardio-Boxing. 
          El cambio comienza con una decisión.
        </p>
        <v-btn to="/register" color="black" size="x-large" class="cta-btn">
          Comenzar Ahora
        </v-btn>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const clases = ref([
  {
    id: 1,
    nombre: 'Cardio-Boxing Básico',
    descripcion: 'Clase introductoria perfecta para principiantes. Aprende los fundamentos del boxeo mientras quemas calorías.',
    nivel: 'Principiante',
    duracion: '45 min',
    intensidad: 'Media',
    capacidad: 15,
    imagen: '/src/assets/placeholder-product.jpg',
    tags: ['Cardio', 'Boxeo', 'Principiantes']
  },
  {
    id: 2,
    nombre: 'Cardio-Boxing Avanzado',
    descripcion: 'Sesión intensiva para atletas experimentados. Combina técnicas avanzadas de boxeo con entrenamiento cardiovascular.',
    nivel: 'Avanzado',
    duracion: '60 min',
    intensidad: 'Alta',
    capacidad: 12,
    imagen: '/src/assets/placeholder-product.jpg',
    tags: ['Cardio', 'Boxeo', 'Avanzado']
  },
  {
    id: 3,
    nombre: 'HIIT Cardio-Boxing',
    descripcion: 'Entrenamiento de intervalos de alta intensidad combinado con técnicas de boxeo para máxima quema de calorías.',
    nivel: 'Intermedio',
    duracion: '50 min',
    intensidad: 'Alta',
    capacidad: 18,
    imagen: '/src/assets/placeholder-product.jpg',
    tags: ['HIIT', 'Cardio', 'Boxeo']
  },
  {
    id: 4,
    nombre: 'Boxeo Técnico',
    descripcion: 'Enfócate en la técnica y precisión del boxeo. Ideal para mejorar la coordinación y la fuerza.',
    nivel: 'Intermedio',
    duracion: '55 min',
    intensidad: 'Media',
    capacidad: 10,
    imagen: '/src/assets/placeholder-product.jpg',
    tags: ['Técnica', 'Boxeo', 'Coordinación']
  },
  {
    id: 5,
    nombre: 'Cardio-Boxing Express',
    descripcion: 'Sesión rápida y efectiva de 30 minutos. Perfecta para días ocupados.',
    nivel: 'Principiante',
    duracion: '30 min',
    intensidad: 'Media',
    capacidad: 20,
    imagen: '/src/assets/placeholder-product.jpg',
    tags: ['Express', 'Cardio', 'Boxeo']
  },
  {
    id: 6,
    nombre: 'Boxeo de Combate',
    descripcion: 'Entrenamiento intensivo que simula un combate real. Solo para atletas experimentados.',
    nivel: 'Avanzado',
    duracion: '75 min',
    intensidad: 'Muy Alta',
    capacidad: 8,
    imagen: '/src/assets/placeholder-product.jpg',
    tags: ['Combate', 'Boxeo', 'Avanzado']
  }
])

const reservarClase = (clase: any) => {
  console.log('Reservando clase:', clase.nombre)
}
</script>

<style scoped>
.classes {
  width: 100%;
}

/* Hero Section - Estilo Modest Muscle */
.hero {
  background: white;
  padding: 120px 20px;
  text-align: center;
  width: 100%;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero-title {
  font-size: 4rem;
  font-weight: 300;
  color: black;
  margin-bottom: 30px;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #666;
  line-height: 1.6;
  font-weight: 300;
}

/* Classes Grid - Estilo Modest Muscle */
.classes-grid {
  background: #f8f9fa;
  padding: 100px 20px;
  width: 100%;
}

.classes-content {
  max-width: 1400px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 300;
  color: black;
  text-align: center;
  margin-bottom: 80px;
  letter-spacing: -0.02em;
}

.classes-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 40px;
}

.class-card-wrapper {
  width: 100%;
}

.class-card {
  height: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: white;
}

.class-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.class-image {
  border-radius: 8px 8px 0 0;
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.class-title {
  font-size: 1.5rem;
  font-weight: 400;
  color: black;
  margin: 0;
  letter-spacing: -0.01em;
}

.class-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 25px;
  font-weight: 300;
}

.class-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
}

.detail-item {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 0.95rem;
}

.class-tags {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 25px;
}

.reserve-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 4px;
  height: 48px;
}

/* CTA Section - Estilo Modest Muscle */
.cta {
  background: white;
  padding: 100px 20px;
  text-align: center;
  width: 100%;
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
}

.cta h2 {
  font-size: 2.5rem;
  font-weight: 300;
  color: black;
  margin-bottom: 30px;
  letter-spacing: -0.02em;
}

.cta p {
  font-size: 1.3rem;
  color: #666;
  margin-bottom: 50px;
  line-height: 1.6;
  font-weight: 300;
}

.cta-btn {
  min-width: 250px;
  height: 56px;
  font-weight: 500;
  text-transform: none;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    padding: 80px 20px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .classes-grid {
    padding: 80px 20px;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .cta {
    padding: 80px 20px;
  }
  
  .cta h2 {
    font-size: 2rem;
  }
  
  .classes-container {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .class-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .class-details {
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .section-title,
  .cta h2 {
    font-size: 1.5rem;
  }
  
  .class-title {
    font-size: 1.3rem;
  }
  
  .class-description {
    font-size: 0.95rem;
  }
}
</style> 