import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { Toaster } from "@/components/ui/sonner"


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <WishlistProvider>
              <CartProvider>
                <App />
                <Toaster />
              </CartProvider>
            </WishlistProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
)
