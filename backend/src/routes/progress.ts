import { Router, Response } from 'express';
import UserProgress from '../models/UserProgress';
import Session from '../models/Session';
import Mistake from '../models/Mistake';
import User from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { calculateMastery, calculateXP, calculateLevel, normalizeSpeed, calculateConsistency, getNextDifficulty } from '../services/adaptiveEngine';
import { calculateNextReview } from '../services/spacedRepetition';

const router = Router();

// POST /progress/update - Submit a learning session and update progress
router.post('/update', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { conceptId, accuracy, responseTime, mistakes, questionsAttempted, questionsCorrect, duration, difficulty, mistakeDetails } = req.body;

    const user = await User.findById(req.userId);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    // Get or create progress
    let progress = await UserProgress.findOne({ userId: req.userId, conceptId });
    if (!progress) {
      progress = await UserProgress.create({
        userId: req.userId, conceptId,
        masteryScore: 0, accuracy: 0, speed: 0, consistency: 0,
      });
    }

    // Get recent sessions for consistency calculation
    const recentSessions = await Session.find({ userId: req.userId, conceptId })
      .sort({ createdAt: -1 }).limit(5);
    const recentAccuracies = recentSessions.map(s => s.accuracy);
    recentAccuracies.push(accuracy);

    // Calculate metrics
    const speed = normalizeSpeed(responseTime, questionsAttempted);
    const consistency = calculateConsistency(recentAccuracies);
    const newMastery = calculateMastery(progress.masteryScore, { accuracy, speed, consistency });

    // Spaced repetition update
    const { nextReviewDate, newInterval, newEaseFactor } = calculateNextReview(
      accuracy, progress.reviewInterval, progress.easeFactor, progress.totalAttempts
    );

    // Determine status
    let status: 'learning' | 'reviewing' | 'mastered' = 'learning';
    if (newMastery >= 90) status = 'mastered';
    else if (progress.totalAttempts > 0) status = 'reviewing';

    // Update progress
    progress.masteryScore = newMastery;
    progress.accuracy = accuracy;
    progress.speed = speed;
    progress.consistency = consistency;
    progress.totalAttempts += 1;
    progress.correctAttempts += questionsCorrect || 0;
    progress.lastReviewed = new Date();
    progress.nextReviewDate = nextReviewDate;
    progress.reviewInterval = newInterval;
    progress.easeFactor = newEaseFactor;
    progress.status = status;
    await progress.save();

    // Calculate XP and update user
    const xpEarned = calculateXP(accuracy, difficulty || 'medium', user.streak);
    user.xp += xpEarned;
    user.level = calculateLevel(user.xp);
    user.completedToday += 1;
    user.totalSessions += 1;
    user.totalTimeSpent += duration || 0;
    await user.save();

    // Create session record
    await Session.create({
      userId: req.userId, conceptId, accuracy, responseTime,
      mistakes, questionsAttempted, questionsCorrect, xpEarned,
      duration, difficulty: difficulty || getNextDifficulty(accuracy),
    });

    // Store mistake details if provided
    if (mistakeDetails && Array.isArray(mistakeDetails)) {
      for (const m of mistakeDetails) {
        await Mistake.findOneAndUpdate(
          { userId: req.userId, conceptId, questionText: m.question },
          { userAnswer: m.userAnswer, correctAnswer: m.correctAnswer, errorType: m.errorType || 'conceptual', lastOccurred: new Date(), $inc: { count: 1 } },
          { upsert: true }
        );
      }
    }

    const nextDifficulty = getNextDifficulty(accuracy);

    res.json({
      mastery: newMastery, xpEarned, totalXp: user.xp, level: user.level,
      nextDifficulty, nextReviewDate, status, streak: user.streak,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /progress/overview - Get full progress overview
router.get('/overview', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const progress = await UserProgress.find({ userId: req.userId }).populate('conceptId', 'name category');
    const user = await User.findById(req.userId).select('-password');
    const sessions = await Session.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(30);
    const mistakes = await Mistake.find({ userId: req.userId }).sort({ count: -1 }).limit(20).populate('conceptId', 'name');

    const stats = {
      totalConcepts: progress.length,
      mastered: progress.filter(p => p.status === 'mastered').length,
      learning: progress.filter(p => p.status === 'learning').length,
      reviewing: progress.filter(p => p.status === 'reviewing').length,
      avgMastery: progress.length > 0 ? Math.round(progress.reduce((sum, p) => sum + p.masteryScore, 0) / progress.length) : 0,
      dueForReview: progress.filter(p => new Date(p.nextReviewDate) <= new Date()).length,
    };

    res.json({ user, progress, sessions, mistakes, stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /progress/analytics - Detailed analytics data
router.get('/analytics', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await Session.find({ userId: req.userId }).sort({ createdAt: 1 });
    const progress = await UserProgress.find({ userId: req.userId }).populate('conceptId', 'name category');
    const mistakes = await Mistake.find({ userId: req.userId }).populate('conceptId', 'name');

    // Accuracy over time (last 30 sessions)
    const accuracyOverTime = sessions.slice(-30).map(s => ({
      date: s.createdAt,
      accuracy: Math.round(s.accuracy * 100),
      xp: s.xpEarned,
    }));

    // Category mastery
    const categoryMap = new Map<string, number[]>();
    for (const p of progress) {
      const concept = p.conceptId as any;
      if (concept?.category) {
        if (!categoryMap.has(concept.category)) categoryMap.set(concept.category, []);
        categoryMap.get(concept.category)!.push(p.masteryScore);
      }
    }
    const categoryMastery = Array.from(categoryMap.entries()).map(([category, scores]) => ({
      category,
      avgMastery: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: scores.length,
    }));

    // Weak areas
    const weakAreas = progress
      .filter(p => p.masteryScore < 50 && p.totalAttempts > 0)
      .map(p => ({ concept: (p.conceptId as any)?.name, mastery: p.masteryScore, attempts: p.totalAttempts }))
      .sort((a, b) => a.mastery - b.mastery);

    // Mistake patterns
    const errorPatterns = mistakes.reduce((acc, m) => {
      acc[m.errorType] = (acc[m.errorType] || 0) + m.count;
      return acc;
    }, {} as Record<string, number>);

    res.json({ accuracyOverTime, categoryMastery, weakAreas, errorPatterns, totalSessions: sessions.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
