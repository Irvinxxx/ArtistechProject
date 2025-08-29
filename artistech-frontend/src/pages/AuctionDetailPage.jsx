import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gavel, Clock, User, Tag, Heart, Loader, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';
import { formatCurrency } from '../lib/utils';
import ArtworkImage from '../components/ui/artwork-image'; // Import ArtworkImage

const AuctionDetailPage = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isWatching, setIsWatching] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(true);
  const [showBidAgreement, setShowBidAgreement] = useState(false);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [bidAmount, setBidAmount] = useState('');

  useEffect(() => {
    // Check if user has already agreed to bidding terms
    const hasAgreed = localStorage.getItem('hasAgreedToBidding');
    if (!hasAgreed) {
      setShowBidAgreement(true);
    }
  }, []);

    const fetchAuction = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/auctions/${id}`);
        if (!response.ok) throw new Error('Failed to fetch auction details.');
        const data = await response.json();
        setAuction(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchAuction();
  }, [id]);

  useEffect(() => {
    if (!auction) return;
    const interval = setInterval(() => {
      const remaining = new Date(auction.end_time) - new Date();
      if (remaining <= 0) {
        setTimeLeft('Auction ended');
        clearInterval(interval);
      } else {
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((remaining / 1000 / 60) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [auction]);

  // Fetch watchlist status
  useEffect(() => {
    if (!token || !id) return;
    const checkWatchlist = async () => {
      setIsWatchlistLoading(true);
      try {
        // This endpoint will need to be created
        const response = await fetch(`http://localhost:3000/api/auctions/${id}/watchlist-status`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setIsWatching(data.isWatching);
        }
      } catch (err) {
        // Do nothing, button will just be in default state
      } finally {
        setIsWatchlistLoading(false);
      }
    };
    checkWatchlist();
  }, [id, token]);


  if (loading) return <div className="text-center py-10"><Loader className="animate-spin" /></div>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!auction) return <p className="text-center">Auction not found.</p>;

  const handlePlaceBid = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/auctions/${id}` } });
      return;
    }
    
    if (!bidAmount || parseFloat(bidAmount) <= auction.current_bid) {
      toast.error('Your bid must be higher than the current bid.');
      return;
    }

    setIsPlacingBid(true);
    try {
      const response = await fetch(`http://localhost:3000/api/auctions/${id}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: bidAmount })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place bid.');
      }
      toast.success('Bid placed successfully!');
      setBidAmount(''); // Clear input field on success
      fetchAuction(); // Re-fetch data to show the new bid
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handleAgreementDismiss = () => {
    localStorage.setItem('hasAgreedToBidding', 'true');
    setShowBidAgreement(false);
  };

  const handleToggleWatchlist = async () => {
    if (!token) {
      toast.error('You must be logged in to watch an auction.');
      return;
    }
    setIsWatchlistLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/auctions/${id}/watch`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update watchlist');
      
      setIsWatching(data.watching);
      toast.success(data.message);
      // Optimistically update the watchers count on the auction object
      setAuction(prev => ({...prev, watchers: prev.watchers + (data.watching ? 1 : -1)}));

    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsWatchlistLoading(false);
    }
  };


  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <ArtworkImage 
              src={auction.original_image} 
              alt={auction.title} 
              className="w-full rounded-lg shadow-lg" 
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{auction.title}</h1>
            <Link to={`/artists/${auction.artist_id}`}>
              <p className="text-xl text-gray-600 mt-2">by {auction.artist_name}</p>
            </Link>
            <div className="bg-gray-100 rounded-lg p-4 mt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Current Bid</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(auction.current_bid)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 text-right">Auction Ends In</p>
                  <p className="text-xl font-semibold text-red-600">{timeLeft}</p>
                </div>
              </div>
            </div>
            {/* Bidding UI for CLIENTS only */}
            {user?.userType === 'client' && (
              <div className="mt-6">
                {showBidAgreement && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Bidding Agreement</AlertTitle>
                    <AlertDescription className="flex justify-between items-center">
                      <p>By placing a bid, you're committing to buy this item if you win.</p>
                      <Button variant="link" className="p-0 h-auto" onClick={handleAgreementDismiss}>Got it</Button>
                    </AlertDescription>
                  </Alert>
                )}
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder={`> ${formatCurrency(auction.current_bid)}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    disabled={isPlacingBid}
                  />
                  <Button size="lg" onClick={handlePlaceBid} disabled={isPlacingBid} className="bg-purple-600 hover:bg-purple-700">
                    <Gavel className="mr-2 h-5 w-5" />
                    {isPlacingBid ? 'Placing...' : 'Place Bid'}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={handleToggleWatchlist} 
                    disabled={isWatchlistLoading || isPlacingBid}
                  >
                    {isWatchlistLoading ? (
                      <Loader className="animate-spin h-5 w-5" />
                    ) : (
                      <Heart className={`h-5 w-5 ${isWatching ? 'fill-red-500 text-red-500' : ''}`} />
                    )}
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[100, 200, 500].map((increment) => {
                    const newBid = parseFloat(auction.current_bid) + increment;
                    return (
                      <Button 
                        key={increment}
                        variant="outline" 
                        size="sm"
                        onClick={() => setBidAmount(newBid.toString())}
                      >
                        Bid +₱{increment}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Watch button for ARTISTS */}
            {user?.userType === 'artist' && (
              <div className="mt-6">
                 <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={handleToggleWatchlist} 
                    disabled={isWatchlistLoading}
                    className="w-full"
                  >
                    {isWatchlistLoading ? (
                      <Loader className="animate-spin h-5 w-5 mx-auto" />
                    ) : (
                      <div className="flex items-center justify-center">
                        <Heart className={`mr-2 h-5 w-5 ${isWatching ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{isWatching ? 'Watching' : 'Watch Auction'}</span>
                      </div>
                    )}
                  </Button>
              </div>
            )}
            <div className="mt-8 text-sm text-gray-600">
              <p><Tag className="inline mr-2 h-4 w-4" />Starting Bid: {formatCurrency(auction.starting_bid)}</p>
              <p><User className="inline mr-2 h-4 w-4" />{auction.total_bids || 0} bids so far.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuctionDetailPage; 