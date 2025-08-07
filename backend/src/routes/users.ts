import { Router } from 'express'
import { UserController } from '../controllers/userController'
import { authMiddleware } from '../middlewares/auth'
import { adminMiddleware } from '../middlewares/admin'
import { validateCreateUser, validateUpdateUser, validateChangePassword } from '../middlewares/validation'

const router = Router()

// Rutas públicas (solo para registro)
router.post('/register', validateCreateUser, UserController.createUser)

// Rutas protegidas (requieren autenticación)
router.use(authMiddleware)

// Rutas para todos los usuarios autenticados
router.get('/profile', UserController.getProfile)
router.put('/profile', validateUpdateUser, UserController.updateProfile)
router.put('/change-password', validateChangePassword, UserController.changePassword)

// Rutas para admins
router.use(adminMiddleware)

// Gestión de usuarios
router.post('/', validateCreateUser, UserController.createUser)
router.get('/', UserController.getAllUsers)
router.get('/stats', UserController.getUserStats)
router.get('/search', UserController.searchUsers)
router.get('/role/:role', UserController.getUsersByRole)
router.get('/active/:role', UserController.getActiveUsersByRole)
router.get('/:id', UserController.getUserById)
router.put('/:id', validateUpdateUser, UserController.updateUser)
router.put('/:id/toggle-status', UserController.toggleUserStatus)
router.delete('/:id', UserController.deleteUser)

export default router 