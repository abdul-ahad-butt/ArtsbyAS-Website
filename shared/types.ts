export type Canvas = {
  id: number
  title: string
  description: string | null
  dimensions: string | null
  price_pkr: number
  image_url: string | null
  status: 'available' | 'sold' | 'hidden'
  created_at: string
}

export type Order = {
  id: number
  order_code: string
  customer_name: string
  whatsapp_number: string
  address: string
  city: string
  courier: string
  canvas_id: number
  payment_screenshot_url: string
  status: 'pending_verification' | 'verified' | 'rejected' | 'dispatched'
  created_at: string
  verified_at: string | null
}
