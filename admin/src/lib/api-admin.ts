import { compressImageToBase64 } from '../../../shared/image-utils'

// Backend Worker URL.
// VITE_API_BASE_URL is baked in at build time by Cloudflare Pages env vars.
// Falls back to the hardcoded workers.dev URL so it works even without the env var.
const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)
  ?? 'https://artsbyas-website.abdulahadbutt420.workers.dev'

const TOKEN_KEY = 'admin_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

function authHeader(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function adminLogin(username: string, password: string) {
  const res = await fetch(`${BASE}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('Invalid credentials')
  const data = await res.json() as { token: string; username: string }
  localStorage.setItem(TOKEN_KEY, data.token)
  return data
}

export async function adminLogout() {
  await fetch(`${BASE}/api/admin/auth/logout`, {
    method: 'POST',
    headers: authHeader(),
  })
  localStorage.removeItem(TOKEN_KEY)
}

export async function checkAuth() {
  const token = getToken()
  if (!token) throw new Error('Unauthorized')
  const res = await fetch(`${BASE}/api/admin/auth/me`, {
    headers: authHeader(),
  })
  if (!res.ok) {
    localStorage.removeItem(TOKEN_KEY)
    throw new Error('Unauthorized')
  }
  return res.json()
}

export async function fetchAdminOrders(status?: string, page = 1) {
  const url = new URL(`${BASE}/api/admin/orders`)
  if (status) url.searchParams.append('status', status)
  url.searchParams.append('page', page.toString())
  const res = await fetch(url.toString(), { headers: authHeader() })
  if (!res.ok) throw new Error('Failed to fetch orders')
  return res.json()
}

export async function verifyOrder(id: number, status: 'verified' | 'rejected') {
  const res = await fetch(`${BASE}/api/admin/orders/${id}/verify`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to verify order')
  return res.json()
}

export async function dispatchOrder(id: number) {
  const res = await fetch(`${BASE}/api/admin/orders/${id}/dispatch`, {
    method: 'PATCH',
    headers: authHeader(),
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
  if (file) {
    const base64 = await compressImageToBase64(file)
    formData.append('image', base64)
  }

  const url = id ? `${BASE}/api/admin/canvases/${id}` : `${BASE}/api/admin/canvases`
  const method = id ? 'PATCH' : 'POST'

  const res = await fetch(url, { method, headers: authHeader(), body: formData })
  if (!res.ok) throw new Error('Failed to save canvas')
  return res.json()
}

export async function fetchCanvases() {
  const res = await fetch(`${BASE}/api/canvases`)
  if (!res.ok) throw new Error('Failed to fetch canvases')
  const data = await res.json()
  return (data as any).canvases
}

export async function deleteCanvas(id: number) {
  const res = await fetch(`${BASE}/api/admin/canvases/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  if (!res.ok) throw new Error('Failed to delete canvas')
  return res.json()
}

export async function deleteOrder(id: number) {
  const res = await fetch(`${BASE}/api/admin/orders/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  if (!res.ok) throw new Error('Failed to delete order')
  return res.json()
}

export async function bulkDeleteOrders(ids: number[]) {
  const res = await fetch(`${BASE}/api/admin/orders/bulk-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error('Failed to bulk delete orders')
  return res.json()
}
