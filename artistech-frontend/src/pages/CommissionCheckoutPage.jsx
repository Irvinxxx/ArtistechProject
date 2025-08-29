import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const CommissionCheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);

    const queryParams = new URLSearchParams(location.search);
    const projectId = queryParams.get('projectId');
    const milestoneId = queryParams.get('milestoneId');

    useEffect(() => {
        const fetchProjectDetails = async () => {
            if (!projectId) {
                toast.error("No project specified for payment.");
                navigate('/client/dashboard');
                return;
            }

            try {
                const response = await fetch(`/api/projects/${projectId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const project = await response.json();
                    setPaymentDetails({
                        title: milestoneId ? `Milestone Payment` : `Initial Project Payment`,
                        description: `Commission: ${project.commission_title}`,
                        amount: milestoneId ? null : project.final_price, // Will fetch milestone amount separately if needed
                        projectTitle: project.commission_title,
                        artistName: project.artist_name
                    });
                } else {
                    throw new Error('Failed to fetch project details');
                }
            } catch (error) {
                console.error('Error fetching project details:', error);
                setPaymentDetails({
                    title: milestoneId ? `Milestone Payment` : `Project Initial Payment`,
                    description: `Payment for project ID: ${projectId}`,
                    amount: null
                });
            }
        };

        if (token) {
            fetchProjectDetails();
        }
    }, [projectId, milestoneId, navigate, token]);

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/checkout/create-commission-payment-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ projectId, milestoneId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(`Payment initiation failed: ${errorData.error}`);
                setIsLoading(false);
                return;
            }

            const { checkout_url } = await response.json();
            
            // Open payment in new window (similar to regular checkout)
            const paymentWindow = window.open(checkout_url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
            
            toast.info("Payment page opened in new window. Please complete your payment.");

            // Monitor the payment window
            const checkClosed = setInterval(() => {
                if (paymentWindow.closed) {
                    clearInterval(checkClosed);
                    setIsLoading(false);
                    toast.info("Payment window closed. We will notify you once payment is confirmed via webhook.");
                    navigate(`/project/${projectId}`);
                }
            }, 1000);

        } catch (error) {
            console.error('Payment error:', error);
            toast.error("An unexpected error occurred. Please try again.");
            setIsLoading(false);
        }
    };
    
    if (!paymentDetails) {
        return (
            <div className="container mx-auto p-4 max-w-lg">
                <Card>
                    <CardHeader><CardTitle><Skeleton className="h-8 w-3/4" /></CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 max-w-lg">
            <Card>
                <CardHeader>
                    <CardTitle>Commission Payment</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">{paymentDetails.title}</h2>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <p className="text-sm text-gray-600">Project:</p>
                            <p className="font-medium">{paymentDetails.projectTitle || paymentDetails.description}</p>
                            {paymentDetails.artistName && (
                                <>
                                    <p className="text-sm text-gray-600">Artist:</p>
                                    <p className="font-medium">{paymentDetails.artistName}</p>
                                </>
                            )}
                            {paymentDetails.amount && (
                                <>
                                    <p className="text-sm text-gray-600">Amount:</p>
                                    <p className="text-lg font-bold text-purple-600">₱{parseFloat(paymentDetails.amount).toLocaleString()}</p>
                                </>
                            )}
                        </div>
                        <p className="text-sm text-gray-600">Click below to proceed to the secure payment page. The payment will open in a new window.</p>
                        <Button onClick={handlePayment} disabled={isLoading} className="w-full">
                            {isLoading ? 'Processing...' : 'Proceed to Payment'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CommissionCheckoutPage;
