import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

export default function Hero({ onExplore }: { onExplore: () => void }) {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-3xl"
      >
        <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
          Original Calligraphy & Canvases
        </h2>
        <p className="text-lg md:text-2xl text-brand-charcoal/80 mb-10 font-light max-w-2xl mx-auto">
          Industrial vintage meets modern luxury. Discover hand-crafted artworks designed to transform your space.
        </p>
        <motion.button 
          onClick={onExplore}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-brand-espresso text-brand-background px-8 py-4 rounded-sm font-medium tracking-wide shadow-lg hover:bg-brand-charcoal transition-all flex items-center justify-center mx-auto space-x-2"
        >
          <span>Explore the Collection</span>
          <ArrowDown className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </section>
  )
}
