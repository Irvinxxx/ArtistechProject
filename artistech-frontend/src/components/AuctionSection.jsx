import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Clock, Gavel, TrendingUp } from 'lucide-react'
import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { formatCurrency } from '../lib/utils'
import ArtworkImage from './ui/artwork-image'

const calculateTimeLeft = (endTime) => {
  const difference = +new Date(endTime) - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  return timeLeft;
};

const AuctionSection = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [featuredAuction, setFeaturedAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auctions?status=active&limit=5');
        if (!response.ok) {
          throw new Error('Failed to fetch auctions');
        }
        const data = await response.json();
        const activeAuctions = data.auctions.filter(a => new Date(a.end_time) > new Date());
        
        const featured = activeAuctions.find(a => a.featured) || activeAuctions[0];
        setFeaturedAuction(featured);
        setAuctions(activeAuctions.filter(a => a.id !== featured?.id).slice(0, 2));

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);
  
  useEffect(() => {
    if (featuredAuction) {
      const timer = setTimeout(() => {
        setTimeLeft(calculateTimeLeft(featuredAuction.end_time));
      }, 1000);
      return () => clearTimeout(timer);
    }
  });

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>Loading auctions...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Live Auctions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Bid on exclusive artworks and discover unique pieces from talented artists
            </p>
          </div>

          {/* Featured Auction */}
          {featuredAuction && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="relative">
                    <ArtworkImage
                      src={featuredAuction.thumbnail_image}
                      alt={featuredAuction.title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Featured Auction
                    </div>
                  </div>
                </div>
                
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center mb-4">
                    <Gavel className="h-6 w-6 text-purple-600 mr-2" />
                    <span className="text-purple-600 font-semibold">Live Auction</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    "{featuredAuction.title}"
                  </h3>
                  <p className="text-gray-600 mb-4">by {featuredAuction.artist_name}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Current Bid</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(featuredAuction.current_bid)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Starting Bid</p>
                      <p className="text-lg text-gray-700">{formatCurrency(featuredAuction.starting_bid)}</p>
                    </div>
                  </div>
                  
                  {/* Countdown Timer */}
                  <div className="bg-gray-100 rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="text-sm font-semibold text-gray-700">Auction Ends In:</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{timeLeft.days || '0'}</div>
                        <div className="text-xs text-gray-500">Days</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{timeLeft.hours || '0'}</div>
                        <div className="text-xs text-gray-500">Hours</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{timeLeft.minutes || '0'}</div>
                        <div className="text-xs text-gray-500">Minutes</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{timeLeft.seconds || '0'}</div>
                        <div className="text-xs text-gray-500">Seconds</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Link to={`/auctions/${featuredAuction.id}`} className="flex-1">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Watch Auction
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500">
                    <span className="font-semibold">{featuredAuction.total_bids} bids</span> • <span>{featuredAuction.watchers} watchers</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Auctions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {auctions.map((auction) => (
              <div key={auction.id} className="group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="w-full h-48 bg-gray-200">
                  <ArtworkImage
                    src={auction.thumbnail_image}
                    alt={auction.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    <Link to={`/auctions/${auction.id}`}>
                      <span className="absolute inset-0" />
                      {auction.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">by {auction.artist_name}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Current Bid</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(auction.current_bid)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Ends In</p>
                      <p className="text-sm font-semibold text-gray-700">{calculateTimeLeft(auction.end_time).days}d {calculateTimeLeft(auction.end_time).hours}h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">{auction.total_bids} bids</span>
                    </div>
                    {auction.verified && (
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Verified Artist
                      </div>
                    )}
                  </div>
                  
                  <Link to={`/auctions/${auction.id}`}>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Watch Auction
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/auctions">
              <Button variant="outline" size="lg" className="px-8 py-3">
                View All Auctions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default AuctionSection

