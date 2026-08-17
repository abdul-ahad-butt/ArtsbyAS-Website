import type { Canvas } from '../../../shared/types'
import { motion } from 'framer-motion'

export default function ArtworkGrid({ canvases, onSelect }: { canvases: Canvas[], onSelect: (c: Canvas) => void }) {
  if (canvases.length === 0) {
    return (
      <div className="py-20 text-center text-brand-charcoal/70">
        <p>No artworks available at the moment. Check back soon.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4 max-w-7xl mx-auto py-12">
      {canvases.map((canvas, index) => {
        const isSold = canvas.status === 'sold'
        
        return (
          <motion.div
            key={canvas.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`group cursor-pointer relative bg-brand-surface border border-brand-border rounded-sm overflow-hidden flex flex-col ${isSold ? 'opacity-70 grayscale-[50%]' : ''}`}
            onClick={() => !isSold && onSelect(canvas)}
            whileHover={!isSold ? { y: -4 } : {}}
          >
            <div className="aspect-[4/5] bg-brand-border/50 relative overflow-hidden">
              {canvas.image_url ? (
                <img 
                  src={canvas.image_url} 
                  alt={canvas.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-charcoal/40 font-serif">
                  No Image
                </div>
              )}
              {isSold && (
                <div className="absolute inset-0 bg-brand-espresso/20 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="bg-brand-background text-brand-espresso px-4 py-2 font-bold tracking-widest text-sm uppercase shadow-lg transform -rotate-12 border border-brand-espresso/20">
                    Sold Out
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold font-serif line-clamp-1">{canvas.title}</h3>
                <span className="text-brand-accent font-medium whitespace-nowrap ml-4">
                  Rs. {canvas.price_pkr.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-brand-charcoal/70 mb-4">{canvas.dimensions || 'Dimensions unavailable'}</p>
              <div className="mt-auto">
                <button 
                  disabled={isSold}
                  className={`w-full py-2 border text-sm font-medium transition-colors
                    ${isSold 
                      ? 'border-brand-border text-brand-charcoal/50 cursor-not-allowed' 
                      : 'border-brand-espresso text-brand-espresso hover:bg-brand-espresso hover:text-brand-background'
                    }`}
                >
                  {isSold ? 'Unavailable' : 'View Details'}
                </button>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
