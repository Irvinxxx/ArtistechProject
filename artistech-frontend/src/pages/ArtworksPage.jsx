import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Eye, Loader, Package, Monitor, ShoppingCart, X } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import ArtworkImage from '@/components/ui/artwork-image';
import { toast } from 'sonner';

const ArtworksPage = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArtwork, setSelectedArtwork] = useState(null); // State for Quick View

  const { addToCart, isArtworkInCart } = useContext(CartContext);
  const { toggleWishlist, isArtworkInWishlist } = useContext(WishlistContext);
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    sort: 'newest'
  });

  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.category !== 'all') params.append('category', filters.category);
        params.append('sort', filters.sort);
        
        const response = await fetch(`/api/artworks?${params.toString()}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!response.ok) {
          throw new Error('Failed to fetch artworks');
        }
        const data = await response.json();
        setArtworks(data.artworks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArtworks();
  }, [filters, token]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleLikeToggle = async (artworkId, isCurrentlyLiked) => {
    if (!user) {
        toast.error("Please log in to like an artwork.");
        navigate('/login');
        return;
    }

    // Optimistic UI Update
    setArtworks(currentArtworks =>
      currentArtworks.map(art =>
        art.id === artworkId
          ? { 
              ...art, 
              likes: art.likes + (isCurrentlyLiked ? -1 : 1),
              is_liked: !isCurrentlyLiked
            }
          : art
      )
    );

    try {
      const response = await fetch(`/api/artworks/${artworkId}/like`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to update like status');

    } catch (error) {
      // Revert on failure
      toast.error("Failed to update like status. Please try again.");
      setArtworks(currentArtworks =>
        currentArtworks.map(art =>
          art.id === artworkId
            ? { 
                ...art, 
                likes: art.likes + (isCurrentlyLiked ? 1 : -1), // Revert the change
                is_liked: isCurrentlyLiked
              }
            : art
        )
      );
    }
  };

  const handleWishlistToggle = (artworkId) => {
    if (!user) {
        toast.error("Please log in to save to your wishlist.");
        navigate('/login');
        return;
    }
    toggleWishlist(artworkId);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Discover Artworks</h1>
          <p className="text-lg text-gray-600 mt-2">Browse our collection of unique, human-created art.</p>
        </div>

        {/* Filter and Sort Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <Input 
            placeholder="Search by keyword..." 
            className="flex-grow"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <div className="flex gap-4">
            <Select onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="digital-art">Digital Art</SelectItem>
                <SelectItem value="traditional-painting">Traditional</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => handleFilterChange('sort', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="likes">Most Liked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                  </div>
                  <div className="mt-auto">
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                <Link to={`/artworks/${artwork.id}`} className="block">
                  <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                    <ArtworkImage
                      src={artwork.thumbnail_image}
                      alt={artwork.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onQuickView={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedArtwork(artwork);
                      }}
                      {...(user?.user_type !== 'artist' && {
                        onAddToCart: () => addToCart(artwork),
                        onToggleWishlist: () => handleWishlistToggle(artwork.id),
                        isInCart: isArtworkInCart(artwork.id),
                        isInWishlist: isArtworkInWishlist(artwork.id)
                      })}
                      isLoggedIn={!!user}
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 overflow-hidden" 
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: '2',
                            WebkitBoxOrient: 'vertical',
                            maxHeight: '3rem'
                          }}
                          title={artwork.title}>
                        {artwork.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 truncate" title={artwork.artist_name}>by {artwork.artist_name}</p>
                    </div>
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl font-bold text-purple-600">₱{parseFloat(artwork.price || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                           <button
                             onClick={(e) => {
                               e.preventDefault(); e.stopPropagation();
                               handleLikeToggle(artwork.id, artwork.is_liked)
                             }}
                             className="flex items-center hover:text-red-500 transition-colors"
                           >
                             <Heart className={`h-4 w-4 mr-1 transition-colors ${artwork.is_liked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                             <span className="text-xs">{artwork.likes || 0}</span>
                           </button>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            <span className="text-xs">{artwork.views || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          {artwork.artwork_type === 'physical' ? (
                              <Package className="w-4 h-4 mr-1" />
                          ) : (
                              <Monitor className="w-4 h-4 mr-1" />
                          )}
                          <span className="text-xs">Digital</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Quick View Modal */}
        {selectedArtwork && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedArtwork(null)}>
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="w-full md:w-1/2 h-64 md:h-auto">
                <ArtworkImage src={selectedArtwork.thumbnail_image} alt={selectedArtwork.title} className="w-full h-full object-contain" />
              </div>
              <div className="w-full md:w-1/2 p-6 flex flex-col">
                <Button className="absolute top-4 right-4" variant="ghost" size="icon" onClick={() => setSelectedArtwork(null)}><X className="h-6 w-6" /></Button>
                <h2 className="text-3xl font-bold mb-2">{selectedArtwork.title}</h2>
                <p className="text-gray-600 text-lg mb-4">by <Link to={`/artist/${selectedArtwork.artist_id}`} className="hover:underline">{selectedArtwork.artist_name}</Link></p>
                <p className="text-gray-800 mb-6 flex-grow overflow-y-auto">{selectedArtwork.description}</p>
                <div className="mt-auto">
                  <p className="text-3xl font-bold text-purple-600 mb-4">₱{parseFloat(selectedArtwork.price || 0).toLocaleString()}</p>
                  {user?.user_type !== 'artist' && (
                    <Button size="lg" className="w-full" onClick={() => addToCart(selectedArtwork)} disabled={isArtworkInCart(selectedArtwork.id)}>
                      <ShoppingCart className="mr-2 h-5 w-5" /> {isArtworkInCart(selectedArtwork.id) ? 'Already in Cart' : 'Add to Cart'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ArtworksPage;
