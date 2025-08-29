import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart, Package, Monitor } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '../lib/utils';
import ArtworkImage from '../components/ui/artwork-image';

const CartPage = () => {
  const { 
    cartItems, 
    selectedItems,
    selectedItemsTotal,
    removeFromCart, 
    isLoading,
    toggleItemSelection,
    selectAllItems 
  } = useContext(CartContext);
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="text-center py-10">Loading cart...</div>;
  }
  
  const allItemsSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

  const handleCheckout = () => {
    // The new checkout page will handle all logic for shipping/payment.
    navigate('/checkout');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <ShoppingCart className="mx-auto h-24 w-24 text-gray-300" />
          <p className="mt-4 text-xl">Your cart is empty.</p>
          <Link to="/artworks">
            <Button className="mt-6">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="select-all" 
                  checked={allItemsSelected}
                  onCheckedChange={(checked) => selectAllItems(checked)}
                />
                <Label htmlFor="select-all" className="text-sm font-medium">
                  Select All ({selectedItems.length}/{cartItems.length})
                </Label>
              </div>
            </div>
            {cartItems.map(item => (
              <div key={item.artwork_id} className="flex items-start bg-white p-4 rounded-lg shadow mb-4">
                <Checkbox 
                  className="mr-4 mt-1"
                  checked={selectedItems.includes(item.artwork_id)}
                  onCheckedChange={() => toggleItemSelection(item.artwork_id)}
                />
                <ArtworkImage 
                  src={item.thumbnail_image} 
                  alt={item.title} 
                  className="w-24 h-24 object-cover rounded mr-4" 
                  showWatermark={false}
                />
                <div className="flex-grow">
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="text-sm text-gray-500">by {item.artist_name}</p>
                  {item.artwork_type && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      {item.artwork_type === 'physical' ? (
                        <Package className="w-4 h-4 mr-1" />
                      ) : (
                        <Monitor className="w-4 h-4 mr-1" />
                      )}
                      <span>{item.artwork_type.charAt(0).toUpperCase() + item.artwork_type.slice(1)}</span>
                    </div>
                  )}
                  <p className="text-lg font-bold mt-2">{formatCurrency(item.price)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.artwork_id)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-lg shadow h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>{formatCurrency(selectedItemsTotal)}</span>
            </div>
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Shipping</span>
              <span className="font-medium text-green-600">FREE</span>
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(selectedItemsTotal)}</span>
            </div>
              <Button onClick={handleCheckout} className="w-full mt-6 bg-purple-600 hover:bg-purple-700" disabled={selectedItems.length === 0}>
                Proceed to Checkout ({selectedItems.length})
              </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage; 