import { useState, useRef, useEffect } from 'react'
import { Shield, Eye, Download, ShoppingCart, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { toast } from 'sonner';

const ProtectedImage = ({ 
  src, 
  alt, 
  className = '', 
  showWatermark = true,
  allowDownload = false,
  onDownload = null,
  protectionLevel = 'high', // 'low', 'medium', 'high'
  onLoad, // <-- Add this
  onError, // <-- Add this
  onQuickView, // <-- Add this
  onAddToCart,
  onToggleWishlist,
  isLoggedIn,
  isInCart,
  isInWishlist,
  ...props // <-- Pass rest of the props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showProtectionNotice, setShowProtectionNotice] = useState(false)
  const imageRef = useRef(null)

  const handleContextMenu = (e) => {
    e.preventDefault()
    setShowProtectionNotice(true)
    setTimeout(() => setShowProtectionNotice(false), 3000)
    return false
  }

  const handleDragStart = (e) => {
    e.preventDefault()
    setShowProtectionNotice(true)
    setTimeout(() => setShowProtectionNotice(false), 3000)
    return false
  }
  
  const highProtectionClasses = protectionLevel === 'high' ? 'pointer-events-none' : '';

  return (
    <div 
      className={`relative inline-block select-none ${className}`}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      tabIndex={0}
    >
      {/* Main Image */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        onLoad={(e) => {
          setIsLoaded(true);
          if (onLoad) onLoad(e); // <-- Call the prop
        }}
        onError={(e) => {
          if (onError) onError(e); // <-- Call the prop
        }}
        className={`w-full h-auto select-none ${highProtectionClasses}`}
        draggable={false}
        {...props} // <-- Pass rest of the props
      />

      {/* Invisible Overlay for High Protection */}
      {protectionLevel === 'high' && (
        <div
          className="absolute inset-0 bg-transparent z-10 cursor-default"
          onContextMenu={handleContextMenu}
          onDragStart={handleDragStart}
        />
      )}

      {/* Watermark */}
      {showWatermark && isLoaded && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded pointer-events-none">
          ArtisTech
        </div>
      )}

      {/* Protection Level Indicator */}
      <div className="absolute top-2 left-2 flex items-center space-x-1 pointer-events-none">
        <Shield className="h-4 w-4 text-white drop-shadow-lg" />
        <span className="text-white text-xs drop-shadow-lg font-medium">
          {protectionLevel === 'high' ? 'Protected' : 'Basic'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        {onQuickView && (
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 p-0 bg-black bg-opacity-50 hover:bg-opacity-70"
            onClick={onQuickView}
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4 text-white" />
          </Button>
        )}
        
        {onToggleWishlist && (
            <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 p-0 bg-black bg-opacity-50 hover:bg-opacity-70"
                onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    if (!isLoggedIn) {
                        toast.error("Please log in to save to your wishlist.");
                        return;
                    }
                    onToggleWishlist();
                }}
                aria-label="Toggle Wishlist"
            >
                <Bookmark className={`h-4 w-4 ${isInWishlist ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} />
            </Button>
        )}

        {onAddToCart && (
            <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 p-0 bg-black bg-opacity-50 hover:bg-opacity-70"
                onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                     if (!isLoggedIn) {
                        toast.error("Please log in to add items to your cart.");
                        return;
                    }
                    onAddToCart();
                }}
                disabled={isInCart}
                aria-label="Add to Cart"
            >
                <ShoppingCart className="h-4 w-4 text-white" />
            </Button>
        )}

        {allowDownload && onDownload && (
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-black bg-opacity-50 hover:bg-opacity-70"
            onClick={onDownload}
          >
            <Download className="h-3 w-3 text-white" />
          </Button>
        )}
        
      </div>

      {/* Protection Notice */}
      {showProtectionNotice && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-30">
          <div className="bg-white rounded-lg p-4 max-w-sm mx-4 text-center">
            <Shield className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Content Protected</h3>
            <p className="text-sm text-gray-600">
              This artwork is protected by ArtisTech's anti-grab technology. 
              Unauthorized downloading or copying is not permitted.
            </p>
            <div className="mt-3 text-xs text-gray-500">
              Protection Level: {protectionLevel.toUpperCase()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProtectedImage

