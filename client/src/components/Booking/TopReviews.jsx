import React from 'react';

const TopReviews = ({ ratings }) => {
  if (!ratings || ratings.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        Top Rated Reviews
      </h3>
      <div className="flex flex-col gap-4">
        {[...ratings]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5)
          .map((review, idx) => (
            <div key={idx} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
                {review.customerName?.charAt(0) || 'C'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900">{review.customerName || 'Customer'}</span>
                  <div className="flex items-center text-amber-400 text-xs gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < (review.rating || 5) ? '★' : '☆'}</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  "{review.reviewText || 'Excellent service and great atmosphere. Highly recommended!'}"
                </p>
              </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default TopReviews;
