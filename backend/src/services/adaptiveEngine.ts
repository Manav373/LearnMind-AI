/**
 * Adaptive Learning Engine
 * Handles mastery calculation, difficulty adjustment, and learning pace adaptation.
 */

export interface PerformanceMetrics {
  accuracy: number;    // 0-1
  speed: number;       // 0-1 normalized
  consistency: number; // 0-1
}

/**
 * Mastery = (Accuracy × 0.5) + (Speed × 0.2) + (Consistency × 0.3)
 * Applies exponential moving average to smooth out score changes.
 */
export const calculateMastery = (current: number, metrics: PerformanceMetrics): number => {
  const rawScore = (metrics.accuracy * 0.5 + metrics.speed * 0.2 + metrics.consistency * 0.3) * 100;
  const alpha = 0.3; // learning rate – how quickly score responds to new performance
  const newScore = current + alpha * (rawScore - current);
  return Math.round(Math.min(100, Math.max(0, newScore)) * 10) / 10;
};

/**
 * Determine next difficulty level based on recent accuracy.
 */
export const getNextDifficulty = (accuracy: number): 'easy' | 'medium' | 'hard' => {
  if (accuracy < 0.5) return 'easy';
  if (accuracy < 0.8) return 'medium';
  return 'hard';
};

/**
 * Determine explanation style based on mastery and mistake patterns.
 */
export const getExplanationStyle = (mastery: number, repeatedMistakes: number): string => {
  if (repeatedMistakes >= 3) return 'analogy'; // change teaching method
  if (mastery < 30) return 'simple';
  if (mastery < 70) return 'example';
  return 'technical';
};

/**
 * Calculate XP earned for a session.
 * Base XP = 10, multiplied by accuracy and difficulty bonus.
 */
export const calculateXP = (accuracy: number, difficulty: string, streak: number): number => {
  const base = 10;
  const difficultyMultiplier = difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1;
  const accuracyBonus = Math.round(accuracy * 100);
  const streakBonus = Math.min(streak, 7) * 2; // max 14 bonus from streak
  return Math.round(base * difficultyMultiplier + accuracyBonus * 0.5 + streakBonus);
};

/**
 * Calculate user level from XP.
 * Level formula: level = floor(sqrt(xp / 100)) + 1
 */
export const calculateLevel = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

/**
 * Normalize response time to a 0-1 speed score.
 * Assumes an ideal response time of 10 seconds per question.
 */
export const normalizeSpeed = (avgResponseTimeMs: number, questionCount: number): number => {
  if (questionCount === 0) return 0.5;
  const avgPerQuestion = avgResponseTimeMs / questionCount / 1000; // to seconds
  const ideal = 15; // 15 seconds ideal
  const score = Math.max(0, Math.min(1, ideal / Math.max(avgPerQuestion, 1)));
  return Math.round(score * 100) / 100;
};

/**
 * Calculate consistency from recent session accuracies.
 * Lower variance = higher consistency.
 */
export const calculateConsistency = (recentAccuracies: number[]): number => {
  if (recentAccuracies.length < 2) return 0.5;
  const mean = recentAccuracies.reduce((a, b) => a + b, 0) / recentAccuracies.length;
  const variance = recentAccuracies.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / recentAccuracies.length;
  const stdDev = Math.sqrt(variance);
  // Convert stdDev to consistency: lower stdDev = higher consistency
  return Math.round(Math.max(0, Math.min(1, 1 - stdDev * 2)) * 100) / 100;
};
