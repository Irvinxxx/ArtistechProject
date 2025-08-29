import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

const ManageCommissionListingPage = () => {
    const [searchParams] = useSearchParams();
    const listingId = searchParams.get('id');
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        pricing_model: 'tiered',
        pricing_details: [{ title: 'Basic', price: '', description: '' }],
        revisions_policy: '',
        turnaround_time: '',
        status: 'active',
        tags: ''
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (listingId) {
            const fetchListing = async () => {
                try {
                    const response = await fetch(`/api/commission-listings/${listingId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setFormData({
                            ...data,
                            pricing_details: JSON.parse(data.pricing_details)
                        });
                    } else {
                        toast.error("Failed to load listing for editing.");
                        navigate('/artist/dashboard');
                    }
                } catch (error) {
                    toast.error("An error occurred while fetching the listing.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchListing();
        } else {
            setIsLoading(false);
        }
    }, [listingId, navigate]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handlePricingModelChange = (value) => {
        setFormData(prev => ({ 
            ...prev, 
            pricing_model: value,
            pricing_details: value === 'tiered' 
                ? [{ title: 'Basic', price: '', description: '' }]
                : [{ title: 'Rate', price: '', description: 'per hour' }]
        }));
    };

    const handleTierChange = (index, e) => {
        const newTiers = [...formData.pricing_details];
        newTiers[index][e.target.name] = e.target.value;
        setFormData({ ...formData, pricing_details: newTiers });
    };

    const addTier = () => {
        setFormData(prev => ({
            ...prev,
            pricing_details: [...prev.pricing_details, { title: '', price: '', description: '' }]
        }));
    };

    const removeTier = (index) => {
        setFormData(prev => ({
            ...prev,
            pricing_details: prev.pricing_details.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = listingId ? `/api/commission-listings/${listingId}` : '/api/commission-listings';
        const method = listingId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                toast.success(`Listing ${listingId ? 'updated' : 'created'} successfully!`);
                navigate('/artist/dashboard?tab=commissions');
            } else {
                const data = await response.json();
                throw new Error(data.error || "Failed to save listing.");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (isLoading) return <p>Loading listing form...</p>;

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                {listingId ? 'Edit Commission Listing' : 'Create a New Commission Listing'}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Stylized Character Portraits" required />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe what you're offering in detail." />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                        <CardDescription>Choose how you want to price this service.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={formData.pricing_model} onValueChange={handlePricingModelChange} className="mb-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="tiered" id="tiered" /><Label htmlFor="tiered">Tiered Pricing</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="hourly" id="hourly" /><Label htmlFor="hourly">Hourly Rate</Label></div>
                        </RadioGroup>
                        
                        {formData.pricing_model === 'tiered' && (
                            <div className="space-y-4">
                                {formData.pricing_details.map((tier, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 p-4 border rounded-md">
                                        <div className="col-span-3"><Input name="title" value={tier.title} onChange={e => handleTierChange(index, e)} placeholder="Tier Name (e.g., Basic)" /></div>
                                        <div className="col-span-3"><Input name="price" type="number" value={tier.price} onChange={e => handleTierChange(index, e)} placeholder="Price (PHP)" /></div>
                                        <div className="col-span-5"><Input name="description" value={tier.description} onChange={e => handleTierChange(index, e)} placeholder="Description (e.g., Headshot, flat colors)" /></div>
                                        <div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => removeTier(index)}><Trash2 className="h-4 w-4" /></Button></div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={addTier}><PlusCircle className="mr-2 h-4 w-4" /> Add Tier</Button>
                            </div>
                        )}

                        {formData.pricing_model === 'hourly' && (
                           <div className="grid grid-cols-12 gap-2 p-4 border rounded-md">
                                <div className="col-span-3"><Input name="title" value={formData.pricing_details[0].title} disabled /></div>
                                <div className="col-span-3"><Input name="price" type="number" value={formData.pricing_details[0].price} onChange={e => handleTierChange(0, e)} placeholder="Price (PHP)" /></div>
                                <div className="col-span-6"><Input name="description" value={formData.pricing_details[0].description} disabled /></div>
                           </div>
                        )}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader><CardTitle>Policies & Delivery</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="revisions_policy">Revision Policy</Label>
                            <Input id="revisions_policy" name="revisions_policy" value={formData.revisions_policy} onChange={handleInputChange} placeholder="e.g., 2 free revisions, then $10 each" />
                        </div>
                        <div>
                            <Label htmlFor="turnaround_time">Estimated Turnaround Time</Label>
                            <Input id="turnaround_time" name="turnaround_time" value={formData.turnaround_time} onChange={handleInputChange} placeholder="e.g., 1-2 weeks" />
                        </div>
                        <div>
                            <Label htmlFor="tags">Tags / Keywords</Label>
                            <Input id="tags" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="e.g., character design, anime, fantasy" />
                            <p className="text-sm text-gray-500 mt-1">Comma-separated keywords to help clients find you.</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit">
                        {listingId ? 'Save Changes' : 'Create Listing'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ManageCommissionListingPage;
