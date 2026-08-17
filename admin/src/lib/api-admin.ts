export async function adminLogin(username: string, password: string) {
  const res = await fetch('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) throw new Error('Login failed')
  return res.json()
}

export async function adminLogout() {
  await fetch('/api/admin/auth/logout', { method: 'POST' })
}

export async function checkAuth() {
  const res = await fetch('/api/admin/auth/me')
  if (!res.ok) throw new Error('Unauthorized')
  return res.json()
}

export async function fetchAdminOrders(status?: string, page = 1) {
  const url = new URL('/api/admin/orders', window.location.origin)
  if (status) url.searchParams.append('status', status)
  url.searchParams.append('page', page.toString())
  
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch orders')
  return res.json()
}

export async function verifyOrder(id: number, status: 'verified' | 'rejected') {
  const res = await fetch(`/api/admin/orders/${id}/verify`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  if (!res.ok) throw new Error('Failed to verify order')
  return res.json()
}

export async function dispatchOrder(id: number) {
  const res = await fetch(`/api/admin/orders/${id}/dispatch`, {
    method: 'PATCH',
  })
  if (!res.ok) throw new Error('Failed to dispatch order')
  return res.json()
}

export async function saveCanvas(data: any, file?: File | null, id?: number) {
  const formData = new FormData()
  formData.append('title', data.title)
  formData.append('description', data.description || '')
  formData.append('dimensions', data.dimensions || '')
  formData.append('price_pkr', data.price_pkr)
  formData.append('status', data.status)
  if (file) formData.append('image', file)

  const url = id ? `/api/admin/canvases/${id}` : '/api/admin/canvases'
  const method = id ? 'PATCH' : 'POST'

  const res = await fetch(url, {
    method,
    body: formData
  })

  if (!res.ok) throw new Error('Failed to save canvas')
  return res.json()
}

// Re-use fetchCanvases from public API for listing in admin
export { fetchCanvases } from '../../../frontend/src/lib/api'
