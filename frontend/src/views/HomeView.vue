<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '@/stores/toast'
import { useLanguage } from '@/stores/language'
import { newsletterService } from '@/utils/api'
import { t } from '@/utils/translations'


const toast = useToast()
const language = useLanguage()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const loading = ref(false)

// Validation rules
const rules = {
  required: (value: string) => !!value || 'Este campo es requerido',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Email inválido'
  }
}

const subscribe = async () => {
  if (!firstName.value || !lastName.value || !email.value) {
    toast.show(t('pleaseCompleteFields', language.currentLanguage), 'error')
    return
  }

  loading.value = true
  
  try {
    const response = await newsletterService.subscribe({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value
    })

    if (response.status === 200 || response.status === 201) {
      toast.show(t('subscribeSuccess', language.currentLanguage), 'success')
      firstName.value = ''
      lastName.value = ''
      email.value = ''
    } else {
      throw new Error('Error en la suscripción')
    }
  } catch (error) {
    console.error('Error subscribing:', error)
    toast.show(t('subscribeError', language.currentLanguage), 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="home">
    <!-- Hero Section - Estilo Modest Muscle -->
    <section class="hero">
      <!-- Background Video -->
      <div class="hero-background">
        <video 
          class="hero-video" 
          autoplay 
          muted 
          loop 
          playsinline
        >
          <source src="@/assets/BNKR HORIZONTAL.mp4" type="video/mp4">
        </video>
        <div class="hero-overlay"></div>
      </div>
      
      <!-- Content -->
      <div class="hero-content">
        <div class="hero-left">
          <div class="hero-text">
            <p class="hero-tagline">{{ t('revealingExcellence', language.currentLanguage) }}</p>
            <h1 class="hero-title">{{ t('joinTheMovement', language.currentLanguage) }}</h1>
            <p class="hero-subtitle">{{ t('getStartedToday', language.currentLanguage) }}</p>
            <div class="hero-underline"></div>
          </div>
        </div>
        
        <div class="hero-right">
          <div class="signup-form">
            <h2 class="form-title">{{ t('joinNewsletter', language.currentLanguage) }}</h2>
            <p class="form-subtitle">{{ t('newsletterSubtitle', language.currentLanguage) }}</p>
            
            <v-form @submit.prevent="subscribe">
              <div class="form-row">
                <v-text-field
                  v-model="firstName"
                  :label="t('firstName', language.currentLanguage)"
                  variant="outlined"
                  class="form-field"
                  color="white"
                  bg-color="transparent"
                  :rules="[rules.required]"
                ></v-text-field>
                <v-text-field
                  v-model="lastName"
                  :label="t('lastName', language.currentLanguage)"
                  variant="outlined"
                  class="form-field"
                  color="white"
                  bg-color="transparent"
                  :rules="[rules.required]"
                ></v-text-field>
              </div>
              
              <v-text-field
                v-model="email"
                :label="t('email', language.currentLanguage)"
                type="email"
                variant="outlined"
                class="form-field"
                color="white"
                bg-color="transparent"
                :rules="[rules.required, rules.email]"
              ></v-text-field>
              
              <v-btn
                type="submit"
                color="white"
                size="x-large"
                block
                class="subscribe-btn"
                :loading="loading"
                              >
                  {{ t('subscribe', language.currentLanguage) }}
                </v-btn>
            </v-form>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="mission">
      <div class="mission-content">
        <div class="mission-text">
          <h2 class="mission-title">{{ t('ourMission', language.currentLanguage) }}</h2>
          <h3 class="mission-subtitle">{{ t('missionSubtitle', language.currentLanguage) }}</h3>
          <p class="mission-paragraph">
            {{ t('missionText1', language.currentLanguage) }}
          </p>
          <p class="mission-paragraph">
            {{ t('missionText2', language.currentLanguage) }}
          </p>
        </div>
      </div>
    </section>

    <!-- Programs Section -->
    <section class="programs">
      <div class="programs-content">
        <h2 class="section-title">{{ t('getTrainingResults', language.currentLanguage) }}</h2>
        <p class="section-subtitle">{{ t('testimonial', language.currentLanguage) }}</p>
        <p class="testimonial-author">{{ t('testimonialAuthor', language.currentLanguage) }}</p>
        
        <div class="programs-grid">
          <div class="program-card">
            <div class="program-icon">
              <v-icon size="48" color="white">mdi-heart-pulse</v-icon>
            </div>
            <h3 class="program-title">{{ t('cardioBoxing', language.currentLanguage) }}</h3>
            <p class="program-description">
              {{ t('cardioBoxingDesc', language.currentLanguage) }}
            </p>
          </div>
          
          <div class="program-card">
            <div class="program-icon">
              <v-icon size="48" color="white">mdi-boxing-glove</v-icon>
            </div>
            <h3 class="program-title">{{ t('groupTraining', language.currentLanguage) }}</h3>
            <p class="program-description">
              {{ t('groupTrainingDesc', language.currentLanguage) }}
            </p>
          </div>
          
          <div class="program-card">
            <div class="program-icon">
              <v-icon size="48" color="white">mdi-account-star</v-icon>
            </div>
            <h3 class="program-title">{{ t('personalTraining', language.currentLanguage) }}</h3>
            <p class="program-description">
              {{ t('personalTrainingDesc', language.currentLanguage) }}
            </p>
          </div>
        </div>
        
        <div class="cta-section">
          <v-btn to="/register" color="#ff6b35" size="x-large" class="cta-btn">
            {{ t('getStarted', language.currentLanguage) }}
          </v-btn>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  width: 100%;
  overflow-x: hidden;
}



/* Hero Section - Estilo Modest Muscle */
.hero {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0;
  width: 100%;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  align-items: center;
}

.hero-left {
  display: flex;
  align-items: center;
  padding: 0 40px;
}

.hero-text {
  color: white;
}

.hero-tagline {
  font-size: 1rem;
  font-weight: 400;
  color: #ffffff;
  margin-bottom: 20px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 10px;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 400;
  color: white;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.hero-underline {
  width: 100px;
  height: 3px;
  background: var(--accent-primary);
  margin-top: 20px;
}

.hero-right {
  background: var(--form-bg);
  backdrop-filter: blur(15px);
  border: 1px solid var(--form-border);
  box-shadow: 0 8px 32px var(--shadow-color);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  border-radius: 20px;
  margin: 40px;
  width: 380px;
  max-width: 90vw;
  transition: all 0.3s ease;
}

.hero-right:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px var(--shadow-color);
  border-color: var(--form-border);
}

.signup-form {
  width: 100%;
  color: white;
}

.form-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 15px;
  text-align: center;
}

.form-subtitle {
  font-size: 1rem;
  color: white;
  margin-bottom: 40px;
  text-align: center;
  line-height: 1.5;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.form-field {
  margin-bottom: 15px;
}

.form-field :deep(.v-field__outline) {
  border-color: white !important;
}

.form-field :deep(.v-field__outline__start) {
  border-color: white !important;
}

.form-field :deep(.v-field__outline__end) {
  border-color: white !important;
}

.form-field :deep(.v-field__outline__notch) {
  border-color: white !important;
}

.form-field :deep(.v-label) {
  color: white !important;
}

.form-field :deep(.v-field__input) {
  color: white !important;
}

.subscribe-btn {
  margin-top: 20px;
  background: white !important;
  color: #ff6b35 !important;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  height: 56px;
  border-radius: 4px;
}

.subscribe-btn:hover {
  background: #f5f5f5 !important;
}

/* Mission Section */
.mission {
  background: var(--bg-primary);
  padding: 120px 40px;
  color: var(--text-primary);
}

.mission-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.mission-title {
  font-size: 2.5rem;
  font-weight: 300;
  color: var(--text-primary);
  margin-bottom: 20px;
  letter-spacing: -0.02em;
}

.mission-subtitle {
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--text-accent);
  margin-bottom: 40px;
  font-style: italic;
}

.mission-paragraph {
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 25px;
  font-weight: 300;
}

/* Programs Section */
.programs {
  background: var(--bg-secondary);
  padding: 120px 40px;
  color: var(--text-primary);
}

.programs-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.section-title {
  font-size: 3rem;
  font-weight: 300;
  color: var(--text-primary);
  margin-bottom: 20px;
  letter-spacing: -0.02em;
}

.section-subtitle {
  font-size: 1.3rem;
  color: var(--text-accent);
  margin-bottom: 20px;
  font-style: italic;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.testimonial-author {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 60px;
  font-weight: 300;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
  margin-bottom: 60px;
}

.program-card {
  background: var(--bg-tertiary);
  padding: 40px 30px;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.program-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ff6b35, #dc143c);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.program-card:hover::before {
  transform: scaleX(1);
}

.program-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 107, 53, 0.3);
  box-shadow: 0 10px 30px rgba(255, 107, 53, 0.1);
}

.program-icon {
  margin-bottom: 20px;
}

.program-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.program-description {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.6;
  font-weight: 300;
}

.cta-section {
  text-align: center;
}

.cta-btn {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  height: 56px;
  padding: 0 40px;
  border-radius: 4px;
  background: var(--accent-primary) !important;
  color: white !important;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
    padding: 0 20px;
    min-height: auto;
  }
  
  .hero-left {
    padding: 80px 20px 40px;
    justify-content: center;
    text-align: center;
  }
  
  .hero-right {
    padding: 40px 20px;
  }
  
  .hero-title {
    font-size: 3rem;
  }
  
  .mission {
    padding: 80px 20px;
  }
  
  .programs {
    padding: 80px 20px;
  }
  
  .section-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .hero-content {
    padding: 0 15px;
  }
  
  .hero-left {
    padding: 60px 15px 30px;
  }
  
  .hero-right {
    padding: 30px 15px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .mission {
    padding: 60px 15px;
  }
  
  .programs {
    padding: 60px 15px;
  }
  
  .programs-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-tagline {
    font-size: 0.9rem;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .mission-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
}
</style>
