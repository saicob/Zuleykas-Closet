// Auth system removed - provide no-op stubs so existing imports don't fail
export function getToken(){ return null }
export function getUser(){ return null }
export function logout(){ window.location.href = '/' }
export function ensureRole(){ /* no-op since auth is removed */ }
export function authFetch(url, opts={}){ return fetch(url, opts) }
