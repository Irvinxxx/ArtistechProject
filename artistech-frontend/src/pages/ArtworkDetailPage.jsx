import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gavel, Clock, User, Tag, ShoppingCart, Heart } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { formatCurrency } from '../lib/utils';
import ArtworkImage from '../components/ui/artwork-image'; // Import ArtworkImage

const ArtworkDetailPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { addToCart, isArtworkInCart } = useContext(CartContext);
  const { toggleWishlist, isArtworkInWishlist } = useContext(WishlistContext);
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/artworks/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch artwork');
        }
        const data = await response.json();
        setArtwork(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  if (loading) return <p>Loading artwork...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!artwork) return <p>Artwork not found.</p>;

  const handleAddToCart = async () => {
    try {
      await addToCart(artwork);
    } catch (error) {
      // Error is already handled by the toast in CartContext, but you could add more specific logic here if needed.
      console.error("Add to cart failed from detail page:", error);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <ArtworkImage 
              src={artwork.original_image} 
              alt={artwork.title} 
              className="w-full rounded-lg shadow-lg" 
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{artwork.title}</h1>
            <Link to={`/artists/${artwork.user_id}`}>
              <p className="text-xl text-gray-600 mt-2">by {artwork.artist_name}</p>
            </Link>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-1">
                <span>{artwork.rating || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{artwork.views} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{artwork.likes} likes</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-600 mt-6">{formatCurrency(artwork.price)}</p>
            {user?.user_type === 'client' && (
              <div className="mt-6">
                {isArtworkInCart(artwork.id) ? (
                  <Button size="lg" disabled className="w-full bg-gray-400 cursor-not-allowed">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    In Cart
                  </Button>
                ) : (
                  <Button size="lg" onClick={handleAddToCart} className="w-full bg-purple-600 hover:bg-purple-700">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                )}
                <Button size="lg" variant="outline" className="w-full mt-2" onClick={() => toggleWishlist(artwork.id)}>
                  <Heart className="mr-2 h-5 w-5" />
                  {isArtworkInWishlist(artwork.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>
              </div>
            )}
            <div className="mt-8">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-gray-700 mt-2">{artwork.description}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 text-sm text-gray-600">
        <p><Tag className="inline mr-2 h-4 w-4" />Status: {artwork.status}</p>
      </div>
    </>
  );
};

export default ArtworkDetailPage; 