import { useState } from 'react'
import type { Canvas } from '../../../shared/types'
import { createOrder } from '../lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UploadCloud, Loader2 } from 'lucide-react'

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Other']
const COURIERS = ['TCS', 'Leopard', 'M&P', 'Standard']

export default function CheckoutForm({ 
  canvas, 
  onClose, 
  onSuccess 
}: { 
  canvas: Canvas | null, 
  onClose: () => void,
  onSuccess: (orderCode: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)

  if (!canvas) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!file) {
      setError('Please upload a screenshot of your payment.')
      return
    }

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      customer_name: formData.get('customer_name'),
      whatsapp_number: formData.get('whatsapp_number'),
      address: formData.get('address'),
      city: formData.get('city'),
      courier: formData.get('courier'),
      canvas_id: canvas.id
    }

    const result = await createOrder(data, file)
    
    if (result.success && result.order_code) {
      onSuccess(result.order_code)
    } else {
      setError(result.error || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!loading ? onClose : undefined}
          className="absolute inset-0 bg-brand-espresso/90 backdrop-blur-md cursor-pointer"
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-brand-background w-full max-w-2xl shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[95vh]"
        >
          <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-surface sticky top-0 z-10">
            <h2 className="text-2xl font-serif font-bold text-brand-espresso">Secure Checkout</h2>
            <button 
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-brand-border/50 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto p-6 md:p-8">
            <div className="flex items-center gap-4 mb-8 p-4 bg-brand-surface border border-brand-border rounded-sm">
              <img src={canvas.image_url || ''} alt={canvas.title} className="w-16 h-20 object-cover rounded-sm" />
              <div>
                <h3 className="font-bold font-serif text-lg">{canvas.title}</h3>
                <p className="text-brand-accent font-medium">Rs. {canvas.price_pkr.toLocaleString()}</p>
              </div>
            </div>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-brand-espresso">Full Name</label>
                  <input required name="customer_name" type="text" className="w-full p-3 border border-brand-border bg-white rounded-sm focus:outline-none focus:border-brand-accent" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-brand-espresso">WhatsApp Number</label>
                  <input required name="whatsapp_number" type="tel" className="w-full p-3 border border-brand-border bg-white rounded-sm focus:outline-none focus:border-brand-accent" placeholder="03XX XXXXXXX" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-brand-espresso">Full Delivery Address</label>
                <textarea required name="address" rows={3} className="w-full p-3 border border-brand-border bg-white rounded-sm focus:outline-none focus:border-brand-accent" placeholder="House/Apt, Street, Area..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-brand-espresso">City (Pakistan Only)</label>
                  <select required name="city" className="w-full p-3 border border-brand-border bg-white rounded-sm focus:outline-none focus:border-brand-accent appearance-none">
                    <option value="">Select City</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-brand-espresso">Preferred Courier</label>
                  <select required name="courier" className="w-full p-3 border border-brand-border bg-white rounded-sm focus:outline-none focus:border-brand-accent appearance-none">
                    <option value="">Select Courier</option>
                    {COURIERS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-brand-border">
                <h3 className="font-serif font-bold text-lg mb-4 text-brand-espresso">Payment Details</h3>
                <div className="bg-brand-surface p-4 rounded-sm border border-brand-border mb-6 text-sm text-brand-charcoal/90 space-y-2">
                  <p>Please transfer <strong>Rs. {canvas.price_pkr.toLocaleString()}</strong> to one of the following accounts:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-2 font-medium">
                    <li>JazzCash: 0300 1234567 (ArtbyAS)</li>
                    <li>EasyPaisa: 0300 1234567 (ArtbyAS)</li>
                    <li>Meezan Bank: 0123456789 (Title: ArtbyAS)</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-brand-espresso">Upload Payment Screenshot <span className="text-red-500">*</span></label>
                  <div className="border-2 border-dashed border-brand-border bg-white p-6 rounded-sm text-center hover:bg-brand-surface/50 transition-colors relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                      <UploadCloud className="w-8 h-8 text-brand-accent" />
                      {file ? (
                        <p className="text-sm font-medium text-brand-espresso">{file.name}</p>
                      ) : (
                        <p className="text-sm text-brand-charcoal/70">Click or drag image to upload proof of payment</p>
                      )}
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-brand-border bg-brand-surface sticky bottom-0 z-10 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border border-brand-border bg-white text-brand-espresso rounded-sm font-medium hover:bg-brand-background transition-colors disabled:opacity-50 flex-1"
            >
              Cancel
            </button>
            <button 
              form="checkout-form"
              type="submit"
              disabled={loading || !file}
              className="px-6 py-3 bg-brand-espresso text-brand-background rounded-sm font-medium hover:bg-brand-charcoal transition-colors disabled:opacity-70 flex-2 flex items-center justify-center w-2/3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
