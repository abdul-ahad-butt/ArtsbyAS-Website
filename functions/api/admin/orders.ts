import { Hono } from 'hono'
import { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET /api/admin/orders - paginated, filterable by status
app.get('/', async (c) => {
  const status = c.req.query('status')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '10')
  const offset = (page - 1) * limit

  let query = 'SELECT * FROM orders'
  const params: any[] = []

  if (status) {
    query += ' WHERE status = ?'
    params.push(status)
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  let countQuery = 'SELECT COUNT(*) as total FROM orders'
  const countParams: any[] = []
  if (status) {
    countQuery += ' WHERE status = ?'
    countParams.push(status)
  }

  const [{ results }, { results: countResults }] = await c.env.DB.batch([
    c.env.DB.prepare(query).bind(...params),
    c.env.DB.prepare(countQuery).bind(...countParams)
  ])

  return c.json({
    orders: results,
    total: (countResults[0] as any).total,
    page,
    limit
  })
})

// PATCH /api/admin/orders/:id/verify - accepts verified or rejected
app.patch('/:id/verify', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { status } = body // 'verified' or 'rejected'

  if (status !== 'verified' && status !== 'rejected') {
    return c.json({ error: 'Invalid status. Must be verified or rejected' }, 400)
  }

  const verifiedAt = status === 'verified' ? new Date().toISOString() : null

  const { success } = await c.env.DB.prepare(
    `UPDATE orders SET status = ?, verified_at = ? WHERE id = ? AND status = 'pending_verification'`
  ).bind(status, verifiedAt, id).run()

  if (!success) {
    return c.json({ error: 'Failed to verify order or order not in pending state' }, 400)
  }

  return c.json({ success: true })
})

// PATCH /api/admin/orders/:id/dispatch - only valid from verified status
app.patch('/:id/dispatch', async (c) => {
  const id = c.req.param('id')

  const { success } = await c.env.DB.prepare(
    `UPDATE orders SET status = 'dispatched' WHERE id = ? AND status = 'verified'`
  ).bind(id).run()

  if (!success) {
    return c.json({ error: 'Failed to dispatch order or order not in verified state' }, 400)
  }

  return c.json({ success: true })
})

export default app
