import { formatTo12Hr } from './formatTo12Hr';

export const formatRangeTo12Hr = (rangeStr) => {
  if (!rangeStr.includes(' - ')) return rangeStr;
  const [start, end] = rangeStr.split(' - ');
  return `${formatTo12Hr(start)} - ${formatTo12Hr(end)}`;
};

// ==========================================
// 1. HELPER COMPONENTS
// ==========================================

