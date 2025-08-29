import { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import ArtworkImage from '../components/ui/artwork-image';

const CommissionRequestPage = () => {
    const [searchParams] = useSearchParams();
    const artistId = searchParams.get('artistId');
    const listingId = searchParams.get('listingId');
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const getFutureDate = (days) => {
        const today = new Date();
        today.setDate(today.getDate() + days);
        return today.toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget_min: '',
        budget_max: '',
        deadline: getFutureDate(30),
        requirements: ''
    });
    const [referenceImages, setReferenceImages] = useState([]);

    useEffect(() => {
        if (listingId) {
            // Pre-fill form from listing if needed (logic can be added here)
        }
    }, [listingId]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        // Basic file validation
        const files = Array.from(e.target.files);
        if (files.length + referenceImages.length > 5) {
            toast.error('You can upload a maximum of 5 images.');
            return;
        }
        setReferenceImages(prev => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setReferenceImages(prev => prev.filter((_, i) => i !== index));
    };

    const setDeadline = (days) => {
        setFormData(prev => ({ ...prev, deadline: getFutureDate(days) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- Budget Validation ---
        const budgetMin = parseFloat(formData.budget_min);
        const budgetMax = parseFloat(formData.budget_max);

        if (!isNaN(budgetMin) && !isNaN(budgetMax) && budgetMax < budgetMin) {
            toast.error('Maximum budget cannot be less than the minimum budget.');
            return;
        }

        if (!artistId) {
            toast.error('Artist ID is missing.');
            return;
        }
        setLoading(true);

        const postData = new FormData();
        postData.append('artist_id', artistId);
        if (listingId) {
            postData.append('source_listing_id', listingId);
        }
        Object.keys(formData).forEach(key => {
            postData.append(key, formData[key]);
        });
        referenceImages.forEach(file => {
            postData.append('reference_images', file);
        });

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/commissions/request`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: postData
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Commission request sent successfully!');
                navigate('/my-dashboard'); // Or to a confirmation page
            } else {
                throw new Error(data.error || 'Failed to send request.');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Card>
                <CardHeader>
                    <CardTitle>Request a Commission</CardTitle>
                    <CardDescription>Fill out the details below to send a direct commission request.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required placeholder="e.g., Fantasy Character Portrait" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} required placeholder="Describe your vision for the artwork in detail." rows={5} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="budget_min">Minimum Budget (PHP)</Label>
                                <Input id="budget_min" name="budget_min" type="number" step="100" min="0" placeholder="e.g., 1500" value={formData.budget_min} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="budget_max">Maximum Budget (PHP)</Label>
                                <Input id="budget_max" name="budget_max" type="number" step="100" min="0" placeholder="e.g., 3000" value={formData.budget_max} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deadline">Deadline</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="deadline"
                                    name="deadline"
                                    type="date"
                                    value={formData.deadline}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="flex-grow"
                                />
                                <Button type="button" variant="outline" size="sm" onClick={() => setDeadline(15)}>15 Days</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => setDeadline(30)}>30 Days</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => setDeadline(60)}>60 Days</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="requirements">Specific Requirements</Label>
                            <Textarea id="requirements" name="requirements" value={formData.requirements} onChange={handleInputChange} placeholder="List any specific details, e.g., image dimensions, style, things to include/avoid." rows={3} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reference_images">Reference Images (Max 5)</Label>
                            <Input id="reference_images" type="file" multiple onChange={handleFileChange} accept="image/*" />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {referenceImages.map((file, index) => (
                                    <div key={index} className="relative">
                                        <ArtworkImage 
                                          src={URL.createObjectURL(file)} 
                                          alt={`preview ${index}`} 
                                          className="h-20 w-20 object-cover rounded" 
                                          showWatermark={false}
                                          protectionLevel="low"
                                        />
                                        <button type="button" onClick={() => removeImage(index)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">&times;</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Commission Request'}</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CommissionRequestPage;
