import type { Canvas } from '../../lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function ProductModal({ 
  canvas, 
  onClose, 
  onPurchase 
}: { 
  canvas: Canvas | null, 
  onClose: () => void,
  onPurchase: (canvas: Canvas) => void
}) {
  if (!canvas) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-espresso/80 backdrop-blur-sm cursor-pointer"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-brand-background w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl rounded-sm overflow-hidden"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-brand-background/80 hover:bg-brand-surface rounded-full text-brand-espresso transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-full md:w-1/2 bg-brand-border/30 min-h-[50vh] flex items-center justify-center">
            {canvas.image_url ? (
              <img 
                src={canvas.image_url} 
                alt={canvas.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-brand-charcoal/50 font-serif text-xl">No Image</span>
            )}
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">{canvas.title}</h2>
              <p className="text-2xl text-brand-accent font-medium mb-6">Rs. {canvas.price_pkr.toLocaleString()}</p>
              
              <div className="space-y-4 text-brand-charcoal/80 mb-8 border-t border-b border-brand-border py-6">
                <div>
                  <span className="font-semibold text-brand-espresso text-sm uppercase tracking-wider block mb-1">Dimensions</span>
                  <p>{canvas.dimensions || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-semibold text-brand-espresso text-sm uppercase tracking-wider block mb-1">Description</span>
                  <p className="whitespace-pre-line leading-relaxed">{canvas.description || 'No description provided.'}</p>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <button
                onClick={() => onPurchase(canvas)}
                className="w-full bg-brand-espresso text-brand-background py-4 font-medium tracking-wider uppercase shadow-md hover:bg-brand-charcoal transition-colors rounded-sm"
              >
                Purchase this Canvas
              </button>
              <p className="text-center text-xs text-brand-charcoal/60 mt-4">
                Payments are processed manually via Bank Transfer, JazzCash, or EasyPaisa.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
