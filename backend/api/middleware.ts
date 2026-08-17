import { createMiddleware } from 'hono/factory'
import type { Bindings, Variables } from './types'
import { verifyToken } from './admin/token'

export const authMiddleware = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(async (c, next) => {
  if (!c.env.ADMIN_SESSION_SECRET) {
    return c.json({ error: 'Server configuration error' }, 500)
  }

  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const username = await verifyToken(auth.slice(7), c.env.ADMIN_SESSION_SECRET)
  if (!username) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('adminUser', { id: 0, username })
  await next()
})
