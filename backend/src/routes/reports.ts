import { Router } from 'express'
import { ReportsController } from '../controllers/reportsController'
import { authMiddleware } from '../middlewares/auth'
import { adminMiddleware } from '../middlewares/admin'

const router = Router()

// Todas las rutas requieren autenticación y permisos de admin
router.use(authMiddleware)
router.use(adminMiddleware)

// GET /api/reports/overview - Obtener reporte general consolidado
router.get('/overview', ReportsController.getOverviewReport)

// GET /api/reports/revenue - Obtener reporte de ingresos
router.get('/revenue', ReportsController.getRevenueReport)

// GET /api/reports/memberships - Obtener reporte de membresías
router.get('/memberships', ReportsController.getMembershipReport)

// GET /api/reports/classes - Obtener reporte de clases
router.get('/classes', ReportsController.getClassReport)

// GET /api/reports/users - Obtener reporte de usuarios
router.get('/users', ReportsController.getUserReport)

export default router
