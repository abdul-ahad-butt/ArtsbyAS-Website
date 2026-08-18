import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { fetchOrderStatus } from '../lib/api'

export default function SuccessScreen({ 
  orderCode, 
  onClose 
}: { 
  orderCode: string | null, 
  onClose: () => void 
}) {
  const [orderStatus, setOrderStatus] = useState<'pending_verification' | 'verified' | 'rejected'>('pending_verification')

  useEffect(() => {
    if (!orderCode) return
    if (orderStatus !== 'pending_verification') return

    const interval = setInterval(async () => {
      try {
        const order = await fetchOrderStatus(orderCode)
        if (order && order.status) {
          if (order.status === 'verified' || order.status === 'rejected') {
            setOrderStatus(order.status)
          }
        }
      } catch (e) {
        console.error("Error polling order status:", e)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [orderCode, orderStatus])

  if (!orderCode) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-brand-background">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full text-center flex flex-col items-center"
      >
        {orderStatus === 'pending_verification' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <Loader2 className="w-20 h-20 text-brand-accent mb-6 animate-spin" />
            </motion.div>
            
            <h2 className="text-4xl font-serif font-bold text-brand-espresso mb-8">Verification in Progress</h2>
            
            <div className="bg-brand-surface border border-brand-border p-8 rounded-sm shadow-sm mb-10 text-brand-charcoal leading-relaxed text-lg w-full">
              Please wait, our team is verifying your payment screenshot. <strong className="text-brand-espresso">Do not close this window.</strong>
            </div>
          </>
        )}

        {orderStatus === 'verified' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <CheckCircle2 className="w-20 h-20 text-green-600 mb-6" />
            </motion.div>
            
            <h2 className="text-4xl font-serif font-bold text-brand-espresso mb-8">Thank You!</h2>
            
            <div className="bg-brand-surface border border-green-200 bg-green-50/50 p-8 rounded-sm shadow-sm mb-10 text-brand-charcoal leading-relaxed text-lg w-full">
              Your order is placed successfully! This is your product code: <strong className="text-brand-espresso font-bold tracking-wider">{orderCode}</strong>.<br/><br/>
              You will receive your canvas within 1 to 7 business working days via your preferred courier.
            </div>

            <button 
              onClick={onClose}
              className="bg-brand-espresso text-brand-background px-8 py-3 rounded-sm font-medium tracking-wide shadow-sm hover:bg-brand-charcoal transition-colors"
            >
              Return to Gallery
            </button>
          </>
        )}

        {orderStatus === 'rejected' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <XCircle className="w-20 h-20 text-red-600 mb-6" />
            </motion.div>
            
            <h2 className="text-4xl font-serif font-bold text-brand-espresso mb-8">Payment Rejected</h2>
            
            <div className="bg-brand-surface border border-red-200 bg-red-50/50 p-8 rounded-sm shadow-sm mb-10 text-brand-charcoal leading-relaxed text-lg w-full">
              Your payment was rejected by the admin. Please verify your payment details and try again or contact support.
            </div>

            <button 
              onClick={onClose}
              className="bg-brand-espresso text-brand-background px-8 py-3 rounded-sm font-medium tracking-wide shadow-sm hover:bg-brand-charcoal transition-colors"
            >
              Close
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
