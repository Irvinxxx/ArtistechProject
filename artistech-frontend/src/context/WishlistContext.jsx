import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    if (token && user?.user_type === 'client') {
      fetchWishlist();
    } else {
      setWishlistItems([]);
      setIsLoading(false);
    }
  }, [token, user]);

  const fetchWishlist = async () => {
    // Only fetch wishlist for clients
    if (!user || user.user_type !== 'client') {
      setWishlistItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data);
      } else if (response.status === 401 || response.status === 403) {
        // User is not authenticated, not a client, or token is invalid
        setWishlistItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (artworkId) => {
    // Only allow clients to add to wishlist
    if (!user || user.user_type !== 'client') {
      console.warn("Only clients can add items to wishlist");
      return;
    }

    try {
      const response = await fetch(`/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ artworkId })
      });
      if (response.ok) {
        fetchWishlist();
      }
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
    }
  };

  const removeFromWishlist = async (artworkId) => {
    // Only allow clients to remove from wishlist
    if (!user || user.user_type !== 'client') {
      console.warn("Only clients can remove items from wishlist");
      return;
    }

    try {
      const response = await fetch(`/api/wishlist/${artworkId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchWishlist();
      }
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  const toggleWishlist = (artworkId) => {
    if (isArtworkInWishlist(artworkId)) {
      removeFromWishlist(artworkId);
    } else {
      addToWishlist(artworkId);
    }
  };

  const isArtworkInWishlist = (artworkId) => {
    return wishlistItems.some(item => item.id === artworkId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isArtworkInWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}; 