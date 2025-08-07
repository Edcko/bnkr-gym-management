import { Router } from 'express'
import { MembershipController } from '../controllers/membershipController'
import { authMiddleware } from '../middlewares/auth'
import { adminMiddleware } from '../middlewares/admin'

const router = Router()

// Rutas públicas
router.get('/plans', MembershipController.getAvailablePlans)

// Rutas protegidas (requieren autenticación)
router.use(authMiddleware)

// Rutas para clientes
router.get('/active', MembershipController.getActiveMembership)
router.get('/user', MembershipController.getUserMemberships)
router.get('/has-active', MembershipController.hasActiveMembership)
router.get('/remaining-days', MembershipController.getRemainingDays)

// Rutas para admins
router.use(adminMiddleware)

router.post('/', MembershipController.createMembership)
router.get('/', MembershipController.getAllMemberships)
router.get('/stats', MembershipController.getMembershipStats)
router.get('/:id', MembershipController.getMembershipById)
router.put('/:id', MembershipController.updateMembership)
router.put('/:id/renew', MembershipController.renewMembership)
router.put('/:id/change-type', MembershipController.changeMembershipType)
router.put('/:id/cancel', MembershipController.cancelMembership)
router.put('/:id/freeze', MembershipController.freezeMembership)
router.post('/process-expired', MembershipController.processExpiredMemberships)

export default router 