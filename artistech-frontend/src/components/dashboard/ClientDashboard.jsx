import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ShoppingBag, 
  Gavel, 
  Download, 
  Package, 
  Monitor, 
  Palette,
  Heart,
  BarChart3,
  DollarSign,
  User,
  Eye,
  RefreshCw
} from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import ReviewModal from './ReviewModal';
import { toast } from 'sonner';
import ArtworkImage from '../ui/artwork-image';

// Layout Components
import DashboardLayout from './DashboardLayout';
import StatsCard from './StatsCard';
import QuickActions from './QuickActions';

const PurchaseHistory = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` }});
        if(response.ok) {
            const data = await response.json();
            setOrders(data);
        }
      } catch (error) {
          console.error("Failed to fetch purchase history:", error);
      }
      setLoading(false);
    };
    if (token) fetchOrders();
  }, [token]);
  
  const getTrackingUrl = (carrier, trackingNumber) => {
    if (carrier?.toLowerCase().includes('lbc')) {
      return `https://www.lbcexpress.com/track/?tracking_no=${trackingNumber}`;
    }
    return '#'; // Fallback
  };

  const handleDownload = async (artworkId, artworkTitle) => {
    try {
      const response = await fetch(`/api/artworks/${artworkId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "An unknown error occurred." }));
        toast.error(errorData.error || "Download failed.");
        throw new Error(errorData.error);
      }
      
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.downloadUrl) {
          window.open(data.downloadUrl, '_blank', 'noopener,noreferrer');
        } else {
          toast.error("Received an invalid download link from the server.");
        }
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const filename = artworkTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.download = `${filename}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
      
    } catch (error) {
      console.error("Download error:", error.message);
    }
  };

  if (loading) return <p>Loading purchase history...</p>;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
          <CardDescription>All your completed orders and their statuses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4">You have not made any purchases yet.</p>
            </div>
          ) : (
            orders.map(order => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 px-4 gap-2">
                  <div>
                    <h3 className="font-semibold">Order #{order.id}</h3>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.order_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <Badge>{order.status}</Badge>
                    <p className="text-sm text-gray-600 font-medium mt-1">Total: ₱{parseFloat(order.total_amount).toLocaleString()}</p>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {order.items.map(item => (
                      <div key={item.order_item_id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center">
                          <ArtworkImage 
                            src={item.thumbnail_image} 
                            alt={item.title} 
                            className="w-16 h-16 rounded-md mr-4"
                            showWatermark={false}
                          />
                          <div>
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm text-gray-500">
                              by <Link to={`/artists/${item.artist_id}`} className="hover:underline text-purple-600">{item.artist_name}</Link>
                            </p>
                            <p className="text-sm">₱{parseFloat(item.price).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 self-end sm:self-center">
                           {(order.status === 'completed' || order.status === 'shipped') && (
                            item.reviewed ? (
                                <Button size="sm" variant="outline" disabled>Review Submitted</Button>
                            ) : (
                                <Button size="sm" variant="outline" onClick={() => setSelectedOrderItem({ item: item, order: order })}>
                                    Leave a Review
                                </Button>
                            )
                          )}
                          {item.artwork_type === 'digital' && order.status === 'completed' && (
                              <Button size="sm" onClick={() => handleDownload(item.artwork_id, item.title)}>
                                  <Download className="mr-2 h-4 w-4"/> Download
                              </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                   {order.status === 'shipped' && order.tracking_number && (
                    <div className="p-4 bg-blue-50 text-blue-800 text-sm">
                      <p>
                        <strong>Tracking:</strong>{' '}
                        <a 
                          href={getTrackingUrl(order.shipping_carrier, order.tracking_number)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline font-medium"
                        >
                          {order.tracking_number}
                        </a>
                        {' '}via {order.shipping_carrier}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
      {selectedOrderItem && (
        <ReviewModal
          item={selectedOrderItem.item}
          orderId={selectedOrderItem.order.id}
          onClose={() => setSelectedOrderItem(null)}
          onReviewSubmit={() => {
            setSelectedOrderItem(null);
            // Optionally, refresh orders or update the specific item's review status
          }}
        />
      )}
    </>
  );
};

const BiddingHistory = () => {
  const { token } = useContext(AuthContext);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/user/bids', { headers: { 'Authorization': `Bearer ${token}` } });
        if (response.ok) {
          const data = await response.json();
          setBids(data);
        }
      } catch (error) {
        console.error("Failed to fetch bidding history:", error);
      }
      setLoading(false);
    };
    if (token) fetchBids();
  }, [token]);

  if (loading) return <p>Loading bidding history...</p>;

  return (
  <Card>
    <CardHeader>
      <CardTitle>Bidding History</CardTitle>
        <CardDescription>All auctions you have participated in.</CardDescription>
    </CardHeader>
      <CardContent className="space-y-4">
        {bids.length === 0 ? (
          <p>You have not placed any bids yet.</p>
        ) : (
          bids.map((bid, index) => (
            <div key={index} className="border p-4 rounded-md flex items-center justify-between">
              <div>
                <p className="font-semibold">{bid.artwork_title}</p>
                <p className="text-sm text-gray-500">You bid ₱{bid.amount} on {new Date(bid.created_at).toLocaleDateString()}</p>
              </div>
              <Badge>{bid.auction_status}</Badge>
            </div>
          ))
        )}
    </CardContent>
  </Card>
);
};

const ProjectsSection = () => {
    const { token } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        const fetchProjects = async () => {
            try {
                const response = await fetch('/api/projects/client', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setProjects(data);
                }
            } catch (error) {
                console.error("Failed to fetch projects:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [token]);

    const handleRetryPayment = (projectId) => {
        // Navigate to commission checkout page for retry
        window.location.href = `/commissions/checkout?projectId=${projectId}`;
    };

    if (loading) return <p>Loading projects...</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Projects</CardTitle>
                <CardDescription>Track your active projects and payment status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {projects.length === 0 ? (
                    <p className="text-gray-500">You have no projects yet.</p>
                ) : (
                    projects.map(project => (
                        <div key={project.id} className="border p-4 rounded-md">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="font-semibold">{project.commission_title}</p>
                                    <p className="text-sm text-gray-500">Artist: {project.artist_name}</p>
                                    <p className="text-sm text-gray-600">₱{parseFloat(project.final_price).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <Badge className={
                                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                                        project.status === 'awaiting_payment' ? 'bg-orange-100 text-orange-800' :
                                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }>
                                        {project.status === 'awaiting_payment' ? 'PAYMENT REQUIRED' : project.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    {project.status === 'awaiting_payment' && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <Button 
                                                onClick={() => handleRetryPayment(project.id)}
                                                size="sm" 
                                                className="w-full bg-orange-600 hover:bg-orange-700"
                                            >
                                                Complete Payment
                                            </Button>
                                            <Button 
                                                onClick={async () => {
                                                    toast.info("Checking status...");
                                                    const res = await fetch(`/api/checkout/verify-commission-payment/${project.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                                                    if (res.ok) {
                                                        const data = await res.json();
                                                        if (data.status === 'active' || data.status === 'in_progress') {
                                                            toast.success("Payment confirmed!");
                                                            setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: data.status } : p));
                                                        } else {
                                                            toast.error("Payment is still pending.");
                                                        }
                                                    }
                                                }}
                                                size="sm" variant="outline" className="px-2">
                                                <RefreshCw className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                    {project.status === 'active' && (
                                        <Button asChild size="sm" className="mt-2 w-full" variant="outline">
                                            <Link to={`/project/${project.id}`}>View Project</Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};

const CommissionHistory = () => {
    const { token } = useContext(AuthContext);
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        const fetchCommissions = async () => {
            try {
                const response = await fetch('/api/commissions/my-commissions', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setCommissions(data);
                }
            } catch (error) {
                console.error("Failed to fetch commission history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCommissions();
    }, [token]);

    if (loading) return <p>Loading commissions...</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Commissions</CardTitle>
                <CardDescription>Track the status of all your commission requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {commissions.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">You have not requested any commissions yet.</p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <Button asChild variant="outline" size="sm">
                                <Link to="/commissions/post-public">Post Public Commission</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link to="/artists/search">Find Specific Artist</Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Commission Summary */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                            <div className="text-center">
                                <p className="text-lg font-semibold text-purple-600">
                                    {commissions.filter(c => !c.artist_name).length}
                                </p>
                                <p className="text-xs text-gray-600">Public Commissions</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-blue-600">
                                    {commissions.filter(c => c.artist_name).length}
                                </p>
                                <p className="text-xs text-gray-600">Direct Commissions</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-green-600">
                                    {commissions.filter(c => c.status === 'open').length}
                                </p>
                                <p className="text-xs text-gray-600">Open for Proposals</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-orange-600">
                                    {commissions.reduce((total, c) => total + (c.proposal_count || 0), 0)}
                                </p>
                                <p className="text-xs text-gray-600">Total Proposals</p>
                            </div>
                        </div>
                        
                        {/* Commission List */}
                        {commissions.map(commission => (
                        <div key={commission.id} className="border p-4 rounded-md">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="font-semibold">{commission.title}</p>
                                    <p className="text-sm text-gray-500">
                                        {commission.artist_name 
                                            ? `Direct to: ${commission.artist_name}` 
                                            : 'Public commission (open to all artists)'
                                        }
                                    </p>
                                    {commission.status === 'open' && (
                                        <p className="text-xs text-purple-600 mt-1">
                                            {commission.proposal_count || 0} proposal{(commission.proposal_count || 0) !== 1 ? 's' : ''} received
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <Badge className={
                                        commission.status === 'open' && commission.proposal_count > 0 ? 'bg-purple-100 text-purple-800' :
                                        commission.status === 'open' ? 'bg-green-100 text-green-800' : ''
                                    }>
                                        {commission.status === 'open' && commission.proposal_count > 0 ? 'PROPOSALS RECEIVED' : commission.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    {(commission.status === 'open' || (commission.status === 'awaiting_proposal' && commission.proposal_count > 0)) && (
                                        <Button asChild size="sm" className="mt-2 w-full">
                                            <Link to={`/commissions/${commission.id}/proposals`}>
                                                {commission.proposal_count > 0 ? `Review ${commission.proposal_count} Proposal(s)` : 'View Details'}
                                            </Link>
                                        </Button>
                                    )}
                                    {commission.status === 'awaiting_proposal' && commission.proposal_count === 0 && (
                                        <p className="text-xs text-gray-500 mt-2">Waiting for artist response</p>
                                    )}
                                    {commission.project_id && commission.project_status === 'awaiting_payment' && (
                                        <Button 
                                            onClick={() => window.location.href = `/commissions/checkout?projectId=${commission.project_id}`}
                                            size="sm" 
                                            className="mt-2 w-full bg-orange-600 hover:bg-orange-700"
                                        >
                                            Complete Payment
                                        </Button>
                                    )}
                                    {commission.project_id && commission.project_status && commission.project_status !== 'awaiting_payment' && (
                                        <div className="mt-2">
                                            <Badge variant="outline" className="text-xs">
                                                Project: {commission.project_status.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        ))}
                    </>
                )}
            </CardContent>
        </Card>
    );
};


const ClientDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [currentSection, setCurrentSection] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    activeCommissions: 0,
    completedPurchases: 0
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('/api/user/client/dashboard-stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const stats = await response.json();
          setDashboardStats(stats);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchDashboardStats();
  }, [token]);

  const sidebarItems = [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Dashboard summary',
      icon: BarChart3,
    },
    {
      id: 'purchases',
      label: 'Purchase History',
      description: 'Your orders',
      icon: ShoppingBag,
    },
    {
      id: 'bidding',
      label: 'Bidding History',
      description: 'Auction activity',
      icon: Gavel,
    },
    {
      id: 'commissions',
      label: 'My Commissions',
      description: 'Custom requests',
      icon: Palette,
    },
    {
      id: 'projects',
      label: 'Active Projects',
      description: 'Ongoing work',
      icon: Monitor,
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
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
              <p className="text-blue-100">Discover amazing artworks and connect with talented artists.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Orders"
                value={dashboardStats.totalOrders || 0}
                icon={ShoppingBag}
                color="blue"
                subtitle="Completed purchases"
              />
              <StatsCard
                title="Total Spent"
                value={`₱${(dashboardStats.totalSpent || 0).toLocaleString()}`}
                icon={DollarSign}
                color="green"
                subtitle="Lifetime spending"
              />
              <StatsCard
                title="Active Commissions"
                value={dashboardStats.activeCommissions || 0}
                icon={Palette}
                color="purple"
                subtitle="In progress"
              />
              <StatsCard
                title="Saved Artworks"
                value={dashboardStats.wishlistCount || 0}
                icon={Heart}
                color="red"
                subtitle="In wishlist"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <QuickActions 
                userType="client" 
                user={user}
              />
              
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Order completed</p>
                        <p className="text-xs text-gray-500">Digital artwork delivered</p>
                      </div>
                      <span className="text-xs text-gray-400">2h ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New proposal received</p>
                        <p className="text-xs text-gray-500">For portrait commission</p>
                      </div>
                      <span className="text-xs text-gray-400">1d ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Bid placed</p>
                        <p className="text-xs text-gray-500">Abstract painting auction</p>
                      </div>
                      <span className="text-xs text-gray-400">3d ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>Based on your purchase history and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Browse trending artworks</p>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <Link to="/artworks">Explore</Link>
                    </Button>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Discover new artists</p>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <Link to="/artists/search">Find Artists</Link>
                    </Button>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <Gavel className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Join live auctions</p>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <Link to="/auctions">View Auctions</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'purchases':
        return <PurchaseHistory />;

      case 'bidding':
        return <BiddingHistory />;

      case 'commissions':
        return <CommissionHistory />;

      case 'projects':
        return <ProjectsSection />;

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
      userType="client"
      user={user}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default ClientDashboard; 