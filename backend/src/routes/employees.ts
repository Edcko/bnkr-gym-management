import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import { adminMiddleware } from '../middlewares/admin';
import { UserController } from '../controllers/userController';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Aplicar middleware de admin a todas las rutas
router.use(adminMiddleware);

// GET /api/employees - Obtener todos los empleados
router.get('/', UserController.getAllEmployees);

// GET /api/employees/stats - Obtener estadísticas de empleados
router.get('/stats', UserController.getEmployeeStats);

// GET /api/employees/:id - Obtener empleado por ID
router.get('/:id', UserController.getEmployeeById);

// POST /api/employees - Crear nuevo empleado
router.post('/', UserController.createEmployee);

// PUT /api/employees/:id - Actualizar empleado existente
router.put('/:id', UserController.updateEmployee);

// DELETE /api/employees/:id - Eliminar empleado
router.delete('/:id', UserController.deleteEmployee);

export default router;
