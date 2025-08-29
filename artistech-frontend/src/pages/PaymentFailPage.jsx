import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

const PaymentFailPage = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <XCircle className="mx-auto h-24 w-24 text-red-500" />
      <h1 className="mt-4 text-3xl font-bold text-gray-900">Payment Failed</h1>
      <p className="mt-2 text-lg text-gray-600">
        Unfortunately, we were unable to process your payment.
      </p>
      <p className="mt-2 text-gray-500">
        Please try again or contact support if the problem persists.
      </p>
      <div className="mt-8">
        <Link to="/cart">
          <Button>Back to Cart</Button>
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailPage; 