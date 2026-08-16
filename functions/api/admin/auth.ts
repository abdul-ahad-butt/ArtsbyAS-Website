import { Hono } from 'hono'
import { setSignedCookie, deleteCookie } from 'hono/cookie'
import { Bindings, Variables } from '../types'
import { authMiddleware } from '../middleware'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.post('/login', async (c) => {
  const { username, password } = await c.req.json()

  if (!username || !password) {
    return c.json({ error: 'Username and password required' }, 400)
  }

  const { results } = await c.env.DB.prepare('SELECT id, password_hash FROM admin_users WHERE username = ?')
    .bind(username)
    .all<{ id: number; password_hash: string }>()

  if (results.length === 0) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const user = results[0]
  
  // In a real application, compare hashes using a library like bcrypt or Web Crypto API
  // For simplicity since auth is manual, assuming plain text or simple hash here.
  // We'll use a basic comparison. 
  if (user.password_hash !== password) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  await setSignedCookie(c, 'admin_session', username, c.env.ADMIN_SESSION_SECRET, {
    path: '/',
    secure: true,
    httpOnly: true,
    maxAge: 60 * 60 * 24 // 1 day
  })

  return c.json({ success: true })
})

app.post('/logout', async (c) => {
  deleteCookie(c, 'admin_session', { path: '/' })
  return c.json({ success: true })
})

// Quick check if authenticated
app.get('/me', authMiddleware, async (c) => {
  const user = c.get('adminUser')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  return c.json({ user })
})

export default app
