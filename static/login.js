document.getElementById('loginBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim()
  const password = document.getElementById('password').value.trim()
  const msg = document.getElementById('msg')
  try {
    // Login functionality removed - redirect to home
    window.location.href = '/'
  } catch (err) {
    msg.style.display = 'block'
    msg.textContent = 'Error de conexión'
  }
})
