import { Hono } from 'hono'
import { Bindings, Variables } from './types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM canvases WHERE status != 'hidden' ORDER BY created_at DESC"
  ).all()
  
  return c.json({ canvases: results })
})

export default app
