import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { 
  validateLogin, 
  validateRegister 
} from '../middlewares/validation';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Rutas públicas
router.post('/register', validateRegister, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/reset-password', AuthController.resetPassword);
router.post('/confirm-reset-password', AuthController.confirmResetPassword);

// Rutas protegidas
router.use(authMiddleware);
router.get('/profile', AuthController.getProfile);
router.put('/profile', AuthController.updateProfile);
router.put('/change-password', AuthController.changePassword);

export default router; 