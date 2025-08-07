import { Router } from 'express';
import { ClassController } from '../controllers/classController';
import { 
  validateCreateClass, 
  validateUpdateClass,
  validateIdParam,
  validatePagination 
} from '../middlewares/validation';
import { 
  authMiddleware, 
  instructorOrAdmin, 
  adminOnly 
} from '../middlewares/auth';

const router = Router();

// Rutas públicas
router.get('/', validatePagination, ClassController.getAllClasses);
router.get('/available', validatePagination, ClassController.getAvailableClasses);
router.get('/:id', validateIdParam, ClassController.getClassById);
router.get('/:classId/schedule', validateIdParam, ClassController.getClassSchedule);
router.get('/:classId/stats', validateIdParam, ClassController.getClassStats);

// Rutas protegidas
router.use(authMiddleware);

// Rutas para instructores y admins
router.post('/', instructorOrAdmin, validateCreateClass, ClassController.createClass);
router.put('/:id', instructorOrAdmin, validateUpdateClass, ClassController.updateClass);
router.delete('/:id', adminOnly, validateIdParam, ClassController.deleteClass);

// Rutas para horarios
router.post('/:classId/schedule', instructorOrAdmin, ClassController.createClassSchedule);
router.put('/schedule/:scheduleId', instructorOrAdmin, ClassController.updateClassSchedule);
router.delete('/schedule/:scheduleId', instructorOrAdmin, ClassController.deleteClassSchedule);

// Rutas para instructores
router.get('/instructor/:instructorId', validatePagination, ClassController.getClassesByInstructor);

export default router; 