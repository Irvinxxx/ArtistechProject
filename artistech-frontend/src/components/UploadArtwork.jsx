import { useState, useEffect, useContext } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { 
  Upload, 
  Image as ImageIcon, 
  Shield, 
  X,
  Loader
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom';
import { Select } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AuthContext } from '../context/AuthContext';
import { toast } from 'sonner';
import ArtworkImage from './ui/artwork-image';

const UploadArtwork = () => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'digital-art',
    medium: '',
    dimensions: '',
    yearCreated: new Date().getFullYear().toString(),
    artwork_type: 'digital'
  })
  
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState(null)
  const [editMode, setEditMode] = useState(false);
  const [artworkId, setArtworkId] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('edit');
    if (id) {
      setEditMode(true);
      setArtworkId(id);
      fetchArtworkData(id);
    }
  }, [location]);

  const fetchArtworkData = async (id) => {
    try {
      const response = await fetch(`/api/artworks/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch artwork data');
      }
      const artwork = await response.json();
      setFormData({
        title: artwork.title,
        description: artwork.description,
        price: artwork.price,
        category: artwork.category_slug,
        medium: artwork.medium,
        dimensions: artwork.dimensions,
        yearCreated: artwork.year_created,
        artwork_type: artwork.artwork_type
      });
      if (artwork.original_image) {
        setPreviewUrl(artwork.original_image);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const categories = [
    { name: 'Digital Art', slug: 'digital-art' },
    { name: 'Traditional Painting', slug: 'traditional-painting' },
    { name: 'Photography', slug: 'photography' },
    { name: 'Sculpture', slug: 'sculpture' },
    { name: 'Abstract', slug: 'abstract' },
    { name: 'Portrait', slug: 'portrait' },
    { name: 'Landscape', slug: 'landscape' },
    { name: 'Architecture', slug: 'architecture' },
    { name: 'Mixed Media', slug: 'mixed-media' },
    { name: 'Conceptual', slug: 'conceptual' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setError(null);

    try {
      if (!token) throw new Error('You must be logged in to save a draft.');

      const draftFormData = new FormData();
      if (selectedFile) {
        draftFormData.append('artwork', selectedFile);
      }
      draftFormData.append('title', formData.title || 'Untitled Draft');
      draftFormData.append('description', formData.description);
      draftFormData.append('price', formData.price || 0);
      draftFormData.append('category', formData.category);
      draftFormData.append('medium', formData.medium);
      draftFormData.append('dimensions', formData.dimensions);
      draftFormData.append('yearCreated', formData.yearCreated);
      draftFormData.append('artwork_type', formData.artwork_type);

      const response = await fetch('/api/artworks/draft', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: draftFormData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save draft');
      }

      toast.success('Draft saved successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedFile && !editMode) {
      setError('Please select an artwork file');
      return
    }
    
    setIsUploading(true)
    setError(null)
    
    try {
      if (!token) throw new Error('You must be logged in to upload.');

      const uploadFormData = new FormData();
      if(selectedFile) {
        uploadFormData.append('artwork', selectedFile);
      }
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('price', formData.price);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('medium', formData.medium);
      uploadFormData.append('dimensions', formData.dimensions);
      uploadFormData.append('yearCreated', formData.yearCreated);
      uploadFormData.append('artwork_type', formData.artwork_type);

      const url = editMode ? `/api/artworks/${artworkId}` : '/api/artworks/upload-artwork';
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadFormData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      toast.success(data.message || `Artwork ${editMode ? 'updated' : 'uploaded'} successfully! Awaiting analysis.`);
      // We will no longer redirect automatically. The user can see the success toast.
      // navigate('/artist/dashboard');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{editMode ? 'Edit Digital Artwork' : 'Upload Digital Artwork'}</h1>
          <p className="text-gray-600 mt-1">{editMode ? 'Update the details of your digital artwork' : 'Share your digital art with the ArtisTech community'}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && <p className="text-red-500 text-sm text-center mb-4 p-3 bg-red-50 rounded-lg">{error}</p>}
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Digital Artwork File</h2>
            
            {!previewUrl ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="artwork-upload"
                />
                <label htmlFor="artwork-upload" className="cursor-pointer">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Upload your digital artwork</p>
                  <p className="text-gray-600">PNG, JPG, GIF up to 10MB • High resolution recommended</p>
                  <Button type="button" className="mt-4 bg-purple-600 hover:bg-purple-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Digital File
                  </Button>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <ArtworkImage
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                    showWatermark={false}
                    protectionLevel="low"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                    className="absolute top-2 right-2 bg-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Artwork Details</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter artwork title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.slug} value={category.slug}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (PHP) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter price in PHP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Software/Medium
                </label>
                <select
                  name="medium"
                  value={formData.medium}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select software/medium</option>
                  <option value="Adobe Photoshop">Adobe Photoshop</option>
                  <option value="Adobe Illustrator">Adobe Illustrator</option>
                  <option value="Procreate">Procreate</option>
                  <option value="Clip Studio Paint">Clip Studio Paint</option>
                  <option value="Blender">Blender</option>
                  <option value="Maya">Maya</option>
                  <option value="3ds Max">3ds Max</option>
                  <option value="Figma">Figma</option>
                  <option value="Sketch">Sketch</option>
                  <option value="After Effects">After Effects</option>
                  <option value="Cinema 4D">Cinema 4D</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution (pixels)
                </label>
                <select
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select resolution</option>
                  <option value="1920 x 1080">1920 x 1080 (Full HD)</option>
                  <option value="2560 x 1440">2560 x 1440 (2K)</option>
                  <option value="3840 x 2160">3840 x 2160 (4K)</option>
                  <option value="4096 x 4096">4096 x 4096 (Square 4K)</option>
                  <option value="Custom">Custom Resolution</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Created
                </label>
                <input
                  type="number"
                  name="yearCreated"
                  value={formData.yearCreated}
                  onChange={handleInputChange}
                  min="2000"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={new Date().getFullYear()}
                />
                <p className="text-xs text-gray-500 mt-1">Defaults to current year</p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe your digital artwork: concept, techniques, tools used, inspiration, style, etc..."
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">Digital Art Protection</h3>
                <p className="text-blue-700 text-sm mt-1">
                  Your digital artwork will be automatically protected with watermarks and anti-grab technology to prevent unauthorized downloading and usage. We provide secure digital delivery to buyers after purchase.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isUploading}
            >
              {isSavingDraft ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save as Draft'
              )}
            </Button>
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {editMode ? 'Update Digital Art' : 'Publish Digital Art'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadArtwork

