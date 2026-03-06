import { httpJson } from './http.js'

export function apiLogin({ username, password }) {
  return httpJson('/api/login', {
    method: 'POST',
    body: { username, password },
  })
}

export function apiRegister({ name, email, phone, password }) {
  return httpJson('/api/register', {
    method: 'POST',
    body: { name, email, phone, password },
  })
}

export function apiMe({ token }) {
  return httpJson('/api/me', {
    method: 'GET',
    token,
  })
}

export function apiLogout({ token }) {
  return httpJson('/api/logout', {
    method: 'POST',
    token,
  })
}
