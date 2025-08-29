import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Clock, 
  DollarSign,
  FileText,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const MyListings = ({ token }) => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/commission-listings/my-listings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      } else {
        throw new Error('Failed to fetch listings');
      }
    } catch (error) {
      toast.error('Failed to load commission listings');
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [token]);

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this commission listing?')) {
      return;
    }

    try {
      const response = await fetch(`/api/commission-listings/${listingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Commission listing deleted successfully');
        setListings(prev => prev.filter(listing => listing.id !== listingId));
      } else {
        throw new Error('Failed to delete listing');
      }
    } catch (error) {
      toast.error('Failed to delete commission listing');
    }
  };

  const toggleListingStatus = async (listingId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await fetch(`/api/commission-listings/${listingId}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Listing ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        setListings(prev => prev.map(listing => 
          listing.id === listingId ? { ...listing, status: newStatus } : listing
        ));
      } else {
        throw new Error('Failed to update listing status');
      }
    } catch (error) {
      toast.error('Failed to update listing status');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading commission listings...</p>
        </CardContent>
      </Card>
    );
  }

  if (!listings.length) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No commission listings yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first commission listing to start receiving commission requests from clients.
          </p>
          <Button onClick={() => navigate('/commissions/manage-listing')}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Listing
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">My Commission Listings</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage your commission service offerings ({listings.length} total)
              </p>
            </div>
            <Button onClick={() => navigate('/commissions/manage-listing')}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Listing
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Listings Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {listings.map((listing) => {
          const pricingDetails = JSON.parse(listing.pricing_details || '[]');
          const minPrice = pricingDetails.length > 0 
            ? Math.min(...pricingDetails.map(tier => parseFloat(tier.price)))
            : 0;
          const maxPrice = pricingDetails.length > 0 
            ? Math.max(...pricingDetails.map(tier => parseFloat(tier.price)))
            : 0;

          return (
            <Card key={listing.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{listing.title}</CardTitle>
                      <Badge 
                        variant={listing.status === 'active' ? 'default' : 'outline'}
                        className={listing.status === 'active' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                        }
                      >
                        {listing.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/commissions/manage-listing?edit=${listing.id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteListing(listing.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Pricing Overview */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Price Range
                    </div>
                    <div className="font-semibold text-gray-900">
                      {minPrice === maxPrice 
                        ? formatCurrency(minPrice)
                        : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
                      }
                    </div>
                  </div>

                  {/* Pricing Tiers */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">Service Tiers</h4>
                    <div className="grid gap-2">
                      {pricingDetails.slice(0, 3).map((tier, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 border rounded">
                          <div>
                            <span className="font-medium">{tier.title}</span>
                            <p className="text-xs text-gray-500 truncate">{tier.description}</p>
                          </div>
                          <span className="font-semibold">{formatCurrency(tier.price)}</span>
                        </div>
                      ))}
                      {pricingDetails.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{pricingDetails.length - 3} more tiers
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {listing.delivery_time || 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        {listing.reviews_count || 0} reviews
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleListingStatus(listing.id, listing.status)}
                      >
                        {listing.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Navigate to public view of listing (if such page exists)
                          toast.info('Public view coming soon');
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MyListings;
