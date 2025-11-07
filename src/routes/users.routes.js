import { Router } from 'express'
import { listUsers, createUserController, updateUserController, deleteUserController } from '../controllers/users.controllers.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

const router = Router()

// All user management actions restricted to admin
router.use(requireAuth, requireRole('admin'))

router.get('/', listUsers)
router.post('/', createUserController)
router.put('/:id', updateUserController)
router.delete('/:id', deleteUserController)

export default router
