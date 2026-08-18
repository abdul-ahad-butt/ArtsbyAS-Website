import { Hono } from 'hono'
import type { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET /api/admin/orders - paginated, filterable by status
app.get('/', async (c) => {
  try {
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

    let stmt1 = c.env.DB.prepare(query)
    if (params.length > 0) stmt1 = stmt1.bind(...params)

    let stmt2 = c.env.DB.prepare(countQuery)
    if (countParams.length > 0) stmt2 = stmt2.bind(...countParams)

    const [{ results }, { results: countResults }] = await c.env.DB.batch([stmt1, stmt2])

    return c.json({
      orders: results,
      total: (countResults[0] as any).total,
      page,
      limit
    })
  } catch (e: any) {
    return c.json({ error: e.message || 'Unknown error in orders GET' }, 500)
  }
})

// PATCH /api/admin/orders/:id/verify - accepts verified or rejected
app.patch('/:id/verify', async (c) => {
  try {
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
  } catch (e: any) {
    return c.json({ error: e.message || 'Unknown error in verify order' }, 500)
  }
})

// PATCH /api/admin/orders/:id/dispatch - only valid from verified status
app.patch('/:id/dispatch', async (c) => {
  try {
    const id = c.req.param('id')

    const { success } = await c.env.DB.prepare(
      `UPDATE orders SET status = 'dispatched' WHERE id = ? AND status = 'verified'`
    ).bind(id).run()

    if (!success) {
      return c.json({ error: 'Failed to dispatch order or order not in verified state' }, 400)
    }

    return c.json({ success: true })
  } catch (e: any) {
    return c.json({ error: e.message || 'Unknown error in dispatch order' }, 500)
  }
})

// DELETE /api/admin/orders/:id
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { success } = await c.env.DB.prepare(
      `DELETE FROM orders WHERE id = ?`
    ).bind(id).run()

    if (!success) {
      return c.json({ error: 'Failed to delete order' }, 400)
    }

    return c.json({ success: true })
  } catch (e: any) {
    return c.json({ error: e.message || 'Unknown error in delete order' }, 500)
  }
})

// POST /api/admin/orders/bulk-delete
app.post('/bulk-delete', async (c) => {
  try {
    const body = await c.req.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return c.json({ error: 'Invalid or empty ids array' }, 400)
    }

    // D1 bulk operations using parameters
    const placeholders = ids.map(() => '?').join(',')
    const { success } = await c.env.DB.prepare(
      `DELETE FROM orders WHERE id IN (${placeholders})`
    ).bind(...ids).run()

    if (!success) {
      return c.json({ error: 'Failed to bulk delete orders' }, 400)
    }

    return c.json({ success: true })
  } catch (e: any) {
    return c.json({ error: e.message || 'Unknown error in bulk delete orders' }, 500)
  }
})

export default app
