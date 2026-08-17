import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

export default function Hero({ onExplore }: { onExplore: () => void }) {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center px-4 md:px-8 py-12 md:py-24 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-left"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
            Original Calligraphy & Canvases
          </h2>
          <p className="text-lg md:text-xl text-brand-charcoal/80 mb-10 font-light max-w-xl">
            Industrial vintage meets modern luxury. Discover hand-crafted artworks designed to transform your space.
          </p>
          <motion.button 
            onClick={onExplore}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-brand-accent text-white px-8 py-4 rounded-sm font-medium tracking-wide shadow-lg hover:bg-brand-espresso transition-all flex items-center justify-center space-x-2"
          >
            <span>Explore the Collection</span>
            <ArrowDown className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative w-full h-[300px] md:h-[500px]"
        >
          {/* Subtle decorative background block */}
          <div className="absolute inset-4 md:inset-8 bg-brand-border/50 rounded-sm transform translate-x-4 translate-y-4 -z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800" 
            alt="Featured Artwork" 
            className="w-full h-full object-cover rounded-sm shadow-xl"
          />
        </motion.div>
      </div>
    </section>
  )
}
