import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const QuickActions = ({ userType, user, availability, onAvailabilityChange }) => {
  const navigate = useNavigate();

  const artistActions = [
    {
      label: 'Upload Artwork',
      onClick: () => navigate('/upload'),
      variant: 'default',
      icon: '🎨'
    },
    {
      label: 'Browse Commissions',
      onClick: () => navigate('/commissions/browse'),
      variant: 'default',
      icon: '🔍'
    },
    {
      label: 'Create Auction',
      onClick: () => navigate('/create-auction'),
      variant: 'outline',
      icon: '🔨'
    },
    {
      label: 'New Commission Listing',
      onClick: () => navigate('/commissions/manage-listing'),
      variant: 'outline',
      icon: '📝'
    },
    {
      label: 'View Public Profile',
      onClick: () => navigate(`/artists/${user?.id}`),
      variant: 'outline',
      icon: '👁️'
    }
  ];

  const clientActions = [
    {
      label: 'Browse Artworks',
      onClick: () => navigate('/artworks'),
      variant: 'default',
      icon: '🖼️'
    },
    {
      label: 'Post Commission Request',
      onClick: () => navigate('/commissions/post-public'),
      variant: 'default',
      icon: '📝'
    },
    {
      label: 'Find Artists',
      onClick: () => navigate('/artists/search'),
      variant: 'outline',
      icon: '🔍'
    },
    {
      label: 'View Cart',
      onClick: () => navigate('/cart'),
      variant: 'outline',
      icon: '🛒'
    },
    {
      label: 'My Wishlist',
      onClick: () => navigate('/wishlist'),
      variant: 'outline',
      icon: '❤️'
    }
  ];

  const actions = userType === 'artist' ? artistActions : clientActions;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={action.onClick}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <span className="text-lg">{action.icon}</span>
              <span className="text-xs font-medium text-center leading-tight">
                {action.label}
              </span>
            </Button>
          ))}
        </div>
        
        {userType === 'artist' && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Commission Status</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const statuses = ['Open', 'Limited', 'Closed'];
                  const currentIndex = statuses.indexOf(availability);
                  const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                  onAvailabilityChange(nextStatus);
                }}
                className="text-xs"
              >
                Change
              </Button>
            </div>
            <div className={`px-3 py-2 rounded-md text-sm font-medium text-center ${
              availability === 'Open' 
                ? 'bg-green-100 text-green-800'
                : availability === 'Limited'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {availability === 'Open' && '🟢 Available for commissions'}
              {availability === 'Limited' && '🟡 Limited availability'}
              {availability === 'Closed' && '🔴 Not taking commissions'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
