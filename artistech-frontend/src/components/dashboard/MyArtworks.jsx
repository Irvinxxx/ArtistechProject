import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ArtworkImage from '@/components/ui/artwork-image';
import { 
  Upload, 
  Edit, 
  Eye, 
  Trash2, 
  Shield, 
  Heart, 
  Package, 
  Monitor,
  Search,
  Filter,
  Plus,
  Palette
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';

const ArtworkStatusBadge = ({ status, score }) => {
  const getBadgeInfo = () => {
    const isScoreNumber = typeof score === 'number';
    let scoreText = isScoreNumber ? `(Score: ${score.toFixed(2)})` : '';

    switch (status) {
      case 'published':
        return {
          variant: 'default',
          className: 'bg-green-100 text-green-800 border-green-200',
          text: 'Published',
          tooltip: `Your artwork is live and visible to everyone. AI Score: ${isScoreNumber ? score.toFixed(2) : 'N/A'}`
        };
      case 'pending_detection':
        return {
          variant: 'outline',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 animate-pulse',
          text: 'Analyzing...',
          tooltip: 'Our system is currently analyzing your artwork for authenticity. This usually takes a few minutes.'
        };
      case 'rejected_ai':
        return {
          variant: 'destructive',
          className: 'bg-red-100 text-red-800 border-red-200',
          text: `Rejected ${scoreText}`,
          tooltip: `This artwork was flagged as potentially AI-generated. Please contact support if you believe this is an error.`
        };
       case 'rejected_error':
        return {
          variant: 'destructive',
          className: 'bg-red-100 text-red-800 border-red-200',
          text: 'Analysis Error',
          tooltip: 'We encountered an error while analyzing this artwork. Please try re-uploading or contact support.'
        };
      case 'draft':
        return {
          variant: 'outline',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          text: 'Draft',
          tooltip: 'This is a draft and is not visible to the public.'
        };
      default:
        return {
          variant: 'outline',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          text: status,
          tooltip: `Artwork status: ${status}`
        };
    }
  };

  const badgeInfo = getBadgeInfo();

  return (
    <Badge 
      variant={badgeInfo.variant}
      className={badgeInfo.className}
      title={badgeInfo.tooltip}
    >
      {badgeInfo.text}
    </Badge>
  );
};

const MyArtworks = ({ artworks = [], onDelete, onViewReport, token }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Filter artworks based on search and filters
  const filteredArtworks = artworks.filter(artwork => {
    const matchesSearch = (artwork.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || artwork.status === statusFilter;
    const matchesType = typeFilter === 'all' || artwork.artwork_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (!artworks.length) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No artworks yet</h3>
          <p className="text-gray-600 mb-6">Start building your portfolio by uploading your first artwork.</p>
          <Button onClick={() => navigate('/upload')}>
            <Plus className="w-4 h-4 mr-2" />
            Upload Your First Artwork
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">My Artworks</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage your artwork portfolio ({artworks.length} total)
              </p>
            </div>
            <Button onClick={() => navigate('/upload')}>
              <Plus className="w-4 h-4 mr-2" />
              Upload New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search artworks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_detection">Analyzing</SelectItem>
                  <SelectItem value="rejected_ai">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Artworks Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredArtworks.map((artwork) => (
          <Card key={artwork.id} className="group hover:shadow-lg transition-all duration-200">
            <div className="relative">
              <ArtworkImage
                src={artwork.thumbnail_image}
                alt={artwork.title || 'Artwork'}
                className="w-full h-48 object-cover rounded-t-lg"
                showWatermark={true}
              />
              
              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                <ArtworkStatusBadge status={artwork.status || 'unknown'} score={artwork.ai_detection_score} />
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Title and Price */}
                <div>
                  <h4 className="font-semibold text-gray-900 truncate">{artwork.title || 'Untitled'}</h4>
                  {(artwork.price || 0) > 0 && (
                    <p className="text-lg font-bold text-purple-600">{formatCurrency(artwork.price)}</p>
                  )}
                </div>
                
                {/* Type and Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    {(artwork.artwork_type || 'digital') === 'physical' ? (
                      <Package className="w-4 h-4 mr-1" />
                    ) : (
                      <Monitor className="w-4 h-4 mr-1" />
                    )}
                    <span className="capitalize">{artwork.artwork_type || 'digital'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {artwork.views || 0}
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      {artwork.likes || 0}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  {!(artwork.status || '').startsWith('rejected') && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/upload?edit=${artwork.id}`)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/artworks/${artwork.id}`)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete && onDelete(artwork.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
                
                {/* AI Report Button */}
                {(artwork.status !== 'pending_detection' && artwork.status !== 'draft') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => onViewReport && onViewReport(artwork)}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    View AI Report
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* No Results */}
      {filteredArtworks.length === 0 && artworks.length > 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No artworks found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search terms or filters.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyArtworks;
