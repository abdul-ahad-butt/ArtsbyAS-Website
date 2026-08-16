import { Hono } from 'hono'
import type { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// POST /api/admin/canvases - create canvas and handle R2 image upload
app.post('/', async (c) => {
  const formData = await c.req.parseBody()
  
  const title = formData['title'] as string
  const description = formData['description'] as string
  const dimensions = formData['dimensions'] as string
  const price_pkr = parseInt(formData['price_pkr'] as string)
  const status = formData['status'] as string || 'available'
  const file = formData['image'] as File

  if (!title || !price_pkr) {
    return c.json({ error: 'Title and price are required' }, 400)
  }

  let imageUrl = null

  if (file && typeof file !== 'string') {
    const fileExt = file.name.split('.').pop()
    const objectKey = `canvases/canvas_${Date.now()}.${fileExt}`
    
    await c.env.R2_ASSETS.put(objectKey, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type,
      },
    })
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
  const file = formData['image'] as File

  // Basic update building (in real app, use a query builder)
  let updateParts = []
  let params = []

  if (title) { updateParts.push('title = ?'); params.push(title) }
  if (description) { updateParts.push('description = ?'); params.push(description) }
  if (dimensions) { updateParts.push('dimensions = ?'); params.push(dimensions) }
  if (price_pkr) { updateParts.push('price_pkr = ?'); params.push(price_pkr) }
  if (status) { updateParts.push('status = ?'); params.push(status) }

  if (file && typeof file !== 'string') {
    const fileExt = file.name.split('.').pop()
    const objectKey = `canvases/canvas_${Date.now()}.${fileExt}`
    await c.env.R2_ASSETS.put(objectKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    })
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
