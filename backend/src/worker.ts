import { Hono } from 'hono'
import { cors } from 'hono/cors'
import canvases from '../api/canvases'
import orders from '../api/orders'
import adminOrders from '../api/admin/orders'
import adminCanvases from '../api/admin/canvases'
import adminAuth from '../api/admin/auth'
import { authMiddleware } from '../api/middleware'
import type { Bindings, Variables } from '../api/types'

// Main app
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Allow cross-origin requests from the admin panel Pages deployment
app.use('/api/*', cors({
  origin: [
    'https://artsbyas-website-admin-panel.pages.dev',
    'http://localhost:5174',  // local admin dev server
  ],
  credentials: true,
}))


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

// For all other routes, pass the request to Cloudflare's native asset handler.
// With not_found_handling = "single-page-application" in wrangler.toml, it will 
// serve static files if they exist, and fallback to index.html for SPA routes.
app.get('*', async (c) => {
  // @ts-ignore - ASSETS is provided by Cloudflare Workers when [assets] binding is used
  return await c.env.ASSETS.fetch(c.req.raw)
})

export default app
