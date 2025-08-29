import { Separator } from '@/components/ui/separator';
import ArtworkImage from './ui/artwork-image';

const OrderSummary = ({ items, subtotal }) => {
  const shippingCost = 0; // Placeholder
  const total = subtotal + shippingCost;

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.artwork_id} className="flex items-center justify-between">
            <div className="flex items-center">
              <ArtworkImage 
                src={item.thumbnail_image} 
                alt={item.title}
                className="w-16 h-16 rounded-md mr-4 object-cover"
                showWatermark={false}
              />
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-500">{item.artist_name}</p>
              </div>
            </div>
            <p className="font-semibold">₱{parseFloat(item.price).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <Separator className="my-6" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>₱{subtotal.toFixed(2)}</p>
        </div>
        <div className="flex justify-between">
          <p>Shipping</p>
          <p>{shippingCost === 0 ? 'Free' : `₱${shippingCost.toFixed(2)}`}</p>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between font-bold text-lg">
          <p>Total</p>
          <p>₱{total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary; 