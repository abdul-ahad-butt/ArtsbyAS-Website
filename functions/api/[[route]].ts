import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { Bindings, Variables } from './types'

import canvases from './canvases'
import orders from './orders'
import adminOrders from './admin/orders'
import adminCanvases from './admin/canvases'
import adminAuth from './admin/auth'
import { authMiddleware } from './middleware'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>().basePath('/api')

app.get('/', (c) => {
  return c.json({ message: 'Hello from ArtbyAS API!' })
})

// Public Routes
app.route('/canvases', canvases)
app.route('/orders', orders)

// Admin Routes (Auth gated)
app.route('/admin/auth', adminAuth)

// Apply auth middleware to all other admin routes
const admin = new Hono<{ Bindings: Bindings; Variables: Variables }>()
admin.use('*', authMiddleware)
admin.route('/orders', adminOrders)
admin.route('/canvases', adminCanvases)
// Quick me route can be here or inside auth, since we put it in auth, we can just apply authMiddleware to auth/me if needed, 
// wait, auth/me requires authMiddleware. Let's move /me here or apply middleware selectively.
// Let's just mount the protected admin routes:
app.route('/admin', admin)

export const onRequest = handle(app)

