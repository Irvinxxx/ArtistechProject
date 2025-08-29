import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import ArtworkImage from '../components/ui/artwork-image';

const ProposalReviewPage = () => {
    const { commissionId } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);

    const [commission, setCommission] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCommissionAndProposals = async () => {
            setIsLoading(true);
            try {
                // Fetch the commission details
                const commissionRes = await fetch(`/api/commissions/${commissionId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const commissionData = await commissionRes.json();
                
                if (!commissionRes.ok) {
                    if (commissionRes.status === 403 || commissionRes.status === 404) {
                        throw new Error('Commission not found or you are not authorized to view it.');
                    }
                    throw new Error(commissionData.error || 'Failed to fetch commission.');
                }
                setCommission(commissionData);

                // Fetch the proposals
                const proposalsRes = await fetch(`/api/commissions/${commissionId}/proposals`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const proposalsData = await proposalsRes.json();
                
                if (!proposalsRes.ok) {
                    if (proposalsRes.status === 403 || proposalsRes.status === 404) {
                        throw new Error('You are not authorized to view proposals for this commission.');
                    }
                    throw new Error(proposalsData.error || 'Failed to fetch proposals.');
                }
                setProposals(proposalsData);

            } catch (error) {
                console.error('Error fetching commission and proposals:', error);
                if (error.message.includes('not authorized') || error.message.includes('not found')) {
                    toast.error('Commission not found or you are not authorized to view it.');
                    navigate('/client/dashboard');
                } else {
                    toast.error('Failed to load commission details. Please try again.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchCommissionAndProposals();
        }
    }, [commissionId, token, navigate]);
    
    const handleAcceptProposal = async (proposalId) => {
        try {
            const response = await fetch(`/api/commissions/proposals/${proposalId}/accept`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to accept proposal.');
            }
            toast.success('Proposal accepted! Redirecting to payment...');
            // Redirect to the new checkout page instead of the project page
            navigate(`/commissions/checkout?projectId=${data.projectId}`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="text-center py-12">Loading proposals...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Proposals</h1>
            <p className="text-lg text-gray-600 mb-8">For your request: "{commission?.title}"</p>

            {proposals.length === 0 ? (
                <p>No proposals have been submitted for this request yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {proposals.map(proposal => (
                        <Card key={proposal.id}>
                            <CardHeader>
                                <div className="flex items-center space-x-4">
                                    <ArtworkImage 
                                      src={proposal.artist_profile_image} 
                                      alt={proposal.artist_name} 
                                      className="w-16 h-16 rounded-full" 
                                      fallbackText={proposal.artist_name.charAt(0)}
                                      showWatermark={false}
                                      protectionLevel="medium"
                                    />
                                    <div>
                                        <CardTitle>{proposal.artist_name}</CardTitle>
                                        <CardDescription>Submitted on {new Date(proposal.created_at).toLocaleDateString()}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">Proposed Price</h4>
                                    <p className="text-xl font-bold text-purple-600">{formatCurrency(proposal.proposed_price)}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Estimated Completion</h4>
                                    <p>{new Date(proposal.estimated_completion).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Message</h4>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{proposal.proposal_text}</p>
                                </div>
                                <Button 
                                    className="w-full" 
                                    onClick={() => handleAcceptProposal(proposal.id)}
                                    disabled={!['open', 'awaiting_proposal'].includes(commission.status)}
                                >
                                    {['open', 'awaiting_proposal'].includes(commission.status) ? 'Accept Proposal & Start Project' : `Project ${commission.status}`}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProposalReviewPage;
