import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import { adminMiddleware } from '../middlewares/admin';
import { 
  getAllItems, 
  getItemById, 
  createItem, 
  updateItem, 
  deleteItem, 
  getInventoryStats 
} from '../controllers/inventoryController';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Aplicar middleware de admin a todas las rutas
router.use(adminMiddleware);

// GET /api/inventory - Obtener todos los items
router.get('/', getAllItems);

// GET /api/inventory/stats - Obtener estadísticas del inventario
router.get('/stats', getInventoryStats);

// GET /api/inventory/:id - Obtener item por ID
router.get('/:id', getItemById);

// POST /api/inventory - Crear nuevo item
router.post('/', createItem);

// PUT /api/inventory/:id - Actualizar item existente
router.put('/:id', updateItem);

// DELETE /api/inventory/:id - Eliminar item
router.delete('/:id', deleteItem);

export default router; 