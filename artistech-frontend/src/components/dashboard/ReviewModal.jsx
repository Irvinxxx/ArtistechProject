import { useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Star } from 'lucide-react';
import { toast } from 'sonner';

const ReviewModal = ({ item, orderId, onClose, onReviewSubmit }) => {
  const { token } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reviews/orders/${orderId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, review_text: reviewText, artworkId: item.artwork_id }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit review.');
      }
      toast.success('Review submitted successfully!');
      onReviewSubmit();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Leave a Review</h2>
          <button onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="mb-4">
          <p>You are reviewing your purchase of:</p>
          <p className="font-semibold">{item.title}</p>
        </div>
        <div className="mb-4">
          <p className="font-medium mb-2">Rating</p>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`cursor-pointer ${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>
        <div className="mb-6">
          <p className="font-medium mb-2">Review</p>
          <Textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your thoughts on the artwork and your experience..."
          />
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </div>
  );
};

export default ReviewModal; 