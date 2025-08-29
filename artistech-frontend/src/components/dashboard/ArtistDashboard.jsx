import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'sonner';
import { 
  Upload, 
  Eye, 
  Heart, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Package,
  ShoppingBag,
  Briefcase,
  FileText,
  Settings,
  BarChart3,
  Palette,
  FolderOpen,
  History
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Layout Components
import DashboardLayout from './DashboardLayout';
import StatsCard from './StatsCard';
import QuickActions from './QuickActions';

// Feature Components
import MyArtworks from './MyArtworks';
import MyListings from './MyListings';
import CommissionRequests from './CommissionRequests';

import SalesHistory from './SalesHistory';
import ArtistEarnings from './ArtistEarnings';
import AIDetectionReportModal from './AIDetectionReportModal';
import CommissionHistory from './CommissionHistory';
import MyProjects from './MyProjects';

const PerformanceChart = ({ stats }) => {
  const data = [
    { name: 'Views', value: stats.newViewsThisMonth || 0, color: '#8B5CF6' },
    { name: 'Likes', value: stats.newLikesThisMonth || 0, color: '#EC4899' },
    { name: 'Followers', value: stats.newFollowersThisMonth || 0, color: '#10B981' },
  ];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="name" className="text-sm" />
          <YAxis className="text-sm" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const ArtistDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState({ 
    stats: {}, 
    artworks: [], 
    commissionRequests: [], 
    commissionListings: [], 
    proposals: [] 
  });
  const [projects, setProjects] = useState([]);
  const [availability, setAvailability] = useState(user?.availability || 'Open');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [viewReportData, setViewReportData] = useState(null);
  const [currentSection, setCurrentSection] = useState('overview');

  // Handle URL parameters for navigation
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'artworks', 'listings', 'requests', 'projects', 'commissions', 'sales', 'earnings'].includes(tab)) {
      setCurrentSection(tab);
    }
  }, [location.search]);

  const handleViewReport = (artwork) => {
    setSelectedArtwork(artwork);
    setViewReportData(artwork);
  };

  const handleDeleteArtwork = async (artworkId) => {
    if (!window.confirm('Are you sure you want to delete this artwork?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/artworks/${artworkId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Artwork deleted successfully');
        setDashboardData(prev => ({
          ...prev,
          artworks: prev.artworks.filter(artwork => artwork.id !== artworkId)
        }));
      } else {
        throw new Error('Failed to delete artwork');
      }
    } catch (error) {
      toast.error('Failed to delete artwork');
    }
  };

  const handleAvailabilityChange = async (newAvailability) => {
    try {
      const response = await fetch('/api/user/availability', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ availability: newAvailability }),
      });

      if (response.ok) {
        setAvailability(newAvailability);
        toast.success(`Availability updated to ${newAvailability}`);
      } else {
        throw new Error('Failed to update availability');
      }
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    try {
      const [statsResponse, artworksResponse, projectsResponse, commissionsResponse, listingsResponse] = await Promise.all([
        fetch('/api/artists/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/artworks/user-artworks', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/projects/artist', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/commissions/my-commissions', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/commission-listings/my-listings', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const responses = await Promise.all([
        statsResponse.ok ? statsResponse.json() : null,
        artworksResponse.ok ? artworksResponse.json() : null,
        projectsResponse.ok ? projectsResponse.json() : null,
        commissionsResponse.ok ? commissionsResponse.json() : null,
        listingsResponse.ok ? listingsResponse.json() : null
      ]);

      const [stats, artworksData, projects, commissionRequests, commissionListings] = responses;

      // Extract artworks array from the response object
      const artworks = artworksData?.artworks || [];

      setDashboardData(prevData => ({ 
        ...prevData, 
        stats: stats || prevData.stats, 
        artworks,
        commissionRequests: commissionRequests || [],
        commissionListings: commissionListings || []
      }));
      setProjects(projects || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  }, [token]);

  useEffect(() => {
        fetchDashboardData();
  }, [fetchDashboardData]);

  const sidebarItems = [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Dashboard summary',
      icon: BarChart3,
    },
    {
      id: 'artworks',
      label: 'My Artworks',
      description: 'Manage portfolio',
      icon: Palette,
      badge: dashboardData.artworks.length
    },
    {
      id: 'listings',
      label: 'Commission Listings',
      description: 'Service offerings',
      icon: FileText,
    },
    {
      id: 'requests',
      label: 'Commission Requests',
      description: 'New inquiries',
      icon: Briefcase,
      badge: dashboardData.commissionRequests.filter(r => r.status === 'awaiting_proposal').length
    },
    {
      id: 'projects',
      label: 'My Projects',
      description: 'Active commissions',
      icon: FolderOpen,
      badge: projects.filter(p => ['active', 'in_progress'].includes(p.status)).length
    },
    {
      id: 'commissions',
      label: 'My Commissions',
      description: 'Commission history',
      icon: History,
      badge: projects.length
    },
    {
      id: 'sales',
      label: 'Sales History',
      description: 'Completed sales',
      icon: ShoppingBag,
    },
    {
      id: 'earnings',
      label: 'Earnings',
      description: 'Revenue tracking',
      icon: DollarSign,
    },
  ];

  if (!user) {
    return <div>Loading...</div>;
  }

  const renderContent = () => {
    switch (currentSection) {
      case 'overview':
  return (
          <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
              <p className="text-purple-100">Manage your artistic portfolio and grow your business.</p>
          </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Artworks"
                value={dashboardData.stats.totalArtworks || 0}
                icon={Palette}
                color="purple"
                subtitle="In your portfolio"
              />
              <StatsCard
                title="Total Views"
                value={dashboardData.stats.totalViews || 0}
                icon={Eye}
                color="blue"
                trend="up"
                trendValue="+12%"
              />
              <StatsCard
                title="Total Likes"
                value={dashboardData.stats.totalLikes || 0}
                icon={Heart}
                color="red"
                trend="up"
                trendValue="+8%"
              />
              <StatsCard
                title="Followers"
                value={dashboardData.stats.totalFollowers || 0}
                icon={Users}
                color="green"
                trend="up"
                trendValue="+5%"
              />
          </div>

            {/* Quick Actions and Performance Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <QuickActions 
                  userType="artist" 
                  user={user}
                  availability={availability}
                  onAvailabilityChange={handleAvailabilityChange}
                />
          </div>

              <div className="lg:col-span-2">
          <Card>
            <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                      Performance This Month
                    </CardTitle>
            </CardHeader>
            <CardContent>
                    <PerformanceChart stats={dashboardData.stats} />
            </CardContent>
          </Card>
        </div>
      </div>

            {/* Recent Activity Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Commissions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Commission Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData.commissionRequests.slice(0, 3).length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.commissionRequests.slice(0, 3).map(request => (
                        <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{request.title}</p>
                            <p className="text-sm text-gray-600">From: {request.client_name}</p>
              </div>
                          <Badge variant="outline">New</Badge>
                        </div>
                      ))}
                      </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No recent commission requests</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Projects */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {projects.slice(0, 3).length > 0 ? (
                    <div className="space-y-3">
                      {projects.slice(0, 3).map(project => (
                        <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{project.commission_title}</p>
                            <p className="text-sm text-gray-600">Client: {project.client_name}</p>
                          </div>
                          <Badge variant={project.status === 'active' ? 'default' : 'outline'}>
                            {project.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No active projects</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'artworks':
        return (
          <MyArtworks 
            artworks={dashboardData.artworks}
            onDelete={handleDeleteArtwork}
            onViewReport={handleViewReport}
            token={token}
          />
        );

      case 'listings':
        return <MyListings token={token} />;

      case 'requests':
        return <CommissionRequests />;

      case 'projects':
        return <MyProjects projects={projects} userType="artist" />;

      case 'commissions':
        return <CommissionHistory projects={projects} />;

      case 'sales':
        return <SalesHistory />;

      case 'earnings':
        return <ArtistEarnings />;

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
      userType="artist"
      user={user}
    >
      {renderContent()}

      {/* Modals */}
      {viewReportData && (
        <AIDetectionReportModal
          artwork={viewReportData}
          onClose={() => setViewReportData(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default ArtistDashboard;