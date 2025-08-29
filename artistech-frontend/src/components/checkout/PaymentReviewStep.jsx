import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { FaSpinner } from 'react-icons/fa';

const PaymentReviewStep = ({ onProceedToPayment, isProcessing }) => {
  const { selectedCartItems, selectedItemsTotal } = useContext(CartContext);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader><CardTitle>Digital Delivery</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-3">
              📱 <strong>Instant Digital Access</strong>
            </p>
            <p className="text-sm text-gray-500">
              After successful payment, you'll get immediate access to download your digital artwork files 
              in high resolution. No shipping required!
            </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
            <CardContent>
                <p>You will be redirected to PayMongo to complete your payment securely.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports credit/debit cards, GCash, and other popular payment methods.
                </p>
            </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card>
          <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
          <CardContent>
            {selectedCartItems.map(item => (
              <div key={item.artwork_id} className="flex justify-between items-center mb-2">
                <span>{item.title}</span>
                <span>₱{item.price}</span>
              </div>
            ))}
            <div className="border-t my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>₱{selectedItemsTotal.toLocaleString()}</span>
            </div>
            <Button onClick={onProceedToPayment} size="lg" className="w-full mt-6" disabled={isProcessing}>
              {isProcessing ? <FaSpinner className="animate-spin" /> : 'Confirm and Pay'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentReviewStep; 