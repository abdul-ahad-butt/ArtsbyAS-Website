import { Hono } from 'hono'
import type { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET /api/admin/canvases - paginated list (reuse similar logic to public, but maybe with more info)
app.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '10')
    const offset = (page - 1) * limit

    let query = 'SELECT * FROM canvases ORDER BY created_at DESC LIMIT ? OFFSET ?'
    let countQuery = 'SELECT COUNT(*) as total FROM canvases'

    let stmt1 = c.env.DB.prepare(query).bind(limit, offset)
    let stmt2 = c.env.DB.prepare(countQuery)

    const [{ results }, { results: countResults }] = await c.env.DB.batch([stmt1, stmt2])

    return c.json({
      canvases: results,
      total: (countResults[0] as any).total,
      page,
      limit
    })
  } catch (e: any) {
    return c.json({ error: e.message || 'Unknown error in admin canvases GET' }, 500)
  }
})

// POST /api/admin/canvases - create canvas and handle R2 image upload
app.post('/', async (c) => {
  const formData = await c.req.parseBody()
  
  const title = formData['title'] as string
  const description = formData['description'] as string
  const dimensions = formData['dimensions'] as string
  const price_pkr = parseInt(formData['price_pkr'] as string)
  const status = formData['status'] as string || 'available'
  const file = formData['image'] as string | File

  if (!title || !price_pkr) {
    return c.json({ error: 'Title and price are required' }, 400)
  }

  let imageUrl = null

  if (typeof file === 'string' && file.startsWith('data:image')) {
    imageUrl = file
  } else if (file && typeof file !== 'string') {
    // legacy/stub for testing
    const fileExt = file.name.split('.').pop()
    const objectKey = `canvases/canvas_${Date.now()}.${fileExt}`
    imageUrl = `/${objectKey}`
  }

  const { success } = await c.env.DB.prepare(
    `INSERT INTO canvases (title, description, dimensions, price_pkr, image_url, status) VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(title, description, dimensions, price_pkr, imageUrl, status).run()

  if (!success) return c.json({ error: 'Failed to insert canvas' }, 500)
  return c.json({ success: true })
})

// PATCH /api/admin/canvases/:id - update canvas
app.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const formData = await c.req.parseBody()
  
  const title = formData['title'] as string
  const description = formData['description'] as string
  const dimensions = formData['dimensions'] as string
  const price_pkr = formData['price_pkr'] ? parseInt(formData['price_pkr'] as string) : undefined
  const status = formData['status'] as string
  const file = formData['image'] as string | File

  // Basic update building (in real app, use a query builder)
  let updateParts = []
  let params = []

  if (title) { updateParts.push('title = ?'); params.push(title) }
  if (description) { updateParts.push('description = ?'); params.push(description) }
  if (dimensions) { updateParts.push('dimensions = ?'); params.push(dimensions) }
  if (price_pkr) { updateParts.push('price_pkr = ?'); params.push(price_pkr) }
  if (status) { updateParts.push('status = ?'); params.push(status) }

  if (typeof file === 'string' && file.startsWith('data:image')) {
    updateParts.push('image_url = ?')
    params.push(file)
  } else if (file && typeof file !== 'string') {
    const fileExt = file.name.split('.').pop()
    const objectKey = `canvases/canvas_${Date.now()}.${fileExt}`
    // Stubbed upload: just save the path
    updateParts.push('image_url = ?')
    params.push(`/${objectKey}`)
  }

  if (updateParts.length === 0) return c.json({ error: 'No fields to update' }, 400)

  const query = `UPDATE canvases SET ${updateParts.join(', ')} WHERE id = ?`
  params.push(id)

  const { success } = await c.env.DB.prepare(query).bind(...params).run()
  
  if (!success) return c.json({ error: 'Failed to update' }, 500)
  return c.json({ success: true })
})

// DELETE /api/admin/canvases/:id
app.delete('/:id', async (c) => {
  const id = c.req.param('id')
  // Usually better to just mark as hidden, but hard delete if required:
  const { success } = await c.env.DB.prepare('DELETE FROM canvases WHERE id = ?').bind(id).run()
  if (!success) return c.json({ error: 'Failed to delete' }, 500)
  return c.json({ success: true })
})

export default app
