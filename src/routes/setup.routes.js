import { Router } from 'express'
import { findUserByUsername, createUser } from '../services/user.service.js'

const router = Router()

// One-time convenience endpoint to create a user 'evans' with password '123' and admin role.
// Accessing GET /setup/create-evans will create the user if it does not exist.
// IMPORTANT: This endpoint is intentionally unauthenticated for convenience. Remove it after use.
router.get('/create-evans', async (req, res) => {
  try {
    const existing = await findUserByUsername('evans')
    if (existing) return res.json({ ok: true, message: 'User evans already exists' })

    const u = await createUser({ username: 'evans', password: '123', role: 'admin' })
    return res.json({ ok: true, message: 'User evans created', user: { id: u.id, username: u.username, role: u.role } })
  } catch (err) {
    console.error('Setup create-evans error', err)
    res.status(500).json({ ok: false, message: 'failed to create user', error: err.message })
  }
})

export default router
