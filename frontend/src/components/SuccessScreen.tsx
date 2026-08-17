import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

export default function SuccessScreen({ 
  orderCode, 
  onClose 
}: { 
  orderCode: string | null, 
  onClose: () => void 
}) {
  if (!orderCode) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-brand-background">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full text-center flex flex-col items-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <CheckCircle2 className="w-20 h-20 text-brand-accent mb-6" />
        </motion.div>
        
        <h2 className="text-4xl font-serif font-bold text-brand-espresso mb-8">Thank You!</h2>
        
        <div className="bg-brand-surface border border-brand-border p-8 rounded-sm shadow-sm mb-10 text-brand-charcoal leading-relaxed text-lg w-full">
          Your order is placed successfully! This is your product code: <strong className="text-brand-espresso font-bold tracking-wider">{orderCode}</strong>. We are verifying your payment. You will receive your canvas within 1 to 7 business working days via your preferred courier.
        </div>

        <button 
          onClick={onClose}
          className="bg-brand-espresso text-brand-background px-8 py-3 rounded-sm font-medium tracking-wide shadow-sm hover:bg-brand-charcoal transition-colors"
        >
          Return to Gallery
        </button>
      </motion.div>
    </div>
  )
}
