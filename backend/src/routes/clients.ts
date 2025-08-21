import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import { adminMiddleware } from '../middlewares/admin';
import { UserController } from '../controllers/userController';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Aplicar middleware de admin a todas las rutas
router.use(adminMiddleware);

// GET /api/clients - Obtener todos los clientes
router.get('/', UserController.getAllClients);

// GET /api/clients/stats - Obtener estadísticas de clientes
router.get('/stats', UserController.getClientStats);

// GET /api/clients/:id - Obtener cliente por ID
router.get('/:id', UserController.getClientById);

// POST /api/clients - Crear nuevo cliente
router.post('/', UserController.createClient);

// PUT /api/clients/:id - Actualizar cliente existente
router.put('/:id', UserController.updateClient);

// DELETE /api/clients/:id - Eliminar cliente
router.delete('/:id', UserController.deleteClient);

export default router;
