import { Router } from 'express'
import { ReservationController } from '../controllers/reservationController'
import { authMiddleware } from '../middlewares/auth'
import { instructorMiddleware } from '../middlewares/admin'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authMiddleware)

// Rutas para clientes
router.post('/', ReservationController.createReservation)
router.get('/user', ReservationController.getUserReservations)
router.get('/user/upcoming', ReservationController.getUpcomingReservations)
router.get('/user/past', ReservationController.getPastReservations)

// Ruta de estadísticas accesible para todos los usuarios autenticados
router.get('/stats', ReservationController.getReservationStats)

// Rutas con parámetros (deben ir DESPUÉS de rutas específicas)
router.get('/:id', ReservationController.getReservationById)
router.put('/:id', ReservationController.updateReservation)
router.put('/:id/cancel', ReservationController.cancelReservation)

// Rutas para instructores y admins
router.use(instructorMiddleware)

router.get('/', ReservationController.getAllReservations)
router.get('/class/:classId', ReservationController.getClassReservations)
router.get('/instructor/:instructorId', ReservationController.getInstructorReservations)
router.put('/:id/confirm', ReservationController.confirmReservation)
router.get('/availability/:classId', ReservationController.checkAvailability)

export default router 