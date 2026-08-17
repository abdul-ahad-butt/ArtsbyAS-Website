import { Hono } from 'hono'
import type { Bindings, Variables } from '../types'
import { createToken, verifyToken } from './token'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const { username, password } = body as { username?: string; password?: string }

  if (!username || !password) {
    return c.json({ error: 'Username and password required' }, 400)
  }

  // Validate against Worker secrets set in the Cloudflare dashboard
  if (!c.env.ADMIN_USERNAME || !c.env.ADMIN_PASSWORD || !c.env.ADMIN_SESSION_SECRET) {
    return c.json({ error: 'Server not configured' }, 500)
  }

  if (username !== c.env.ADMIN_USERNAME || password !== c.env.ADMIN_PASSWORD) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const token = await createToken(username, c.env.ADMIN_SESSION_SECRET)
  return c.json({ token, username })
})

app.post('/logout', async (c) => {
  // Token is stateless — client just discards it
  return c.json({ success: true })
})

// Returns current user if token is valid
app.get('/me', async (c) => {
  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const username = await verifyToken(auth.slice(7), c.env.ADMIN_SESSION_SECRET)
  if (!username) return c.json({ error: 'Unauthorized' }, 401)
  return c.json({ user: { username } })
})

export default app
