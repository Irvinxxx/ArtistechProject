import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, ArrowLeft, DollarSign, Calendar, FileText, Target } from 'lucide-react';
import ArtworkImage from '../components/ui/artwork-image';

const CreatePublicCommissionPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + referenceImages.length > 5) {
      toast.error('Maximum 5 reference images allowed');
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

    setLoading(true);
    const submitData = new FormData();
    
    // Add form fields
    Object.keys(formData).forEach(key => {
      if (formData[key]) submitData.append(key, formData[key]);
    });
    
    // Add reference images
    referenceImages.forEach(file => {
      submitData.append('reference_images', file);
    });

    try {
      const response = await fetch('/api/commissions/public-request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Public commission request posted successfully!');
        navigate('/client/dashboard');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to post commission request');
      }
    } catch (error) {
      console.error('Error posting commission request:', error);
      toast.error('Failed to post commission request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/client/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Post Digital Art Commission Request</h1>
        <p className="text-gray-600 mt-2">
          Create an open digital art commission request that any artist can see and submit proposals for. Get creative proposals from multiple talented digital artists.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Commission Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Commission Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Custom Digital Character Portrait, Logo Design, UI/UX Mockup, Game Art Asset"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your digital art project in detail: style preferences, resolution/dimensions, file format needs, purpose (social media, print, web), color palette, mood, etc."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="requirements">Specific Requirements</Label>
              <Textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="Technical requirements: resolution (e.g., 1920x1080), file formats (PNG, JPG, PSD), software preferences, number of revisions included, usage rights, etc."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Budget & Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget_min">Minimum Budget (PHP)</Label>
                <Input
                  id="budget_min"
                  name="budget_min"
                  type="number"
                  step="100"
                  min="0"
                  placeholder="e.g., 1500"
                  value={formData.budget_min}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_max">Maximum Budget (PHP)</Label>
                <Input
                  id="budget_max"
                  name="budget_max"
                  type="number"
                  step="100"
                  min="0"
                  placeholder="e.g., 3000"
                  value={formData.budget_max}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]} // Prevents selecting past dates
                  className="flex-grow"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => setDeadline(15)}>15 Days</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setDeadline(30)}>30 Days</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setDeadline(60)}>60 Days</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Reference Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reference_images">Upload Reference Images (Max 5)</Label>
                <Input
                  id="reference_images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload images that show your vision, style preferences, or examples of what you're looking for.
                </p>
              </div>

              {referenceImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {referenceImages.map((file, index) => (
                    <div key={index} className="relative">
                      <ArtworkImage
                        src={URL.createObjectURL(file)}
                        alt={`Reference ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                        showWatermark={false}
                        protectionLevel="low"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/client/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Posting Request...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Post Commission Request
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePublicCommissionPage;
