import { getSignedCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { Bindings, Variables } from '../types'

export const authMiddleware = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(async (c, next) => {
  // If the secret is not set yet, fail gracefully instead of crashing
  if (!c.env.ADMIN_SESSION_SECRET) {
    return c.json({ error: 'Server configuration error' }, 500)
  }

  const session = await getSignedCookie(c, c.env.ADMIN_SESSION_SECRET, 'admin_session')
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const { results } = await c.env.DB.prepare('SELECT id, username FROM admin_users WHERE username = ?')
    .bind(session)
    .all<{ id: number; username: string }>()
    
  if (results.length === 0) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  c.set('adminUser', results[0])
  await next()
})
