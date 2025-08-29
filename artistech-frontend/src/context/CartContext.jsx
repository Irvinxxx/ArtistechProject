import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { toast } from "sonner";

export const CartContext = createContext();

// Function to get or create a session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID(); // Modern way to get UUID
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token, isLoading: isAuthLoading } = useContext(AuthContext);

  const loadCart = async () => {
    if (isAuthLoading) return;

    setIsLoading(true);
    try {
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            headers['X-Session-Id'] = getSessionId();
        }

        const response = await fetch('/api/cart', { headers });
        if (response.ok) {
            const data = await response.json();
            setCartItems(data);
            setSelectedItems(data.map(item => item.artwork_id));

            // If a new session ID was created by the server, store it
            const newSessionId = response.headers.get('X-Session-Id');
            if (newSessionId && !token) {
                localStorage.setItem('sessionId', newSessionId);
            }
        } else {
            setCartItems([]);
            setSelectedItems([]);
        }
    } catch (error) {
        console.error("Failed to load cart:", error);
        setCartItems([]);
        setSelectedItems([]);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user, token, isAuthLoading]);

  const addToCart = async (artwork) => {
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            headers['X-Session-Id'] = getSessionId();
        }

        const response = await fetch('/api/cart/items', {
            method: 'POST',
            headers,
            body: JSON.stringify({ artworkId: artwork.id })
        });

        if (response.ok) {
            const { cartItem } = await response.json();
            setCartItems(prevItems => [...prevItems, cartItem]);
            setSelectedItems(prevSelected => [...prevSelected, cartItem.artwork_id]);
            toast.success("Added to cart", { description: `"${artwork.title}" is now in your cart.` });
        } else {
            const data = await response.json();
            toast.error(data.error || "Failed to add item to cart.");
        }
    } catch (error) {
        console.error(error);
        toast.error("An unexpected error occurred.");
    }
  };

  const removeFromCart = async (artworkId) => {
    try {
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            headers['X-Session-Id'] = getSessionId();
        }

        const response = await fetch(`/api/cart/items/${artworkId}`, {
            method: 'DELETE',
            headers
        });
        if (response.ok) {
            await loadCart();
            toast.success("Item removed from cart.");
        } else {
            toast.error("Failed to remove item. Please try again.");
        }
    } catch (error) {
        console.error("Failed to remove item:", error);
        toast.error("An error occurred. Could not remove item.");
    }
  };

  const clearCartSelection = () => setSelectedItems([]);

  const toggleItemSelection = (artworkId) => {
    setSelectedItems(prev => prev.includes(artworkId) ? prev.filter(id => id !== artworkId) : [...prev, artworkId]);
  };

  const selectAllItems = (select) => {
    setSelectedItems(select ? cartItems.map(item => item.artwork_id) : []);
  };

  const isArtworkInCart = (artworkId) => cartItems.some(item => item.artwork_id === artworkId);

  // --- Memoized Values ---
  const cartCount = cartItems.length;
  const cartTotal = cartItems.reduce((total, item) => total + parseFloat(item.price || 0), 0);
  const selectedItemsTotal = cartItems
    .filter(item => selectedItems.includes(item.artwork_id))
    .reduce((total, item) => total + parseFloat(item.price || 0), 0);
  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.artwork_id));

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      cartCount, 
      cartTotal, 
      addToCart, 
      removeFromCart, 
      isLoading, 
      isArtworkInCart,
      selectedItems,
      toggleItemSelection,
      selectAllItems,
      selectedItemsTotal,
      selectedCartItems,
      loadCart,
      clearCartSelection
    }}>
      {children}
    </CartContext.Provider>
  );
}; 