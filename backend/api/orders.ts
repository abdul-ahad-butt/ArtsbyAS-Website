import { Hono } from 'hono'
import type { Bindings, Variables } from './types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Helper to generate AAS-XXXXX
function generateOrderCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `AAS-${code}`
}

app.post('/', async (c) => {
  const body = await c.req.json()
  const { customer_name, whatsapp_number, address, city, courier, canvas_id } = body

  if (!customer_name || !whatsapp_number || !address || !city || !courier || !canvas_id) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  // Generate a unique order code. (In a real app, we'd handle collisions, but D1 constraint will catch it)
  const orderCode = generateOrderCode()

  // Initially insert with an empty payment_screenshot_url (or a placeholder)
  // We'll update it once the screenshot is uploaded.
  try {
    const { results } = await c.env.DB.prepare(
      `INSERT INTO orders (order_code, customer_name, whatsapp_number, address, city, courier, canvas_id, payment_screenshot_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, '', 'pending_verification') RETURNING id, order_code`
    ).bind(orderCode, customer_name, whatsapp_number, address, city, courier, canvas_id).all()

    const order = results[0]

    return c.json({
      success: true,
      order,
      // Direct upload route for the screenshot
      uploadUrl: `/api/orders/${order.id}/upload`
    })
  } catch (error: any) {
    // Basic collision handling or foreign key failure
    return c.json({ error: error.message }, 500)
  }
})

// Direct upload route for the screenshot
app.put('/:id/upload', async (c) => {
  const id = c.req.param('id')
  
  const formData = await c.req.parseBody()
  const file = formData['screenshot'] as string | File
  
  if (!file) {
    return c.json({ error: 'No screenshot file provided' }, 400)
  }

  let screenshotUrl = ''

  if (typeof file === 'string' && file.startsWith('data:image')) {
    screenshotUrl = file
  } else if (typeof file !== 'string') {
    const fileExt = file.name.split('.').pop()
    const objectKey = `screenshots/order_${id}_${Date.now()}.${fileExt}`
    screenshotUrl = `/${objectKey}` 
  }
  
  // Update the order in D1
  await c.env.DB.prepare(
    `UPDATE orders SET payment_screenshot_url = ? WHERE id = ?`
  ).bind(screenshotUrl, id).run()

  return c.json({ success: true, screenshotUrl })
})
// Fetch order status by code
app.get('/:code', async (c) => {
  const code = c.req.param('code')
  
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT o.order_code, o.status, o.created_at, o.courier, c.title as canvas_title 
       FROM orders o 
       JOIN canvases c ON o.canvas_id = c.id 
       WHERE o.order_code = ?`
    ).bind(code).all()

    if (results.length === 0) {
      return c.json({ error: 'Order not found' }, 404)
    }

    return c.json({ success: true, order: results[0] })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

export default app
