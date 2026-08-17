import { useState, useEffect } from 'react'
import type { Canvas } from '../../../shared/types'
import { fetchCanvases, saveCanvas } from '../lib/api-admin'
import { Plus, Edit2, Loader2 } from 'lucide-react'

export default function CanvasManagement() {
  const [canvases, setCanvases] = useState<Canvas[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Canvas | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const data = await fetchCanvases()
      setCanvases(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (c: Canvas) => {
    setEditing(c)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditing(null)
    setShowForm(true)
  }

  if (loading) return <div className="p-8"><Loader2 className="animate-spin text-brand-espresso" /></div>

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-espresso">Canvas Management</h2>
        <button 
          onClick={handleAddNew}
          className="bg-brand-espresso text-white px-4 py-2 rounded-sm flex items-center gap-2 hover:bg-brand-charcoal"
        >
          <Plus className="w-4 h-4" /> Add Canvas
        </button>
      </div>

      {showForm ? (
        <CanvasForm 
          canvas={editing} 
          onClose={() => setShowForm(false)} 
          onSave={() => { setShowForm(false); load() }} 
        />
      ) : (
        <div className="bg-white border border-brand-border rounded-sm overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-brand-surface border-b border-brand-border text-sm text-brand-charcoal/80 uppercase">
              <tr>
                <th className="p-4">Artwork</th>
                <th className="p-4">Title</th>
                <th className="p-4">Price (PKR)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {canvases.map(c => (
                <tr key={c.id} className="border-b border-brand-border/50 hover:bg-brand-surface/30 transition-colors">
                  <td className="p-4">
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.title} className="w-12 h-12 object-cover rounded-sm" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-sm flex items-center justify-center text-xs text-gray-500">No Img</div>
                    )}
                  </td>
                  <td className="p-4 font-medium">{c.title}</td>
                  <td className="p-4">{c.price_pkr.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-sm uppercase ${
                      c.status === 'available' ? 'bg-green-100 text-green-800' :
                      c.status === 'sold' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(c)} className="text-brand-accent hover:text-brand-espresso">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {canvases.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No canvases found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function CanvasForm({ canvas, onClose, onSave }: { canvas: Canvas | null, onClose: () => void, onSave: () => void }) {
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      dimensions: formData.get('dimensions'),
      price_pkr: formData.get('price_pkr'),
      status: formData.get('status')
    }
    
    try {
      await saveCanvas(data, file, canvas?.id)
      onSave()
    } catch (err) {
      alert('Failed to save canvas')
      setSaving(false)
    }
  }

  return (
    <div className="bg-white p-6 border border-brand-border rounded-sm shadow-sm">
      <h3 className="text-xl font-bold font-serif mb-6">{canvas ? 'Edit Canvas' : 'Add New Canvas'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input required name="title" defaultValue={canvas?.title} className="w-full p-2 border rounded-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price (PKR)</label>
            <input required type="number" name="price_pkr" defaultValue={canvas?.price_pkr} className="w-full p-2 border rounded-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select name="status" defaultValue={canvas?.status || 'available'} className="w-full p-2 border rounded-sm bg-white">
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dimensions</label>
          <input name="dimensions" defaultValue={canvas?.dimensions || ''} className="w-full p-2 border rounded-sm" placeholder="e.g. 24 x 36 inches" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" rows={4} defaultValue={canvas?.description || ''} className="w-full p-2 border rounded-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image Upload</label>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full p-2 border rounded-sm" />
          {canvas?.image_url && <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image.</p>}
        </div>
        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-sm hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-brand-espresso text-white rounded-sm hover:bg-brand-charcoal disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Canvas'}
          </button>
        </div>
      </form>
    </div>
  )
}
