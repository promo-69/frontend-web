import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LoadingProvider } from './context/LoadingContext'

import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { PurchaseProvider } from './context/PurchaseContext'

createRoot(document.getElementById('root')).render(
    <LoadingProvider>
      <AuthProvider>
        <PurchaseProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </PurchaseProvider>
      </AuthProvider>
    </LoadingProvider>
)

//{/* Por sea necesario luego *<StrictMode></StrictMode>,/}
