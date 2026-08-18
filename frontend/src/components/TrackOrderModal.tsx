import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Loader2 } from 'lucide-react'
import { fetchOrderStatus } from '../lib/api'

export default function TrackOrderModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const [orderCode, setOrderCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderData, setOrderData] = useState<any>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderCode.trim()) return

    setLoading(true)
    setError('')
    setOrderData(null)

    try {
      const data = await fetchOrderStatus(orderCode.trim().toUpperCase())
      setOrderData(data)
    } catch (err: any) {
      setError(err.message || 'Order not found. Please check your code.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_verification': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-bold rounded-sm uppercase tracking-wide">Pending Verification</span>
      case 'verified': return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded-sm uppercase tracking-wide">Verified - Processing</span>
      case 'dispatched': return <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-sm uppercase tracking-wide">Dispatched</span>
      case 'rejected': return <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-bold rounded-sm uppercase tracking-wide">Rejected</span>
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-bold rounded-sm uppercase tracking-wide">{status}</span>
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-espresso/90 backdrop-blur-md cursor-pointer"
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative bg-brand-background w-full max-w-md shadow-2xl rounded-sm overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-surface sticky top-0 z-10">
              <h2 className="text-xl font-serif font-bold text-brand-espresso">Track Order</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-brand-border/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8">
              <form onSubmit={handleSearch} className="mb-6 relative">
                <label className="block text-sm font-medium mb-2 text-brand-espresso">Enter Order Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    className="flex-1 p-3 border border-brand-border bg-white rounded-sm focus:outline-none focus:border-brand-accent uppercase font-mono" 
                    placeholder="AAS-XXXXX" 
                    required
                  />
                  <button 
                    type="submit"
                    disabled={loading || !orderCode.trim()}
                    className="px-4 py-3 bg-brand-espresso text-brand-background rounded-sm font-medium hover:bg-brand-charcoal transition-colors disabled:opacity-70 flex items-center justify-center"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </form>

              {orderData && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-brand-surface p-6 rounded-sm border border-brand-border"
                >
                  <div className="mb-4 text-center">
                    <p className="text-sm text-brand-charcoal/70 uppercase tracking-widest mb-1">Status</p>
                    {getStatusBadge(orderData.status)}
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-brand-border text-sm">
                    <div className="flex justify-between">
                      <span className="text-brand-charcoal/70">Order Date:</span>
                      <span className="font-medium text-brand-espresso">{new Date(orderData.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-charcoal/70">Canvas:</span>
                      <span className="font-medium text-brand-espresso">{orderData.canvas_title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-charcoal/70">Courier:</span>
                      <span className="font-medium text-brand-espresso">{orderData.courier}</span>
                    </div>
                  </div>
                  
                  {orderData.status === 'rejected' && (
                    <div className="mt-4 p-3 bg-red-50 text-red-800 text-sm rounded-sm border border-red-100 text-center">
                      Your order was rejected. Please contact support on WhatsApp for more details.
                    </div>
                  )}
                  {orderData.status === 'pending_verification' && (
                    <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-sm border border-yellow-100 text-center">
                      We are currently verifying your payment. This usually takes a few hours.
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
