import { Router } from 'express'
import { login, register, me } from '../controllers/auth.controllers.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/login', login)
// register protected to admin only
router.post('/register', requireAuth, requireRole('admin'), register)
router.get('/me', requireAuth, me)

export default router
