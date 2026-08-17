import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "../../shared/styles/index.css";
import AdminLayout from './components/AdminLayout'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminLayout />
  </StrictMode>,
)
