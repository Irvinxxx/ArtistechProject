import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Star, 
  MessageSquare, 
  UserPlus, 
  MapPin, 
  Calendar,
  Users,
  Award,
  Palette,
  Eye,
  Heart,
  CheckCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '../lib/utils';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ArtworkImage from '@/components/ui/artwork-image';

// Helper function to get proficiency level percentage
const getProficiencyLevel = (proficiency) => {
    switch (proficiency?.toLowerCase()) {
        case 'beginner': return 25;
        case 'intermediate': return 50;
        case 'advanced': return 75;
        case 'expert': return 100;
        default: return 50;
    }
};

// Skills Modal Component
const SkillsModal = ({ isOpen, onClose, artist }) => {
    if (!artist) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-xl">
                        <Palette className="mr-2 h-5 w-5 text-purple-600" />
                        {artist.name}'s Skills & Expertise
                    </DialogTitle>
                    <DialogDescription>
                        Professional skills and software tools mastered by this artist
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {/* Creative Skills Section */}
                    <SkillsSection 
                        title="🎨 Creative Skills" 
                        skills={artist.skills ? artist.skills.filter(s => s.type === 'skill') : []}
                        variant="creative"
                    />
                    
                    {/* Software & Tools Section */}
                    <SkillsSection 
                        title="🛠️ Software & Tools" 
                        skills={artist.skills ? artist.skills.filter(s => s.type === 'software') : []}
                        variant="software"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Skills Section Component
const SkillsSection = ({ title, skills, variant }) => {
    return (
        <Card className="h-fit">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {skills && skills.length > 0 ? (
                    <div className="space-y-3">
                        {skills.map(skill => (
                            <SkillItem key={skill.id} skill={skill} variant={variant} />
                        ))}
                    </div>
                ) : (
                    <EmptySkillsState variant={variant} />
                )}
            </CardContent>
        </Card>
    );
};

// Individual Skill Item Component
const SkillItem = ({ skill, variant }) => {
    const proficiencyLevel = getProficiencyLevel(skill.proficiency);
    
    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex-1">
                <span className="font-medium text-gray-900">{skill.name}</span>
                {skill.proficiency && (
                    <div className="flex items-center mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3 max-w-[120px]">
                            <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    variant === 'creative' ? 'bg-purple-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${proficiencyLevel}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-500 min-w-fit">
                            {skill.proficiency}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

// Empty State Component
const EmptySkillsState = ({ variant }) => {
    const icon = variant === 'creative' ? CheckCircle : Award;
    const IconComponent = icon;
    
    return (
        <div className="text-center py-8">
            <IconComponent className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
                {variant === 'creative' ? 'No creative skills listed yet.' : 'No software tools listed yet.'}
            </p>
        </div>
    );
};

const ArtistProfilePage = () => {
    const { id } = useParams();
    const { user, token } = useContext(AuthContext);
    const [artist, setArtist] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [followStatus, setFollowStatus] = useState({ isFollowing: false, followersCount: 0 });
    const [showSkillsModal, setShowSkillsModal] = useState(false);

    useEffect(() => {
        const fetchArtistData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/artists/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setArtist(data);
                    // Initialize follower count from artist data
                    setFollowStatus(prev => ({ 
                        ...prev, 
                        followersCount: data.followersCount || 0 
                    }));
                } else {
                    toast.error("Artist not found.");
                }
            } catch (error) {
                toast.error("Failed to fetch artist data.");
            } finally {
                setIsLoading(false);
            }
        };

        const fetchFollowStatus = async () => {
             if (!token) return;
             try {
                const response = await fetch(`/api/artists/${id}/follow-status`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setFollowStatus(prev => ({ 
                        ...prev, 
                        isFollowing: data.isFollowing,
                        // Update follower count if provided
                        followersCount: data.followersCount !== undefined ? data.followersCount : prev.followersCount
                    }));
                }
             } catch (error) {
                 console.error("Failed to fetch follow status", error);
             }
        };

        fetchArtistData();
        fetchFollowStatus();
    }, [id, token]);

    const handleFollowToggle = async () => {
        if (!token) {
            toast.error("Please log in to follow artists.");
            return;
        }
        const method = followStatus.isFollowing ? 'DELETE' : 'POST';
        try {
            const response = await fetch(`/api/artists/${id}/follow`, {
                method,
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                // Toggle follow state and update count
                setFollowStatus(prev => ({
                    isFollowing: !prev.isFollowing,
                    followersCount: prev.followersCount + (!prev.isFollowing ? 1 : -1)
                }));
                
                // Refresh follow status to get accurate count from server
                setTimeout(async () => {
                    try {
                        const statusResponse = await fetch(`/api/artists/${id}/follow-status`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (statusResponse.ok) {
                            const statusData = await statusResponse.json();
                            setFollowStatus(prev => ({ 
                                ...prev, 
                                followersCount: statusData.followersCount 
                            }));
                        }
                    } catch (error) {
                        console.error("Failed to refresh follow status", error);
                    }
                }, 100);
            } else {
                toast.error("Action failed. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        }
    };

    if (isLoading) return <p>Loading artist profile...</p>;
    if (!artist) return <p>Artist not found.</p>;

    const isClientViewer = user && user.user_type === 'client' && user.id !== artist.id;
    const isCommissionable = artist.availability === 'Open' || artist.availability === 'Limited';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-start gap-8">
                        {/* Profile Image */}
                        <div className="relative flex-shrink-0">
                            <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-gray-100">
                                <ArtworkImage 
                                    src={artist.profile_image} 
                                    alt={artist.name} 
                                    className="w-full h-full object-cover"
                                    fallbackText="Artist"
                                    showWatermark={false}
                                    protectionLevel="medium"
                                />
                            </div>
                            {/* Availability Status */}
                            <div className="absolute -bottom-1 -right-1">
                                <Badge 
                                    className={`${
                                        artist.availability === 'Open' 
                                            ? 'bg-green-500 hover:bg-green-600' 
                                            : artist.availability === 'Limited'
                                            ? 'bg-yellow-500 hover:bg-yellow-600'
                                            : 'bg-red-500 hover:bg-red-600'
                                    } text-white shadow-sm border-2 border-white`}
                                >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {artist.availability}
                                </Badge>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{artist.name}</h1>
                            
                            <div className="flex flex-wrap items-center gap-4 mb-4 text-gray-600">
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    <span>{artist.location}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span>Member since {new Date(artist.created_at).getFullYear()}</span>
                                </div>
                            </div>
                            
                            {/* Stats Row */}
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                                    <Star className="w-4 h-4 text-yellow-500 mr-2" />
                                    <span className="font-semibold text-gray-900">{artist.averageRating}</span>
                                    <span className="text-gray-600 ml-1">({artist.reviews.length})</span>
                                </div>
                                <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                                    <Users className="w-4 h-4 text-gray-600 mr-2" />
                                    <span className="font-semibold text-gray-900">{followStatus.followersCount || 0}</span>
                                    <span className="text-gray-600 ml-1">followers</span>
                                </div>
                                <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                                    <Palette className="w-4 h-4 text-gray-600 mr-2" />
                                    <span className="font-semibold text-gray-900">{artist.portfolio.length}</span>
                                    <span className="text-gray-600 ml-1">artworks</span>
                                </div>
                            </div>

                            <p className="text-gray-700 max-w-3xl leading-relaxed">{artist.bio}</p>
                    </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 min-w-[180px] flex-shrink-0">
                            {isClientViewer && (
                                <>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="w-full">
                                                    <Button 
                                                        asChild 
                                                        disabled={!isCommissionable} 
                                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                                    >
                                                        <Link to={`/commissions/request?artistId=${artist.id}`}>
                                                            <Award className="mr-2 h-4 w-4" />
                                                            Request Commission
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TooltipTrigger>
                                            {!isCommissionable && (
                                                <TooltipContent>
                                                    <p>This artist is not currently available for new commissions.</p>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>

                                    <Button 
                                        onClick={handleFollowToggle}
                                        variant="outline"
                                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        {followStatus.isFollowing ? 'Unfollow' : 'Follow'}
                            </Button>

                                    <Button 
                                        variant="outline" 
                                        asChild
                                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        <Link to={`/messages/${artist.id}`}>
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            Message
                                        </Link>
                            </Button>
                                </>
                            )}

                            {/* Skills button available to all users */}
                            <Button 
                                onClick={() => setShowSkillsModal(true)}
                                variant="outline"
                                className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                                aria-label={`View ${artist.name}'s skills and software tools`}
                            >
                                <Palette className="mr-2 h-4 w-4" aria-hidden="true" />
                                Skills & Tools
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                                    {/* Navigation Tabs */}
            <Tabs defaultValue="portfolio" className="w-full">
                <div className="mb-8">
                    <div className="flex space-x-8 border-b border-gray-200">
                        <TabsList className="bg-transparent h-auto p-0 space-x-8">
                            <TabsTrigger 
                                value="portfolio" 
                                className="
                                    bg-transparent border-0 rounded-none px-0 py-4 text-gray-500 font-medium transition-all duration-300 ease-in-out
                                    hover:text-gray-900 hover:bg-transparent focus:outline-none focus:ring-0
                                    data-[state=active]:text-purple-600 data-[state=active]:bg-transparent 
                                    data-[state=active]:border-b-2 data-[state=active]:border-purple-600
                                    data-[state=active]:shadow-none relative
                                "
                            >
                                <Palette className="w-4 h-4 mr-2" />
                                Portfolio
                            </TabsTrigger>
                            <TabsTrigger 
                                value="commissions"
                                className="
                                    bg-transparent border-0 rounded-none px-0 py-4 text-gray-500 font-medium transition-all duration-300 ease-in-out
                                    hover:text-gray-900 hover:bg-transparent focus:outline-none focus:ring-0
                                    data-[state=active]:text-purple-600 data-[state=active]:bg-transparent 
                                    data-[state=active]:border-b-2 data-[state=active]:border-purple-600
                                    data-[state=active]:shadow-none relative
                                "
                            >
                                <Award className="w-4 h-4 mr-2" />
                                Commissions
                            </TabsTrigger>
                            <TabsTrigger 
                                value="reviews"
                                className="
                                    bg-transparent border-0 rounded-none px-0 py-4 text-gray-500 font-medium transition-all duration-300 ease-in-out
                                    hover:text-gray-900 hover:bg-transparent focus:outline-none focus:ring-0
                                    data-[state=active]:text-purple-600 data-[state=active]:bg-transparent 
                                    data-[state=active]:border-b-2 data-[state=active]:border-purple-600
                                    data-[state=active]:shadow-none relative
                                "
                            >
                                <Star className="w-4 h-4 mr-2" />
                                Reviews
                            </TabsTrigger>

                </TabsList>
                    </div>
                </div>

                                <TabsContent value="portfolio" className="mt-0">
                    {artist.portfolio && artist.portfolio.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {artist.portfolio.map(item => (
                                <Link to={`/artworks/${item.id}`} key={item.id} className="group">
                                    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
                                        <div className="relative overflow-hidden">
                                            <ArtworkImage
                                                src={item.thumbnail_image} 
                                                alt={item.title} 
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                            <div className="absolute top-3 left-3">
                                                <Badge variant="secondary" className="bg-white/90 text-gray-700 text-xs">
                                                    {item.artwork_type}
                                                </Badge>
                                            </div>
                                            {item.price > 0 && (
                                                <div className="absolute top-3 right-3">
                                                    <Badge className="bg-purple-600 text-white text-xs">
                                                        {formatCurrency(item.price)}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-medium text-gray-900 truncate mb-1">{item.title}</h3>
                                            <p className="text-sm text-gray-600 capitalize">{item.artwork_type}</p>
                                        </div>
                                    </div>
                            </Link>
                        ))}
                    </div>
                    ) : (
                        <div className="text-center py-16">
                            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Items</h3>
                            <p className="text-gray-600">This artist hasn't added any portfolio pieces yet.</p>
                        </div>
                    )}
                </TabsContent>

                                                <TabsContent value="commissions" className="mt-0">
                        {artist.commissionListings && artist.commissionListings.length > 0 ? (
                        <div className="grid gap-6 lg:grid-cols-2">
                            {artist.commissionListings.map(listing => (
                                <div key={listing.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{listing.title}</h3>
                                        <p className="text-gray-700 mb-6 leading-relaxed">{listing.description}</p>
                                        
                                        {/* Pricing Tiers */}
                                        <div className="space-y-3">
                                            <h4 className="font-medium text-gray-900 flex items-center mb-4">
                                                <Award className="w-4 h-4 mr-2 text-purple-600" />
                                                Service Packages
                                            </h4>
                                            {JSON.parse(listing.pricing_details).map((tier, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-purple-200 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <h5 className="font-medium text-gray-900">{tier.title}</h5>
                                                            <p className="text-sm text-gray-600 mt-1">{tier.description}</p>
                                                        </div>
                                                        <div className="ml-4 text-right">
                                                            <span className="text-xl font-bold text-purple-600">{formatCurrency(tier.price)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {isClientViewer && (
                                            <div className="mt-6 pt-6 border-t border-gray-200">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="w-full">
                                                                <Button 
                                                                    asChild 
                                                                    disabled={!isCommissionable} 
                                                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                                                >
                                                    <Link to={`/commissions/request?artistId=${artist.id}&listingId=${listing.id}`}>
                                                                        <Award className="mr-2 h-4 w-4" />
                                                        Request this Commission
                                                    </Link>
                                                </Button>
                                                            </div>
                                                        </TooltipTrigger>
                                                        {!isCommissionable && (
                                                            <TooltipContent>
                                                                <p>This artist is not currently available for new commissions.</p>
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                        )}
                    </div>
                                </div>
                        ))}
                    </div>
                    ) : (
                        <div className="text-center py-16">
                            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Commission Listings</h3>
                            <p className="text-gray-600">This artist hasn't created any specific commission offerings yet.</p>
                        </div>
                    )}
                </TabsContent>

                                <TabsContent value="reviews" className="mt-0">
                    {artist.reviews && artist.reviews.length > 0 ? (
                        <div className="space-y-6">
                            {/* Reviews Summary */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-gray-900 mb-2">{artist.averageRating}</div>
                                    <div className="flex items-center justify-center mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                className={`w-5 h-5 ${i < Math.floor(artist.averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                            />
                                        ))}
                                    </div>
                                    <p className="text-gray-600">Based on {artist.reviews.length} reviews</p>
                                </div>
                            </div>

                            {/* Individual Reviews */}
                            <div className="space-y-4">
                                {artist.reviews.map(review => (
                                    <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                                {review.reviewer_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900">{review.reviewer_name}</h4>
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center mb-3">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                                        />
                                                    ))}
                                                    <span className="ml-2 text-sm font-medium text-gray-700">{review.rating}/5</span>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
                                            </div>
                                        </div>
                                    </div>
                        ))}
                                </div>
                            </div>
                    ) : (
                        <div className="text-center py-16">
                            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                            <p className="text-gray-600">This artist hasn't received any reviews yet.</p>
                        </div>
                    )}
                </TabsContent>


            </Tabs>
            </div>

            {/* Skills Modal */}
            <SkillsModal 
                isOpen={showSkillsModal}
                onClose={() => setShowSkillsModal(false)}
                artist={artist}
            />
        </div>
    );
};

export default ArtistProfilePage; 