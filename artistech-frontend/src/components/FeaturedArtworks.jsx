import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Heart, Eye, Star } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { formatCurrency } from '../lib/utils'
import ArtworkImage from './ui/artwork-image'

const FeaturedArtworks = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/artworks?limit=4&featured=true');
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
  }, []);

  const handleLike = async (artworkId) => {
    if (!token) {
      // Maybe prompt to login
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/api/artworks/${artworkId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to like artwork');
      }
      const updatedArtwork = await response.json();
      setArtworks(artworks.map(art => 
        art.id === artworkId 
          ? { ...art, likes: updatedArtwork.liked ? art.likes + 1 : art.likes - 1 } 
          : art
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>Loading artworks...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Artworks
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover exceptional pieces from our talented community of verified artists
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {artworks.map((artwork) => (
            <div key={artwork.id} className="group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="w-full h-48 bg-gray-200">
                <ArtworkImage
                  src={artwork.original_image}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    <Link to={`/artworks/${artwork.id}`}>
                      <span className="absolute inset-0" />
                      {artwork.title}
                    </Link>
                  </h3>
                  {artwork.verified && (
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Verified
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-2">by {artwork.artist_name || 'Unknown Artist'}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-purple-600">{formatCurrency(artwork.price)}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{artwork.rating || 0}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{artwork.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{artwork.views}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700" onClick={() => handleLike(artwork.id)}>
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/artworks">
            <Button variant="outline" size="lg" className="px-8 py-3">
              View All Artworks
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedArtworks

