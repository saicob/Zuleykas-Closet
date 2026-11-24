// User management removed. Provide harmless stubs so imports don't crash other code.
export async function listUsers(req, res) {
  res.status(404).json({ message: 'User system removed' })
}

export async function createUserController(req, res) {
  res.status(404).json({ message: 'User system removed' })
}

export async function updateUserController(req, res) {
  res.status(404).json({ message: 'User system removed' })
}

export async function deleteUserController(req, res) {
  res.status(404).json({ message: 'User system removed' })
}
