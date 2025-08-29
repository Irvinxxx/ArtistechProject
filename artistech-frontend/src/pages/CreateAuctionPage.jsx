import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

const CreateAuctionPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [formData, setFormData] = useState({
    artwork_id: '',
    starting_bid: '',
    end_time: '',
    reserve_price: '',
    start_time: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserArtworks = async () => {
      try {
        // This endpoint fetches artworks available for auction for the current user.
        const response = await fetch('/api/user/artworks', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch artworks');
        const data = await response.json();
        setArtworks(data.artworks);
      } catch (err) {
        setError(err.message);
      }
    };
    if (token) {
      fetchUserArtworks();
    }
  }, [token]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create auction');
      }
      toast.success('Auction created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Auction</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Artwork</label>
          <select
            name="artwork_id"
            value={formData.artwork_id}
            onChange={handleInputChange}
            required
            className="w-full mt-1 p-2 border rounded"
          >
            <option value="">Select an artwork</option>
            {artworks.map(art => (
              <option key={art.id} value={art.id}>{art.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Starting Bid (₱)</label>
          <input
            type="number"
            name="starting_bid"
            value={formData.starting_bid}
            onChange={handleInputChange}
            required
            className="w-full mt-1 p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Reserve Price (Optional)</label>
          <input
            type="number"
            name="reserve_price"
            value={formData.reserve_price}
            onChange={handleInputChange}
            placeholder="e.g., 5000"
            className="w-full mt-1 p-2 border rounded"
          />
           <p className="text-xs text-gray-500 mt-1">If the bidding does not reach this price, the item will not be sold.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Time (Optional)</label>
          <input
            type="datetime-local"
            name="start_time"
            value={formData.start_time}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank to start the auction immediately.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Time</label>
          <input
            type="datetime-local"
            name="end_time"
            value={formData.end_time}
            onChange={handleInputChange}
            required
            className="w-full mt-1 p-2 border rounded"
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700">
          {isLoading ? <Loader className="animate-spin" /> : 'Create Auction'}
        </Button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default CreateAuctionPage; 