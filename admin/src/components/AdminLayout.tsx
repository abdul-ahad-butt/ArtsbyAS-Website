import { useState, useEffect } from 'react'
import { adminLogin, adminLogout, checkAuth } from '../lib/api-admin'
import Dashboard from './Dashboard'
import CanvasManagement from './CanvasManagement'
import OrderManagement from './OrderManagement'
import { LayoutDashboard, Image, Package, LogOut, Loader2 } from 'lucide-react'

export default function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'canvases' | 'orders'>('dashboard')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    verifyAuth()
  }, [])

  const verifyAuth = async () => {
    try {
      await checkAuth()
      setIsAuthenticated(true)
    } catch {
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    try {
      await adminLogin(username, password)
      setIsAuthenticated(true)
    } catch (err) {
      setLoginError('Invalid credentials')
    }
  }

  const handleLogout = async () => {
    await adminLogout()
    setIsAuthenticated(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-background"><Loader2 className="w-8 h-8 animate-spin text-brand-espresso" /></div>
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-background px-4">
        <div className="w-full max-w-md bg-white p-8 border border-brand-border rounded-sm shadow-xl">
          <h1 className="text-3xl font-serif font-bold text-center text-brand-espresso mb-8">Admin Portal</h1>
          {loginError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium border border-red-200 rounded-sm">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-brand-espresso">Username</label>
              <input required type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 border border-brand-border bg-white rounded-sm focus:outline-none focus:border-brand-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-brand-espresso">Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-brand-border bg-white rounded-sm focus:outline-none focus:border-brand-accent" />
            </div>
            <button type="submit" className="w-full py-3 bg-brand-espresso text-white font-bold tracking-widest uppercase rounded-sm hover:bg-brand-charcoal transition-colors">
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'canvases', label: 'Canvases', icon: Image },
    { id: 'orders', label: 'Orders', icon: Package }
  ] as const

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 md:min-h-screen bg-brand-surface border-b md:border-b-0 md:border-r border-brand-border flex flex-col">
        <div className="p-6 border-b border-brand-border flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-brand-espresso">ArtbyAS Admin</h1>
          {/* Mobile could have a hamburger menu here, but keeping it simple for now by showing all on mobile as a top bar if needed, or just stacking. */}
        </div>
        
        <nav className="flex-1 p-4 space-y-2 flex flex-col">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-brand-espresso text-white' 
                  : 'text-brand-charcoal hover:bg-brand-border/50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-border">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-sm font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50/50 min-h-screen">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'canvases' && <CanvasManagement />}
        {activeTab === 'orders' && <OrderManagement />}
      </main>
    </div>
  )
}
