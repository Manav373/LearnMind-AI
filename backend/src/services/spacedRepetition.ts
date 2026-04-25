/**
 * Spaced Repetition Engine using a modified SM-2 algorithm.
 * Calculates optimal review intervals based on performance.
 */

interface ReviewResult {
  nextReviewDate: Date;
  newInterval: number;   // in days
  newEaseFactor: number;
}

/**
 * SM-2 inspired algorithm:
 * quality: 0-5 rating (0=complete blackout, 5=perfect)
 * Mapped from accuracy: accuracy * 5
 */
export const calculateNextReview = (
  accuracy: number,
  currentInterval: number,
  currentEaseFactor: number,
  repetitions: number
): ReviewResult => {
  const quality = Math.round(accuracy * 5);
  let newEaseFactor = currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor);

  let newInterval: number;

  if (quality < 3) {
    // Failed – reset to 1 day
    newInterval = 1;
  } else {
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 3;
    } else {
      newInterval = Math.round(currentInterval * newEaseFactor);
    }
  }

  // Cap interval at 180 days
  newInterval = Math.min(180, newInterval);

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    nextReviewDate,
    newInterval,
    newEaseFactor: Math.round(newEaseFactor * 100) / 100,
  };
};

/**
 * Get concepts that are due for review.
 * A concept is due if nextReviewDate <= now.
 */
export const isDueForReview = (nextReviewDate: Date): boolean => {
  return new Date(nextReviewDate) <= new Date();
};

/**
 * Memory decay model (Ebbinghaus forgetting curve).
 * Retention = e^(-t/S) where t = time elapsed, S = stability
 * Returns estimated retention as a percentage.
 */
export const estimateRetention = (
  daysSinceReview: number,
  stability: number // easeFactor acts as stability proxy
): number => {
  const retention = Math.exp(-daysSinceReview / (stability * 10));
  return Math.round(retention * 100);
};
