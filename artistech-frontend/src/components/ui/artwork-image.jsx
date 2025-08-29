import { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import ProtectedImage from '../ProtectedImage'; // Import the ProtectedImage component

/**
 * Robust image component with fallback support for artwork images
 * Supports both uploaded files (/uploads/) and external URLs
 * Now integrates ProtectedImage for anti-grab functionality
 */
const ArtworkImage = ({ 
  src, 
  alt = 'Artwork', 
  className = '', 
  fallbackClassName = '',
  showWatermark = true, // Pass this down to ProtectedImage
  protectionLevel = 'high', // Default to high protection
  fallbackText = 'Digital Art', // Add a new prop for fallback text
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  isLoggedIn,
  isInCart,
  isInWishlist,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState('');

  // Function to normalize image source URLs
  const normalizeImageSrc = (src) => {
    if (!src) return '';
    
    // If it's already a full URL (http/https), use as is
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    
    // If it's a local upload path starting with /uploads/, prepend backend URL
    if (src.startsWith('/uploads/')) {
      return `http://localhost:3000${src}`;
    }
    
    // If it's just a filename, assume it's in uploads
    if (!src.includes('/') && (src.includes('.jpg') || src.includes('.png') || src.includes('.jpeg') || src.includes('.webp') || src.includes('.gif'))) {
      return `http://localhost:3000/uploads/${src}`;
    }
    
    // For any other case, try as is
    return src;
  };

  // Reset states when src changes
  useEffect(() => {
    if (src && src.trim() !== '') {
      setImageError(false);
      setLoading(true);
      const normalizedSrc = normalizeImageSrc(src);
      setImageSrc(normalizedSrc);
    } else {
      setImageError(true);
      setLoading(false);
      setImageSrc(''); // Ensure we don't pass empty string to img
    }
  }, [src]);

  const handleImageLoad = () => {
    setLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setImageError(true);
  };

  // If no src provided or error occurred, show fallback
  if (!src || src.trim() === '' || imageError || !imageSrc) {
    return (
      <div className={`relative bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center ${fallbackClassName || className}`} {...props}>
        <div className="text-center text-gray-500">
          <ImageIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="text-xs font-medium">{fallbackText}</p>
          {imageError && (
            <p className="text-xs text-red-400 mt-1">Failed to load</p>
          )}
        </div>
        {showWatermark && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            ArtisTech
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={`absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 animate-pulse flex items-center justify-center ${className}`}>
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      {/* Use ProtectedImage component to render the image */}
      {imageSrc && (
        <ProtectedImage
          src={imageSrc}
          alt={alt}
          className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          showWatermark={showWatermark}
          protectionLevel={protectionLevel}
          onQuickView={onQuickView}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isLoggedIn={isLoggedIn}
          isInCart={isInCart}
          isInWishlist={isInWishlist}
          {...props}
        />
      )}
    </>
  );
};

export default ArtworkImage;
