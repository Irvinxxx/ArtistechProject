import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const SubmitProposalModal = ({ request, token, onClose, onProposalSubmitted }) => {
    const getSevenDaysFromNow = () => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        proposal_text: '',
        proposed_price: '',
        estimated_completion: getSevenDaysFromNow()
    });

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/commissions/proposal', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...formData, commission_id: request.id })
            });
            if (response.ok) {
                toast.success("Proposal submitted successfully!");
                onProposalSubmitted(); // This line is crucial
                onClose();
            } else {
                // It's better to get the specific error from the backend
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to submit proposal.");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Submit Proposal for "{request.title}"</DialogTitle>
                    <DialogDescription>Review the client's request and provide your terms.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="proposal_text">Your Proposal</Label>
                        <Textarea id="proposal_text" name="proposal_text" value={formData.proposal_text} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <Label htmlFor="proposed_price">Proposed Price (PHP)</Label>
                        <Input id="proposed_price" name="proposed_price" type="number" min={100} step="0.01" value={formData.proposed_price} onChange={handleInputChange} required />
                        <p className="text-xs text-gray-500 mt-1">Minimum ₱100.00</p>
                    </div>
                    <div>
                        <Label htmlFor="estimated_completion">Estimated Completion Date</Label>
                        <Input id="estimated_completion" name="estimated_completion" type="date" value={formData.estimated_completion} onChange={handleInputChange} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Submit Proposal</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const CommissionRequests = () => {
    const { token } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const fetchRequests = async () => {
        try {
            // Re-fetch the data to get the latest list
            const response = await fetch('/api/commissions/my-commissions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setRequests(data.filter(c => c.status === 'awaiting_proposal'));
            } else {
                throw new Error("Failed to fetch requests");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchRequests();
    }, [token]);
    
    if (loading) return <p>Loading requests...</p>;

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Incoming Commission Requests</CardTitle>
                    <CardDescription>Review requests from clients and submit your proposals.</CardDescription>
                </CardHeader>
                <CardContent>
                    {requests.length > 0 ? (
                        requests.map(req => (
                            <div key={req.id} className="border p-4 rounded-md flex justify-between items-center">
                                <div>
                                    <h4 className="font-semibold">{req.title}</h4>
                                    <p className="text-sm text-gray-500">From: {req.client_name}</p>
                                </div>
                                <Button onClick={() => setSelectedRequest(req)}>View & Propose</Button>
                            </div>
                        ))
                    ) : (
                        <p>No new commission requests.</p>
                    )}
                </CardContent>
            </Card>
            {selectedRequest && (
                <SubmitProposalModal 
                    request={selectedRequest} 
                    token={token} 
                    onClose={() => setSelectedRequest(null)}
                    onProposalSubmitted={fetchRequests} // Pass the fetch function as a prop
                />
            )}
        </>
    );
};

export default CommissionRequests;
