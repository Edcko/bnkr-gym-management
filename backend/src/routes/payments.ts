import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import { adminMiddleware } from '../middlewares/admin';
import { 
  getAllPayments, 
  getPaymentById, 
  createPayment, 
  updatePayment, 
  deletePayment, 
  getPaymentStats 
} from '../controllers/paymentController';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Aplicar middleware de admin a todas las rutas
router.use(adminMiddleware);

// GET /api/payments - Obtener todos los pagos
router.get('/', getAllPayments);

// GET /api/payments/stats - Obtener estadísticas de pagos
router.get('/stats', getPaymentStats);

// GET /api/payments/:id - Obtener pago por ID
router.get('/:id', getPaymentById);

// POST /api/payments - Crear nuevo pago
router.post('/', createPayment);

// PUT /api/payments/:id - Actualizar pago existente
router.put('/:id', updatePayment);

// DELETE /api/payments/:id - Eliminar pago
router.delete('/:id', deletePayment);

export default router;
