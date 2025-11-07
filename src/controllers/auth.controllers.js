// Authentication system removed. These endpoints are stubs to avoid runtime errors.
export async function login(req, res) {
  res.status(404).json({ message: 'Authentication system removed' })
}

export async function register(req, res) {
  res.status(404).json({ message: 'Authentication system removed' })
}

export async function me(req, res) {
  res.status(404).json({ message: 'Authentication system removed' })
}
