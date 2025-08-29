import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { 
  Shield, 
  Eye, 
  Download, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Lock,
  Unlock,
  Info
} from 'lucide-react'
import ProtectedImage from './ProtectedImage.jsx'
import { toast } from 'sonner'

const AntiGrabDemo = () => {
  const [protectionLevel, setProtectionLevel] = useState('high')
  const [showWatermark, setShowWatermark] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  const demoImages = [
    {
      src: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop',
      title: 'Digital Landscape',
      artist: 'Maria Santos',
      description: 'A beautiful digital landscape showcasing modern artistic techniques.'
    },
    {
      src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
      title: 'Abstract Portrait',
      artist: 'Juan Dela Cruz',
      description: 'An expressive abstract portrait with vibrant colors.'
    },
    {
      src: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&h=400&fit=crop',
      title: 'Modern Architecture',
      artist: 'Ana Rodriguez',
      description: 'Contemporary architectural photography with stunning composition.'
    }
  ]

  const protectionFeatures = {
    low: [
      'Basic watermark',
      'Right-click disabled',
      'Drag prevention'
    ],
    medium: [
      'Enhanced watermark',
      'Right-click disabled',
      'Drag prevention',
      'Text selection disabled',
      'Basic keyboard shortcuts blocked'
    ],
    high: [
      'Advanced watermark',
      'Right-click disabled',
      'Drag prevention',
      'Text selection disabled',
      'Keyboard shortcuts blocked',
      'Invisible overlay protection',
      'Print protection',
      'Developer tools detection'
    ]
  }

  const handleDownload = () => {
    toast.info('Download would require user authentication and watermark the downloaded image.')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Anti-Grab Protection Demo</h1>
              <p className="text-gray-600 mt-1">Experience our advanced artwork protection technology</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Demo Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Demo Artwork</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {demoImages.map((image, index) => (
                  <div 
                    key={index}
                    className={`cursor-pointer rounded-lg border-2 p-3 transition-colors ${
                      selectedImage === index 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={image.src} 
                      alt={image.title}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                    <p className="font-medium text-sm text-gray-900">{image.title}</p>
                    <p className="text-xs text-gray-600">by {image.artist}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Protected Image Display */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Protected Artwork</h2>
                <div className="flex items-center space-x-2">
                  <Shield className={`h-5 w-5 ${
                    protectionLevel === 'high' ? 'text-red-500' :
                    protectionLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-700">
                    {protectionLevel.toUpperCase()} Protection
                  </span>
                </div>
              </div>

              <div className="relative">
                <ProtectedImage
                  src={demoImages[selectedImage].src}
                  alt={demoImages[selectedImage].title}
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                  showWatermark={showWatermark}
                  protectionLevel={protectionLevel}
                  allowDownload={false}
                  onDownload={handleDownload}
                />
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{demoImages[selectedImage].title}</h3>
                <p className="text-sm text-gray-600 mb-2">by {demoImages[selectedImage].artist}</p>
                <p className="text-sm text-gray-700">{demoImages[selectedImage].description}</p>
              </div>
            </div>

            {/* Try These Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Try These Actions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                    <div>
                      <p className="font-medium text-red-800">Right-click on image</p>
                      <p className="text-sm text-red-600">Context menu will be blocked</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                    <div>
                      <p className="font-medium text-red-800">Try to drag the image</p>
                      <p className="text-sm text-red-600">Drag operation will be prevented</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                    <div>
                      <p className="font-medium text-red-800">Press Ctrl+S</p>
                      <p className="text-sm text-red-600">Save shortcut will be blocked</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                    <div>
                      <p className="font-medium text-red-800">Try to select text</p>
                      <p className="text-sm text-red-600">Text selection is disabled</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                    <div>
                      <p className="font-medium text-red-800">Press F12</p>
                      <p className="text-sm text-red-600">Developer tools access blocked</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="font-medium text-green-800">View artwork normally</p>
                      <p className="text-sm text-green-600">Normal viewing is unaffected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Controls */}
          <div className="space-y-6">
            {/* Protection Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Protection Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Protection Level
                  </label>
                  <select
                    value={protectionLevel}
                    onChange={(e) => setProtectionLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low - Basic Protection</option>
                    <option value="medium">Medium - Enhanced Protection</option>
                    <option value="high">High - Maximum Protection</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="watermark"
                    checked={showWatermark}
                    onChange={(e) => setShowWatermark(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="watermark" className="ml-2 text-sm text-gray-700">
                    Show watermark
                  </label>
                </div>
              </div>
            </div>

            {/* Protection Features */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                {protectionLevel === 'high' ? <Lock className="h-5 w-5 mr-2 text-red-500" /> : 
                 protectionLevel === 'medium' ? <Lock className="h-5 w-5 mr-2 text-yellow-500" /> :
                 <Unlock className="h-5 w-5 mr-2 text-green-500" />}
                Active Features
              </h3>
              
              <div className="space-y-2">
                {protectionFeatures[protectionLevel].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                How It Works
              </h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>Client-Side Protection:</strong> JavaScript prevents common grab methods like right-click, drag, and keyboard shortcuts.
                </p>
                <p>
                  <strong>CSS Protection:</strong> Styles disable text selection, user drag, and print functionality.
                </p>
                <p>
                  <strong>Watermarking:</strong> Visible and invisible watermarks identify the source and ownership.
                </p>
                <p>
                  <strong>Server-Side:</strong> Images are processed with watermarks before delivery to browsers.
                </p>
              </div>
            </div>

            {/* Limitations Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Important Note</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    While these protections significantly deter casual copying, determined users with technical knowledge may still find ways to access content. This system provides reasonable protection for most use cases.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AntiGrabDemo

