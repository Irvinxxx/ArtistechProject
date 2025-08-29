import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, TrendingUp, Loader } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import ArtworkImage from '../components/ui/artwork-image';

const AuctionsPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'active',
    sort: 'ending-soon'
  });

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        params.append('status', filters.status);
        params.append('sort', filters.sort);

        const response = await fetch(`http://localhost:3000/api/auctions?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch auctions');
        }
        const data = await response.json();
        setAuctions(data.auctions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const calculateTimeLeft = (endTime) => {
    const difference = +new Date(endTime) - +new Date();
    if (difference <= 0) return "Ended";
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    return `${days}d left`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Live Auctions</h1>
          <p className="text-lg text-gray-600 mt-2">Bid on exclusive artworks from our talented community.</p>
        </div>

        {/* Filter and Sort Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <Input 
            placeholder="Search auctions..." 
            className="flex-grow"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <div className="flex gap-4">
            <Select onValueChange={(value) => handleFilterChange('status', value)} defaultValue="active">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => handleFilterChange('sort', value)} defaultValue="ending-soon">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ending-soon">Ending Soon</SelectItem>
                <SelectItem value="newly-listed">Newly Listed</SelectItem>
                <SelectItem value="most-bids">Most Bids</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {auctions.map((auction) => (
              <div key={auction.id} className="group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <Link to={`/auctions/${auction.id}`}>
                  <div className="w-full h-48 bg-gray-200">
                    <ArtworkImage
                      src={auction.thumbnail_image}
                      alt={auction.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                      {auction.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">by {auction.artist_name}</p>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Current Bid</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(auction.current_bid)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Ends In</p>
                        <p className="text-sm font-semibold text-gray-700">{calculateTimeLeft(auction.end_time)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>{auction.total_bids} bids</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionsPage; 