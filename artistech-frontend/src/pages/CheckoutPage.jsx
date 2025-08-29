import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { FaSpinner } from 'react-icons/fa';
import PaymentReviewStep from '../components/checkout/PaymentReviewStep'; // Assuming this component is refactored

const CheckoutPage = () => {
    const { selectedCartItems, clearCartSelection, loadCart } = useContext(CartContext);
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isWaitingForPayment, setIsWaitingForPayment] = useState(false);

    useEffect(() => {
        if (!isProcessing && selectedCartItems.length === 0) {
            toast.error("Your checkout session is empty.", { description: "Redirecting you to the cart." });
            navigate('/cart');
        }
    }, [selectedCartItems, isProcessing, navigate]);

    const handleProceedToPayment = async () => {
        setIsProcessing(true);
        const selectedArtworkIds = selectedCartItems.map(item => item.artwork_id);

        try {
            const response = await fetch('/api/checkout/create-payment-link', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedArtworkIds })
            });

            const data = await response.json();
            if (response.ok && data.checkout_url) {
                const paymentWindow = window.open(data.checkout_url, 'paymongoPaymentWindow', 'width=500,height=700');
                setIsWaitingForPayment(true);

                // Start polling
                const checkClosed = setInterval(() => {
                    if (paymentWindow.closed) {
                        clearInterval(checkClosed);
                        toast.info("Payment window closed. Verifying payment...");

                        const maxRetries = 30; // 60 seconds timeout
                        let attempt = 0;
                        const pollInterval = setInterval(async () => {
                            attempt++;
                            try {
                                const statusRes = await fetch(`/api/checkout/pending-payments/status/${data.link_id}`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });
                                if (statusRes.ok) {
                                    const statusData = await statusRes.json();
                                    if (statusData.status === 'completed') {
                                        toast.success("Payment successful!");
                                        clearInterval(pollInterval);
                                        clearCartSelection(); // Clear the selected items
                                        await loadCart(); // Refresh the cart state
                                        navigate(`/order-confirmation?orderId=${statusData.orderId}`);
                                        return;
                                    }
                                }
                            } catch (err) { /* ignore fetch errors during polling */ }

                            if (attempt >= maxRetries) {
                                clearInterval(pollInterval);
                                toast.warning("Payment verification timed out. Please check your dashboard for order status.", { duration: 6000 });
                                setIsWaitingForPayment(false);
                                setIsProcessing(false);
                                navigate('/client/dashboard');
                            }
                        }, 2000);
                    }
                }, 1000);
            } else {
                toast.error(data.error || 'Payment link could not be created.');
                setIsProcessing(false);
            }
        } catch (error) {
            toast.error('Checkout failed. Please try again.');
            setIsProcessing(false);
        }
    };

    if (isWaitingForPayment) {
        return (
            <div className="text-center py-20">
                <FaSpinner className="animate-spin text-4xl text-gray-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Waiting for Payment Confirmation</h1>
                <p className="text-gray-600 mt-2">Please complete your payment in the popup window.</p>
                <p className="text-gray-600">This page will update automatically once payment is confirmed.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">Review & Purchase Digital Art</h1>
            <PaymentReviewStep
                onProceedToPayment={handleProceedToPayment}
                isProcessing={isProcessing}
            />
        </div>
    );
};

export default CheckoutPage; 