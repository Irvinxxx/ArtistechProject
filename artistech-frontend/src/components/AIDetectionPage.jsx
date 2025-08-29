import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { 
  Upload, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Loader, 
  Eye,
  BarChart3,
  Clock,
  Zap,
  Brain
} from 'lucide-react'
import { toast } from 'sonner'

const AIDetectionPage = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [detectionResult, setDetectionResult] = useState(null)
  const [detectionHistory, setDetectionHistory] = useState([
    {
      id: 1,
      filename: 'landscape_painting.jpg',
      result: 'Human Created',
      confidence: 94.2,
      timestamp: '2025-01-20 14:30:25',
      processingTime: 1250
    },
    {
      id: 2,
      filename: 'digital_portrait.png',
      result: 'AI Generated',
      confidence: 87.6,
      timestamp: '2025-01-20 13:15:10',
      processingTime: 980
    },
    {
      id: 3,
      filename: 'abstract_art.jpg',
      result: 'Human Created',
      confidence: 91.8,
      timestamp: '2025-01-20 12:45:33',
      processingTime: 1100
    }
  ])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setDetectionResult(null)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)
    
    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('service', 'mock') // Use mock service for demo
      
      const response = await fetch('http://localhost:3000/api/detect-ai-art', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        setDetectionResult(result.detection)
        
        // Add to history
        const newHistoryItem = {
          id: detectionHistory.length + 1,
          filename: selectedFile.name,
          result: result.detection.isAIGenerated ? 'AI Generated' : 'Human Created',
          confidence: (result.detection.confidence * 100).toFixed(1),
          timestamp: new Date().toLocaleString(),
          processingTime: result.detection.processingTime
        }
        setDetectionHistory([newHistoryItem, ...detectionHistory])
      } else {
        toast.error('Detection failed: ' + result.error)
      }
    } catch (error) {
      console.error('Detection error:', error)
      toast.error('Detection failed: ' + error.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setDetectionResult(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Art Detection</h1>
              <p className="text-gray-600 mt-1">Advanced AI technology to detect AI-generated artwork</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload and Analysis Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Artwork for Analysis</h2>
              
              {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="ai-detection-upload"
                  />
                  <label htmlFor="ai-detection-upload" className="cursor-pointer">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">Upload artwork for AI detection</p>
                    <p className="text-gray-600">PNG, JPG, GIF up to 10MB</p>
                    <Button type="button" className="mt-4 bg-purple-600 hover:bg-purple-700">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Preview */}
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                      style={{
                        userSelect: 'none',
                        pointerEvents: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none'
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeFile}
                      className="absolute top-2 right-2 bg-white"
                    >
                      Remove
                    </Button>
                  </div>

                  {/* File Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {/* Analyze Button */}
                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Analyze with AI Detection
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Results Section */}
            {detectionResult && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Detection Results</h2>
                
                <div className={`border rounded-lg p-4 ${
                  detectionResult.isAIGenerated 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-green-200 bg-green-50'
                }`}>
                  <div className="flex items-center mb-3">
                    {detectionResult.isAIGenerated ? (
                      <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                    ) : (
                      <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                    )}
                    <span className={`text-lg font-semibold ${
                      detectionResult.isAIGenerated ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {detectionResult.isAIGenerated ? 'AI-Generated Content Detected' : 'Human-Created Artwork Verified'}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Confidence Score</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(detectionResult.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Processing Time</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {detectionResult.processingTime}ms
                      </p>
                    </div>
                  </div>

                  {/* Detailed Analysis */}
                  {detectionResult.details && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Detailed Analysis</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">AI Generated Score:</span>
                          <span className="text-sm font-medium">
                            {(detectionResult.details.scores.ai_generated * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Human Created Score:</span>
                          <span className="text-sm font-medium">
                            {(detectionResult.details.scores.human_created * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Model:</span>
                          <span className="text-sm font-medium">{detectionResult.details.model}</span>
                        </div>
                      </div>
                      
                      {detectionResult.details.features_detected && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Features Detected:</p>
                          <div className="flex flex-wrap gap-1">
                            {detectionResult.details.features_detected.map((feature, index) => (
                              <span 
                                key={index}
                                className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded"
                              >
                                {feature.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How It Works */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How AI Detection Works</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <Upload className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">1. Upload Image</p>
                    <p className="text-sm text-gray-600">Upload your artwork for analysis</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <Brain className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">2. AI Analysis</p>
                    <p className="text-sm text-gray-600">Advanced algorithms analyze patterns</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">3. Get Results</p>
                    <p className="text-sm text-gray-600">Receive detailed confidence scores</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detection History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Detections</h3>
              <div className="space-y-3">
                {detectionHistory.slice(0, 5).map((item) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.filename}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.result === 'AI Generated' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.result}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.confidence}% confidence</span>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.processingTime}ms
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIDetectionPage

