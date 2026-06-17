import React from 'react';
import { Star, X } from 'lucide-react';

export default function RateModal({ setShowRateModal, submitRating, ratingVal, setRatingVal, hoveredRating, setHoveredRating, reviewText, setReviewText }) {
  return (
    <div 
      onClick={e => e.target === e.currentTarget && setShowRateModal(false)} 
      className="fixed inset-0 bg-white/70 backdrop-blur-md z-[300] flex items-center justify-center p-4"
    >
      <div className="bg-white border border-indigo-500/20 rounded-3xl p-7 w-full max-w-[420px] shadow-[0_40px_90px_-20px_rgba(139,92,246,0.45),inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-[10px] font-extrabold tracking-[0.18em] text-violet-400 uppercase mb-1">Your Feedback</p>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-[-0.01em]">Rate & Review</h2>
          </div>
          <button 
            onClick={() => setShowRateModal(false)} 
            className="bg-slate-100 border border-slate-200 rounded-xl w-8 h-8 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={submitRating} className="flex flex-col gap-4">
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Select Rating</span>
              <span className="text-[11px] font-extrabold text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                {(() => {
                  const active = hoveredRating || ratingVal;
                  switch(active) {
                    case 1: return "Disappointed 😞";
                    case 2: return "Below Average 😕";
                    case 3: return "Good Experience 🙂";
                    case 4: return "Very Good! 😃";
                    case 5: return "Outstanding Masterpiece! 🤩";
                    default: return "Select a score";
                  }
                })()}
              </span>
            </div>
            <div 
              onMouseLeave={() => setHoveredRating(0)}
              className="flex gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl justify-between"
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const activeVal = hoveredRating || ratingVal;
                const isStarred = star <= activeVal;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingVal(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    className="bg-transparent border-none cursor-pointer p-1 transition-transform duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-125 active:scale-90"
                  >
                    <Star
                      size={32}
                      className={`transition-all duration-200 ${isStarred ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" : "text-slate-300"}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-2.5">Write a Review</span>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Share your experience (optional)..."
              className="w-full h-[100px] p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none resize-none font-sans box-border transition-colors focus:border-violet-400"
            />
          </div>

          <button
            type="submit"
            className="w-full p-3.5 bg-[linear-gradient(135deg,#8b5cf6_0%,#d946ef_100%)] border-none rounded-xl text-white text-sm font-bold cursor-pointer tracking-[0.02em] shadow-[0_14px_36px_-10px_rgba(139,92,246,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_18px_40px_-10px_rgba(139,92,246,0.7),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}
