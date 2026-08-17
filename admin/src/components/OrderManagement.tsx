import { useState, useEffect } from 'react'
import type { Order } from '../../../shared/types'
import { fetchAdminOrders, verifyOrder, dispatchOrder } from '../lib/api-admin'
import { Loader2, X, Check, Truck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    load()
  }, [page, statusFilter])

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchAdminOrders(statusFilter, page)
      setOrders((data as any).orders || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_verification': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-sm uppercase">Pending</span>
      case 'verified': return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-sm uppercase">Verified</span>
      case 'dispatched': return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-sm uppercase">Dispatched</span>
      case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-sm uppercase">Rejected</span>
      default: return <span>{status}</span>
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto relative">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-espresso">Order Queue</h2>
        
        <div className="flex gap-4">
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="p-2 border border-brand-border rounded-sm bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="verified">Verified</option>
            <option value="dispatched">Dispatched</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-brand-border rounded-sm overflow-x-auto">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-espresso" /></div>
        ) : (
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-brand-surface border-b border-brand-border text-sm text-brand-charcoal/80 uppercase">
              <tr>
                <th className="p-4">Order Code</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">City</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr 
                  key={o.id} 
                  onClick={() => setSelectedOrder(o)}
                  className="border-b border-brand-border/50 hover:bg-brand-surface/50 transition-colors cursor-pointer"
                >
                  <td className="p-4 font-bold font-mono text-brand-espresso">{o.order_code}</td>
                  <td className="p-4 text-sm">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="font-medium">{o.customer_name}</div>
                    <div className="text-xs text-gray-500">{o.whatsapp_number}</div>
                  </td>
                  <td className="p-4 text-sm">{o.city}</td>
                  <td className="p-4">{getStatusBadge(o.status)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(p => p - 1)}
          className="px-4 py-2 border rounded-sm hover:bg-brand-surface disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm font-medium">Page {page}</span>
        <button 
          disabled={orders.length < 20} // Assuming 20 is limit
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 border rounded-sm hover:bg-brand-surface disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <VerificationModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
            onUpdated={() => { setSelectedOrder(null); load() }} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function VerificationModal({ order, onClose, onUpdated }: { order: Order, onClose: () => void, onUpdated: () => void }) {
  const [actionLoading, setActionLoading] = useState(false)

  const handleVerify = async (status: 'verified' | 'rejected') => {
    setActionLoading(true)
    try {
      await verifyOrder(order.id, status)
      onUpdated()
    } catch (e) {
      alert('Failed to update order status')
      setActionLoading(false)
    }
  }

  const handleDispatch = async () => {
    setActionLoading(true)
    try {
      await dispatchOrder(order.id)
      onUpdated()
    } catch (e) {
      alert('Failed to dispatch order')
      setActionLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-brand-espresso/80 backdrop-blur-sm cursor-pointer" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl rounded-sm"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-gray-100 text-brand-espresso transition-colors"><X className="w-5 h-5" /></button>
        
        <div className="w-full md:w-1/2 bg-gray-100 min-h-[40vh] flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white font-bold text-center">Payment Screenshot</div>
          <div className="flex-1 p-4 flex items-center justify-center relative bg-brand-border/30">
            {order.payment_screenshot_url ? (
              <a href={order.payment_screenshot_url} target="_blank" rel="noreferrer" className="block w-full h-full">
                <img src={order.payment_screenshot_url} alt="Payment" className="w-full h-full object-contain cursor-zoom-in" />
              </a>
            ) : (
              <span className="text-gray-500 font-medium">No screenshot uploaded</span>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <h3 className="text-2xl font-mono font-bold text-brand-espresso mb-6">{order.order_code}</h3>
          
          <div className="space-y-4 mb-8 flex-1">
            <div><span className="text-sm text-gray-500 block uppercase tracking-wider mb-1">Customer Name</span><span className="font-medium">{order.customer_name}</span></div>
            <div><span className="text-sm text-gray-500 block uppercase tracking-wider mb-1">WhatsApp Number</span><span className="font-medium">{order.whatsapp_number}</span></div>
            <div><span className="text-sm text-gray-500 block uppercase tracking-wider mb-1">Address</span><span className="font-medium">{order.address}</span></div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-sm text-gray-500 block uppercase tracking-wider mb-1">City</span><span className="font-medium">{order.city}</span></div>
              <div><span className="text-sm text-gray-500 block uppercase tracking-wider mb-1">Courier</span><span className="font-medium">{order.courier}</span></div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex gap-4">
            {order.status === 'pending_verification' && (
              <>
                <button 
                  onClick={() => handleVerify('rejected')}
                  disabled={actionLoading}
                  className="flex-1 py-3 border border-red-500 text-red-600 rounded-sm font-bold hover:bg-red-50 transition-colors"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleVerify('verified')}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-brand-espresso text-white rounded-sm font-bold hover:bg-brand-charcoal transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" /> Verify Payment
                </button>
              </>
            )}

            {order.status === 'verified' && (
              <button 
                onClick={handleDispatch}
                disabled={actionLoading}
                className="w-full py-3 bg-green-700 text-white rounded-sm font-bold hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
              >
                <Truck className="w-5 h-5" /> Mark Dispatched
              </button>
            )}

            {(order.status === 'dispatched' || order.status === 'rejected') && (
              <div className="w-full py-3 bg-gray-100 text-gray-500 text-center font-medium rounded-sm">
                No further actions available ({order.status})
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
