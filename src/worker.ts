import { Hono } from 'hono'
import canvases from '../functions/api/canvases'
import orders from '../functions/api/orders'
import adminOrders from '../functions/api/admin/orders'
import adminCanvases from '../functions/api/admin/canvases'
import adminAuth from '../functions/api/admin/auth'
import { authMiddleware } from '../functions/api/middleware'
import { Bindings, Variables } from '../functions/api/types'

// Main app
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// API Routes
const api = new Hono<{ Bindings: Bindings; Variables: Variables }>()

api.get('/', (c) => {
  return c.json({ message: 'Hello from ArtbyAS API!' })
})

api.route('/canvases', canvases)
api.route('/orders', orders)
api.route('/admin/auth', adminAuth)

const admin = new Hono<{ Bindings: Bindings; Variables: Variables }>()
admin.use('*', authMiddleware)
admin.route('/orders', adminOrders)
admin.route('/canvases', adminCanvases)

api.route('/admin', admin)

// Mount API at /api
app.route('/api', api)

// For all other routes, serve the SPA index.html so React Router works
app.get('*', async (c) => {
  // @ts-ignore - ASSETS is provided by Cloudflare Workers when [assets] binding is used
  return await c.env.ASSETS.fetch(new Request(new URL('/', c.req.url)))
})

export default app
