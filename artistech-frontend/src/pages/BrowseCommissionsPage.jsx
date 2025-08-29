import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ArtworkImage from '../components/ui/artwork-image'; // Import ArtworkImage
import ProtectedAvatar from '../components/ui/ProtectedAvatar';
import { 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  User, 
  Calendar,
  FileText,
  Users,
  Send,
  Eye,
  SortAsc,
  SortDesc
} from 'lucide-react';

const ProposalModal = ({ commission, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    proposal_text: '',
    proposed_price: '',
    estimated_completion: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.proposal_text || !formData.proposed_price) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSubmit({ ...formData, commission_id: commission.id });
  };

  const resetForm = () => {
    setFormData({
      proposal_text: '',
      proposed_price: '',
      estimated_completion: ''
    });
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Proposal for "{commission?.title}"</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="proposal_text">Your Proposal *</Label>
            <Textarea
              id="proposal_text"
              name="proposal_text"
              value={formData.proposal_text}
              onChange={handleInputChange}
              placeholder="Describe your approach, experience, and why you're the right artist for this project..."
              rows={6}
              className="resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proposed_price">Your Price (PHP) *</Label>
              <Input
                id="proposed_price"
                name="proposed_price"
                type="number"
                step="0.01"
                min={100}
                value={formData.proposed_price}
                onChange={handleInputChange}
                placeholder="0.00"
                required
              />
              <p className="text-xs text-gray-500">Minimum ₱100.00</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_completion">Estimated Completion</Label>
              <Input
                id="estimated_completion"
                name="estimated_completion"
                type="date"
                value={formData.estimated_completion}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Send className="w-4 h-4 mr-2" />
              Submit Proposal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CommissionCard = ({ commission, onViewProposal }) => {
  const navigate = useNavigate();
  
  const getBudgetDisplay = () => {
    if (commission.budget_min && commission.budget_max) {
      return `$${commission.budget_min} - $${commission.budget_max}`;
    } else if (commission.budget_min) {
      return `$${commission.budget_min}+`;
    } else if (commission.budget_max) {
      return `Up to $${commission.budget_max}`;
    }
    return 'Budget negotiable';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow h-fit">
      <CardContent className="p-4">
        {/* Header - Compact */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <ProtectedAvatar 
              src={commission.client_profile_image} 
              alt={commission.client_name}
              fallbackText={commission.client_name?.charAt(0)}
              className="h-8 w-8 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base line-clamp-1 mb-1">{commission.title}</CardTitle>
              <p className="text-xs text-gray-600 truncate">by {commission.client_name}</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1 text-xs ml-2">
            <Users className="w-3 h-3" />
            {commission.proposal_count || 0}
          </Badge>
        </div>

        {/* Description - Compact */}
        <p className="text-sm text-gray-700 line-clamp-2 mb-3">{commission.description}</p>
        
        {/* Budget and Dates - Horizontal Layout */}
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="secondary" className="text-xs">
            <DollarSign className="w-3 h-3 mr-1" />
            {getBudgetDisplay()}
          </Badge>
          
          {commission.deadline && (
            <Badge variant="outline" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(commission.deadline)}
            </Badge>
          )}
          
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {new Date(commission.created_at).toLocaleDateString()}
          </Badge>
        </div>

        {/* Requirements - Very Compact */}
        {commission.requirements && (
          <div className="bg-gray-50 p-2 rounded mb-3">
            <p className="text-xs text-gray-600 line-clamp-2">
              <span className="font-medium">Requirements: </span>
              {commission.requirements}
            </p>
          </div>
        )}

        {/* Reference Images - Smaller and Inline */}
        {commission.reference_images && commission.reference_images.length > 0 && (
          <div className="mb-3">
            <div className="flex gap-1">
              {commission.reference_images.slice(0, 4).map((image, index) => (
                <ArtworkImage
                  key={index}
                  src={image}
                  alt={`Reference ${index + 1}`}
                  className="w-8 h-8 object-cover rounded border"
                  fallbackText=""
                  showWatermark={false}
                />
              ))}
              {commission.reference_images.length > 4 && (
                <div className="w-8 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs">
                  +{commission.reference_images.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons - Compact */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/commissions/${commission.id}`)}
            className="flex-1 text-xs h-8"
          >
            <Eye className="w-3 h-3 mr-1" />
            Details
          </Button>
          <Button 
            size="sm"
            onClick={() => onViewProposal(commission)}
            className="flex-1 text-xs h-8 bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-3 h-3 mr-1" />
            Propose
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const BrowseCommissionsPage = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    budget_min: '',
    budget_max: '',
    sort: 'newest',
    page: 1
  });

  const fetchCommissions = async (newFilters = {}) => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams({
        ...filters,
        ...newFilters
      });

      const response = await fetch(`/api/commissions/browse?${searchParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCommissions(data.commissions);
        setPagination(data.pagination);
      } else {
        throw new Error('Failed to fetch commissions');
      }
    } catch (error) {
      console.error('Error fetching commissions:', error);
      toast.error('Failed to load commissions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    fetchCommissions(newFilters);
  };

  const handleSubmitProposal = async (proposalData) => {
    try {
      const response = await fetch('/api/commissions/proposal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(proposalData)
      });

      if (response.ok) {
        toast.success('Proposal submitted successfully!');
        setShowProposalModal(false);
        setSelectedCommission(null);
        // Refresh commissions to update proposal count
        fetchCommissions();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit proposal');
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast.error(error.message);
    }
  };

  const handlePageChange = (newPage) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    fetchCommissions(newFilters);
  };

  useEffect(() => {
    if (user?.user_type !== 'artist') {
      navigate('/');
      return;
    }
    fetchCommissions();
  }, [user, token, navigate]);

  if (loading && commissions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading commission opportunities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Commission Requests</h1>
          <p className="text-gray-600">Find exciting projects and submit your proposals</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search commissions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Input
                type="number"
                placeholder="Min budget"
                value={filters.budget_min}
                onChange={(e) => handleFilterChange('budget_min', e.target.value)}
              />
              
              <Input
                type="number"
                placeholder="Max budget"
                value={filters.budget_max}
                onChange={(e) => handleFilterChange('budget_max', e.target.value)}
              />
              
              <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="budget_high">Highest Budget</SelectItem>
                  <SelectItem value="budget_low">Lowest Budget</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {commissions.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No commissions found</h3>
              <p className="text-gray-600">
                {filters.search || filters.budget_min || filters.budget_max
                  ? 'Try adjusting your filters to see more results.'
                  : 'No public commission requests are currently available.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Found {pagination.total} commission{pagination.total !== 1 ? 's' : ''}
            </div>
            
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {commissions.map((commission) => (
                <CommissionCard
                  key={commission.id}
                  commission={commission}
                  onViewProposal={(commission) => {
                    setSelectedCommission(commission);
                    setShowProposalModal(true);
                  }}
                />
              ))}
            </div>

            {/* Pagination - Enhanced */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-6 p-4 bg-gray-50 rounded-lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-4"
                >
                  ← Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {/* Show page numbers for better navigation */}
                  {pagination.page > 2 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        className="px-3"
                      >
                        1
                      </Button>
                      {pagination.page > 3 && <span className="text-gray-400">...</span>}
                    </>
                  )}
                  
                  {pagination.page > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className="px-3"
                    >
                      {pagination.page - 1}
                    </Button>
                  )}
                  
                  <Button
                    variant="default"
                    size="sm"
                    className="px-3 bg-purple-600 hover:bg-purple-700"
                  >
                    {pagination.page}
                  </Button>
                  
                  {pagination.page < pagination.totalPages && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className="px-3"
                    >
                      {pagination.page + 1}
                    </Button>
                  )}
                  
                  {pagination.page < pagination.totalPages - 1 && (
                    <>
                      {pagination.page < pagination.totalPages - 2 && <span className="text-gray-400">...</span>}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(pagination.totalPages)}
                        className="px-3"
                      >
                        {pagination.totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4"
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}

        {/* Proposal Modal */}
        <ProposalModal
          commission={selectedCommission}
          isOpen={showProposalModal}
          onClose={() => {
            setShowProposalModal(false);
            setSelectedCommission(null);
          }}
          onSubmit={handleSubmitProposal}
        />
      </div>
    </div>
  );
};

export default BrowseCommissionsPage;
