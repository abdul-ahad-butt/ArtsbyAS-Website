import { useState, useEffect } from 'react'
import type { Canvas } from '../../shared/types'
import { fetchCanvases } from './lib/api'
import Hero from './components/Hero'
import ArtworkGrid from './components/ArtworkGrid'
import ProductModal from './components/ProductModal'
import CheckoutForm from './components/CheckoutForm'
import SuccessScreen from './components/SuccessScreen'
import TrackOrderModal from './components/TrackOrderModal'
import { Loader2, Menu, X, MessageCircle } from 'lucide-react'
import logo from './assets/logo/artbyas-wordmark-transparent.png'

function App() {
  const [canvases, setCanvases] = useState<Canvas[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false)

  const [selectedCanvas, setSelectedCanvas] = useState<Canvas | null>(null)
  const [purchasingCanvas, setPurchasingCanvas] = useState<Canvas | null>(null)
  const [orderCode, setOrderCode] = useState<string | null>(null)

  useEffect(() => {
    loadCanvases()
  }, [])

  const loadCanvases = async () => {
    try {
      const data = await fetchCanvases()
      // Filter out hidden canvases for the public storefront
      setCanvases(data.filter((c: Canvas) => c.status !== 'hidden'))
    } catch (err) {
      console.error(err)
      setError('Unable to load gallery. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleExplore = () => {
    setIsMobileMenuOpen(false)
    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handlePurchase = (canvas: Canvas) => {
    setSelectedCanvas(null)
    setPurchasingCanvas(canvas)
  }

  const handleCheckoutSuccess = (code: string) => {
    setPurchasingCanvas(null)
    setOrderCode(code)
    loadCanvases()
  }

  const handleSuccessClose = () => {
    setOrderCode(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-brand-border py-5 md:py-7 px-4 md:px-8 flex justify-between items-center bg-brand-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <a href="/" className="block">
          <img src={logo} alt="ArtbyAS" className="h-8 md:h-10 w-auto object-contain" />
        </a>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-brand-charcoal">
          <button onClick={handleExplore} className="hover:text-brand-accent transition-colors">Gallery</button>
          <a href="#" className="hover:text-brand-accent transition-colors">About</a>
          <button onClick={() => setIsTrackOrderOpen(true)} className="hover:text-brand-accent transition-colors">Track Order</button>
          <a href="https://wa.me/923000000000" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-brand-accent hover:text-brand-espresso transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="sr-only">WhatsApp</span>
          </a>
        </nav>

        {/* Mobile Nav Toggle */}
        <button 
          className="md:hidden p-2 text-brand-espresso"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Nav Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-brand-surface border-b border-brand-border absolute top-[73px] left-0 right-0 z-40 p-4 flex flex-col space-y-4 shadow-lg">
          <button onClick={handleExplore} className="text-left text-brand-charcoal hover:text-brand-accent font-medium py-2">Gallery</button>
          <a href="#" className="text-brand-charcoal hover:text-brand-accent font-medium py-2">About</a>
          <button onClick={() => { setIsMobileMenuOpen(false); setIsTrackOrderOpen(true) }} className="text-left text-brand-charcoal hover:text-brand-accent font-medium py-2">Track Order</button>
          <a href="https://wa.me/923000000000" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-brand-accent font-medium py-2">
            <MessageCircle className="w-5 h-5" />
            Contact us on WhatsApp
          </a>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        <Hero onExplore={handleExplore} />
        
        <div id="gallery" className="w-full bg-brand-background border-t border-brand-border">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h2 className="text-4xl font-serif font-bold text-brand-espresso mb-4">The Collection</h2>
            <p className="text-brand-charcoal/70 mb-12">Hand-painted originals available for purchase.</p>
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
              </div>
            ) : error ? (
              <div className="py-20 text-red-500 font-medium">{error}</div>
            ) : (
              <ArtworkGrid 
                canvases={canvases} 
                onSelect={(canvas) => setSelectedCanvas(canvas)} 
              />
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-12 text-center text-sm text-brand-charcoal/70 border-t border-brand-border bg-brand-surface">
        &copy; {new Date().getFullYear()} ArtbyAS. All rights reserved.
      </footer>

      <ProductModal 
        canvas={selectedCanvas} 
        onClose={() => setSelectedCanvas(null)} 
        onPurchase={handlePurchase}
      />
      
      <CheckoutForm 
        canvas={purchasingCanvas} 
        onClose={() => setPurchasingCanvas(null)} 
        onSuccess={handleCheckoutSuccess}
      />
      
      <SuccessScreen 
        orderCode={orderCode} 
        onClose={handleSuccessClose} 
      />

      <TrackOrderModal 
        isOpen={isTrackOrderOpen} 
        onClose={() => setIsTrackOrderOpen(false)} 
      />
    </div>
  )
}

export default App
