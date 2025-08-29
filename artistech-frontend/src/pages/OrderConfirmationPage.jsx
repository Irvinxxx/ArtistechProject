import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const OrderConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const linkId = searchParams.get('linkId');
  const [status, setStatus] = useState('pending'); // pending, completed, failed
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!linkId || !token) {
      setStatus('failed');
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/checkout/pending-payments/status/${linkId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'completed') {
            setStatus('completed');
            clearInterval(interval);
          }
          // If still pending, the interval will just continue
        } else {
          // If the API returns an error (e.g., 404), stop polling
          setStatus('failed');
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error polling for payment status:', error);
        setStatus('failed');
        clearInterval(interval);
      }
    }, 3000); // Poll every 3 seconds

    // Cleanup on component unmount
    return () => clearInterval(interval);
  }, [linkId, token]);
  
  const renderContent = () => {
    switch (status) {
      case 'completed':
        return (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h1 className="text-3xl font-bold mb-2">Thank You For Your Order!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Your payment was successful and your order is being processed. 
              <br />
              You can view your purchase history in your dashboard.
            </p>
            <div className="flex space-x-4">
              <Button asChild><Link to="/dashboard">Go to Dashboard</Link></Button>
              <Button asChild variant="outline"><Link to="/artworks">Continue Shopping</Link></Button>
            </div>
          </>
        );
      case 'failed':
          return (
            <>
              <XCircle className="w-16 h-16 text-red-500 mb-4" />
              <h1 className="text-3xl font-bold mb-2">Something Went Wrong</h1>
              <p className="text-lg text-gray-600 mb-6">
                There was an issue confirming your payment. 
                <br />
                Please check your dashboard or contact support.
              </p>
              <div className="flex space-x-4">
                <Button asChild><Link to="/dashboard">Go to Dashboard</Link></Button>
                <Button asChild variant="outline"><Link to="/cart">Back to Cart</Link></Button>
              </div>
            </>
          );
      case 'pending':
      default:
        return (
          <>
            <Loader2 className="w-16 h-16 text-gray-500 mb-4 animate-spin" />
            <h1 className="text-3xl font-bold mb-2">Waiting for Payment Confirmation</h1>
            <p className="text-lg text-gray-600 mb-6">
              Please complete your payment in the popup window.
              <br />
              This page will update automatically once payment is confirmed.
            </p>
          </>
        );
    }
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      {renderContent()}
    </div>
  );
};

export default OrderConfirmationPage; 