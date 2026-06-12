
export const getAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return null;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return (sum / ratings.length).toFixed(1);
};


