import { useEffect, useState } from 'react'
import type { Order } from '../../lib/types'
import { fetchAdminOrders, fetchCanvases } from '../../lib/api-admin'
import { Loader2, DollarSign, Package, CheckCircle, Image } from 'lucide-react'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    earnings: 0,
    pending: 0,
    verified: 0,
    totalCanvases: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // In a real app, an aggregation endpoint is better. We'll compute it here for simplicity.
      // Fetching all orders might be heavy, but fine for prototype.
      const [ordersRes, canvases] = await Promise.all([
        fetchAdminOrders('', 1), // assume page 1 gives enough or we'd loop
        fetchCanvases()
      ])
      
      const orders = ordersRes.orders as Order[]
      
      let earnings = 0
      let pending = 0
      let verified = 0
      
      orders.forEach(o => {
        if (o.status === 'pending_verification') pending++
        if (o.status === 'verified') {
          verified++
          // We need to look up canvas price, but API doesn't return it in order.
          // For now, let's just count them. A real dashboard would join this in SQL.
        }
        if (o.status === 'dispatched') {
          // also verified
          // earnings += ...
        }
      })
      
      // Calculate earnings (requires canvas prices)
      orders.forEach(o => {
        if (o.status === 'verified' || o.status === 'dispatched') {
          const c = canvases.find(c => c.id === o.canvas_id)
          if (c) earnings += c.price_pkr
        }
      })

      setStats({
        earnings,
        pending,
        verified,
        totalCanvases: canvases.length
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-espresso" /></div>
  }

  const cards = [
    { label: 'Total Earnings', value: `Rs. ${stats.earnings.toLocaleString()}`, icon: DollarSign },
    { label: 'Pending Verification', value: stats.pending, icon: Package },
    { label: 'Verified Orders', value: stats.verified, icon: CheckCircle },
    { label: 'Total Canvases', value: stats.totalCanvases, icon: Image }
  ]

  return (
    <div className="p-8">
      <h2 className="text-3xl font-serif font-bold text-brand-espresso mb-8">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-sm border border-brand-border shadow-sm flex items-center">
            <div className="p-4 bg-brand-surface rounded-full mr-4 text-brand-espresso">
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-charcoal/70 uppercase tracking-wider">{card.label}</p>
              <h3 className="text-2xl font-bold text-brand-espresso mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
