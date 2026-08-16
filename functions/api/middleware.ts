import { Hono } from 'hono'
import { getSignedCookie, setSignedCookie, deleteCookie } from 'hono/cookie'
import { Bindings, Variables } from '../types'

export const authMiddleware = new Hono<{ Bindings: Bindings; Variables: Variables }>()

authMiddleware.use('/*', async (c, next) => {
  const session = await getSignedCookie(c, c.env.ADMIN_SESSION_SECRET, 'admin_session')
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  // session contains the username
  const { results } = await c.env.DB.prepare('SELECT id, username FROM admin_users WHERE username = ?')
    .bind(session)
    .all<{ id: number; username: string }>()
    
  if (results.length === 0) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  c.set('adminUser', results[0])
  await next()
})
