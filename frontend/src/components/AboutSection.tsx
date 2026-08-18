import { motion } from 'framer-motion'

export default function AboutSection() {
  return (
    <div id="about" className="w-full bg-brand-surface border-t border-brand-border">
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-serif font-bold text-brand-espresso mb-8"
        >
          About ArtbyAS
        </motion.h2>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="space-y-6 text-brand-charcoal/80 leading-relaxed text-lg"
        >
          <p>
            Welcome to ArtbyAS. We are dedicated to creating timeless, handcrafted calligraphy and original canvases that bring elegance, heritage, and inspiration to any space.
          </p>
          <p>
            Every piece is thoughtfully designed with a deep passion for artistic expression and a strict commitment to quality. Our mission is to transform blank canvases into meaningful art that resonates with our collectors, tells a unique story, and elevates everyday surroundings.
          </p>
          <p>
            Whether you are looking for a striking centerpiece or a subtle touch of elegance, our collections are crafted to leave a lasting impression. Thank you for supporting original art.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
