export const translations = {
  es: {
    // Navbar
    training: 'ENTRENAMIENTO',
    movement: 'MOVIMIENTO',
    apparel: 'ROPA',
    joinMovement: 'ÚNETE AL MOVIMIENTO',
    
    // Hero Section
    revealingExcellence: 'MUSICA BOXEO CARDIO & FUNCIONAL',
    joinTheMovement: 'ÚNETE AL MOVIMIENTO',
    getStartedToday: 'COMIENZA HOY',
    joinNewsletter: 'ÚNETE A #TuLugarSeguro',
    newsletterSubtitle: 'Sé el primero en conocer ofertas, eventos y recursos gratuitos de fitness',
    firstName: 'NOMBRE',
    lastName: 'APELLIDO',
    email: 'EMAIL',
    subscribe: 'SUSCRIBIRSE',
    
    // Mission Section
    ourMission: 'NUESTRA MISIÓN',
    missionSubtitle: 'Transformando Vidas a Través del Cardio Box',
    missionText1: 'En BNKR transformamos vidas a través del Cardio Box, ofreciendo entrenamientos personalizados en grupos reducidos que fusionan técnica, motivación y comunidad.',
    missionText2: 'Creamos un espacio seguro, dinámico y motivador, donde tanto adultos como niños encuentran la oportunidad de superar sus límites, fortalecer su confianza y disfrutar de una experiencia que impulsa su bienestar físico y emocional cada día.',
    missionText3: '',
    
    // Programs Section
    getTrainingResults: 'Clases',
    testimonial: 'La clase de Cardio Box es la experiencia insignia de BNKR.',
    testimonialAuthor: 'Está diseñada para combinar la energía del boxeo con la intensidad del entrenamiento funcional y el ritmo de la música.',
    cardioBoxing: 'Cardio Box en BNKR',
    cardioBoxingDesc: 'Objetivo: mejorar la condición física, quemar calorías, liberar estrés y, sobre todo, crear una hora que cambia el estado de ánimo y mejora el día.',
    groupTraining: 'Box Studio en BNKR',
    groupTrainingDesc: 'La clase de Box Studio está enfocada en el aprendizaje técnico del boxeo. A diferencia del Cardio Box, aquí no se busca solo quemar calorías, sino aprender y perfeccionar la técnica boxística. Objetivo: desarrollar habilidades reales de boxeo: defensa, golpeo, desplazamiento y coordinación.',
    personalTraining: 'Entrenamiento Personalizado',
    personalTrainingDesc: 'Sesiones uno a uno con nuestros entrenadores expertos. Obtén atención personalizada, planes de entrenamiento personalizados y resultados acelerados.',
    getStarted: 'COMIENZA',
    
    // Footer
    contact: 'Contacto',
    schedules: 'Horarios',
    monFri: 'Lun-Vie: 6:00 AM - 10:00 PM',
    satSun: 'Sáb-Dom: 7:00 AM - 8:00 PM',
    specialClasses: 'Clases especiales: 24/7',
    allRightsReserved: 'Todos los derechos reservados.',
    
    // Auth
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    name: 'Nombre',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    dontHaveAccount: '¿No tienes una cuenta?',
    
    // Messages
    subscribeSuccess: '¡Te has suscrito exitosamente!',
    subscribeError: 'Error al suscribirse. Intenta de nuevo.',
    pleaseCompleteFields: 'Por favor completa todos los campos',
    invalidEmail: 'Email inválido',
    thisFieldRequired: 'Este campo es requerido'
  },
  
  en: {
    // Navbar
    training: 'TRAINING',
    movement: 'MOVEMENT',
    apparel: 'APPAREL',
    joinMovement: 'JOIN THE MOVEMENT',
    
    // Hero Section
    revealingExcellence: 'MUSIC BOXING & FUNTIONAL CARDIO',
    joinTheMovement: 'JOIN THE MOVEMENT',
    getStartedToday: 'GET STARTED TODAY',
    joinNewsletter: 'JOIN #TuLugarSeguro',
    newsletterSubtitle: 'Be the first to hear about deals, events, & free fitness resources',
    firstName: 'FIRST NAME',
    lastName: 'LAST NAME',
    email: 'EMAIL',
    subscribe: 'SUBSCRIBE',
    
    // Mission Section
    ourMission: 'OUR MISSION',
    missionSubtitle: 'Transforming Lives Through Cardio Box',
    missionText1: 'At BNKR, we transform lives through Cardio Box, offering personalized training in small groups that combine technique, motivation, and community.',
    missionText2: 'We create a safe, dynamic, and empowering environment, where both adults and children can push their limits, build confidence, and enjoy an experience that enhances their physical and emotional well-being every day.',
    missionText3: '',
    
    // Programs Section
    getTrainingResults: 'Classes',
    testimonial: 'The Cardio Box class is BNKR\'s signature experience.',
    testimonialAuthor: 'It is designed to combine the energy of boxing with the intensity of functional training and the rhythm of music.',
    cardioBoxing: 'Cardio Box at BNKR',
    cardioBoxingDesc: 'Objective: improve physical condition, burn calories, release stress, and above all, create an hour that changes mood and improves the day.',
    groupTraining: 'Box Studio at BNKR',
    groupTrainingDesc: 'The Box Studio class is focused on the technical learning of boxing. Unlike Cardio Box, here the goal is not just to burn calories, but to learn and perfect boxing technique. Objective: develop real boxing skills: defense, striking, movement and coordination.',
    personalTraining: 'Personal Training',
    personalTrainingDesc: 'One-on-one sessions with our expert trainers. Get personalized attention, custom workout plans, and accelerated results.',
    getStarted: 'GET STARTED',
    
    // Footer
    contact: 'Contact',
    schedules: 'Schedules',
    monFri: 'Mon-Fri: 6:00 AM - 10:00 PM',
    satSun: 'Sat-Sun: 7:00 AM - 8:00 PM',
    specialClasses: 'Special classes: 24/7',
    allRightsReserved: 'All rights reserved.',
    
    // Auth
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    name: 'Name',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot your password?',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: 'Don\'t have an account?',
    
    // Messages
    subscribeSuccess: 'You have successfully subscribed!',
    subscribeError: 'Error subscribing. Try again.',
    pleaseCompleteFields: 'Please complete all fields',
    invalidEmail: 'Invalid email',
    thisFieldRequired: 'This field is required'
  }
}

export const t = (key: string, lang: 'es' | 'en' = 'es') => {
  return translations[lang][key as keyof typeof translations.es] || key
} 