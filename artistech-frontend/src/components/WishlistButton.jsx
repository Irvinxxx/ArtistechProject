import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { WishlistContext } from '../context/WishlistContext';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';

const WishlistButton = ({ artworkId }) => {
  const { token } = useContext(AuthContext);
  const { toggleWishlist, isArtworkInWishlist } = useContext(WishlistContext);
  
  const isInWishlist = isArtworkInWishlist(artworkId);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      // Handle not logged in user, e.g., show login modal
      return;
    }
    toggleWishlist(artworkId);
  };

  return (
    <Button 
      variant="default" 
      size="icon" 
      onClick={handleToggle} 
      className="bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full"
    >
      <Bookmark className={`h-5 w-5 ${isInWishlist ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} />
    </Button>
  );
};

export default WishlistButton; 