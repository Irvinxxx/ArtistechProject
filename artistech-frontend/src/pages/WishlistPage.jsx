import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Loader, Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import ArtworkImage from '../components/ui/artwork-image';

const WishlistPage = () => {
  const { token } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/wishlist', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch wishlist.');
        const data = await response.json();
        setWishlistItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchWishlist();
    }
  }, [token]);

  const handleRemoveFromWishlist = async (artworkId) => {
    // This function will also be used by handleAddToCart
    try {
      const response = await fetch(`http://localhost:3000/api/wishlist/${artworkId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.id !== artworkId));
      }
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  };

  const handleAddToCart = async (artwork) => {
    try {
      await addToCart(artwork);
      // After adding to cart, remove from wishlist
      handleRemoveFromWishlist(artwork.id);
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      {loading ? (
        <div className="flex justify-center"><Loader className="animate-spin" /></div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-6 text-xl font-semibold">Your Wishlist is Empty</h2>
          <p className="mt-2 text-gray-500">You haven’t added any artworks to your wishlist yet.</p>
          <Button asChild className="mt-6">
            <Link to="/artworks">Explore Artworks</Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="group bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
              <Link to={`/artworks/${item.id}`} className="block">
                <ArtworkImage src={item.thumbnail_image} alt={item.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold truncate">{item.title}</h3>
                  <p className="text-sm text-gray-500">by {item.artist_name}</p>
                  <p className="text-lg font-bold mt-2">₱{item.price}</p>
                </div>
              </Link>
              <div className="mt-auto p-4 border-t">
                <Button onClick={() => handleAddToCart(item)} className="w-full bg-purple-600 hover:bg-purple-700">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button onClick={() => handleRemoveFromWishlist(item.id)} variant="ghost" className="w-full mt-2 text-gray-600">
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage; 