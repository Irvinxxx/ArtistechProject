import { useEffect, useContext, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Palette, ShoppingBag } from 'lucide-react';
import { CartContext } from '@/context/CartContext';
import { AuthContext } from '@/context/AuthContext';

const PaymentSuccessPage = () => {
  const { fetchCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [paymentType, setPaymentType] = useState('artwork'); // 'artwork' or 'commission'

  useEffect(() => {
    // Check if this is a commission payment or artwork payment
    const type = searchParams.get('type');
    const projectId = searchParams.get('projectId');
    
    if (type === 'commission' || projectId) {
      setPaymentType('commission');
    }

    // For artwork payments, refresh the cart
    if (paymentType === 'artwork') {
      fetchCart();
    }

    // Close the current window if it's a popup (for commission payments)
    if (window.opener) {
      setTimeout(() => {
        window.close();
      }, 3000); // Close after 3 seconds to show success message
    }
  }, [fetchCart, searchParams, paymentType]);

  const isCommissionPayment = paymentType === 'commission';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
      <h1 className="mt-4 text-3xl font-bold text-gray-900">Payment Successful!</h1>
      
      {isCommissionPayment ? (
        <>
          <p className="mt-2 text-lg text-gray-600">
            Your commission payment has been processed successfully. The project is now active and the artist will begin work.
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <Palette className="mx-auto h-8 w-8 text-blue-500 mb-2" />
            <p className="text-sm text-blue-700">
              {window.opener 
                ? "This window will close automatically. Check your projects dashboard for updates."
                : "You can now track your project progress and communicate with the artist."
              }
            </p>
          </div>
          {!window.opener && (
            <div className="mt-8">
              <Link to="/my-projects">
                <Button>View My Projects</Button>
              </Link>
              <Link to="/client/dashboard" className="ml-4">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="mt-2 text-lg text-gray-600">
            Thank you for your purchase. Your order is being processed.
          </p>
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <ShoppingBag className="mx-auto h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm text-green-700">
              Your digital artworks will be available for download shortly.
            </p>
          </div>
          <div className="mt-8">
            <Link to="/artworks">
              <Button>Continue Shopping</Button>
            </Link>
            <Link to="/dashboard" className="ml-4">
              <Button variant="outline">View My Orders</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentSuccessPage; 