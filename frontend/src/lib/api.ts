import type { Canvas } from '../../../shared/types'

export async function fetchCanvases(): Promise<Canvas[]> {
  const res = await fetch('/api/canvases')
  if (!res.ok) throw new Error('Failed to fetch canvases')
  const data = await res.json()
  return (data as any).canvases
}

export async function createOrder(orderData: any, file: File): Promise<{ success: boolean; order_code?: string; error?: string }> {
  try {
    // 1. Create the order
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error((err as any).error || 'Failed to create order')
    }

    const data = await res.json()
    const { uploadUrl, order } = data as any

    // 2. Upload the screenshot
    const formData = new FormData()
    formData.append('screenshot', file)

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      body: formData,
    })

    if (!uploadRes.ok) {
      // In a real app, we might need a rollback or retry mechanism here
      const err = await uploadRes.json()
      throw new Error((err as any).error || 'Failed to upload screenshot')
    }

    return { success: true, order_code: order.order_code }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
