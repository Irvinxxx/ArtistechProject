import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import ArtworkImage from './ui/artwork-image';

const ReviewsList = ({ artistId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!artistId) return;
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reviews/artists/${artistId}/reviews`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
      setLoading(false);
    };
    fetchReviews();
  }, [artistId]);

  if (loading) return <p>Loading reviews...</p>;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Reviews</h2>
      {reviews.length === 0 ? (
        <p>This artist has not received any reviews yet.</p>
      ) : (
        <div className="space-y-8">
          {reviews.map((review, index) => (
            <div key={index} className="flex items-start space-x-4 border-b pb-8">
              {review.artwork_thumbnail && (
                <Link to={`/artworks/${review.artwork_id}`}>
                  <ArtworkImage 
                    src={review.artwork_thumbnail} 
                    alt={review.artwork_title} 
                    className="w-24 h-24 object-cover rounded-md"
                  />
                </Link>
              )}
              <div className="flex-1">
                {review.artwork_title && (
                   <Link to={`/artworks/${review.artwork_id}`}>
                    <p className="font-semibold hover:underline">{review.artwork_title}</p>
                   </Link>
                )}
                <div className="flex items-center my-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="ml-4 font-semibold text-gray-700">{review.reviewer_name}</p>
                </div>
                <p className="text-gray-600 italic">"{review.review_text}"</p>
                <p className="text-sm text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList; 