import { Router, Response } from 'express';
import UserProgress from '../models/UserProgress';
import Concept from '../models/Concept';
import Mistake from '../models/Mistake';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { isDueForReview, estimateRetention } from '../services/spacedRepetition';

const router = Router();

// GET /recommendations - Get personalized learning recommendations
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const allConcepts = await Concept.find().sort({ order: 1 });
    const allProgress = await UserProgress.find({ userId: req.userId });
    const mistakes = await Mistake.find({ userId: req.userId }).sort({ count: -1 });

    const progressMap = new Map(allProgress.map(p => [p.conceptId.toString(), p]));

    // 1. Due for review (spaced repetition)
    const dueForReview = allProgress
      .filter(p => isDueForReview(p.nextReviewDate) && p.status !== 'not_started')
      .map(p => {
        const concept = allConcepts.find(c => c._id.toString() === p.conceptId.toString());
        const daysSince = Math.floor((Date.now() - new Date(p.lastReviewed).getTime()) / (1000 * 60 * 60 * 24));
        return {
          conceptId: p.conceptId,
          name: concept?.name || 'Unknown',
          type: 'review' as const,
          reason: `Due for review (${daysSince} days since last review)`,
          priority: 1,
          mastery: p.masteryScore,
          estimatedRetention: estimateRetention(daysSince, p.easeFactor),
        };
      })
      .sort((a, b) => a.estimatedRetention - b.estimatedRetention); // Lowest retention first

    // 2. Weak areas (mastery < 70% and attempted)
    const weakAreas = allProgress
      .filter(p => p.masteryScore < 70 && p.totalAttempts > 0 && p.status !== 'mastered')
      .map(p => {
        const concept = allConcepts.find(c => c._id.toString() === p.conceptId.toString());
        return {
          conceptId: p.conceptId,
          name: concept?.name || 'Unknown',
          type: 'strengthen' as const,
          reason: `Mastery at ${p.masteryScore}% — needs improvement`,
          priority: 2,
          mastery: p.masteryScore,
        };
      })
      .sort((a, b) => a.mastery - b.mastery);

    // 3. Next new concepts (not started, dependencies met)
    const nextTopics = allConcepts
      .filter(c => {
        const prog = progressMap.get(c._id.toString());
        if (prog && prog.status !== 'not_started') return false;
        // Check if all dependencies are mastered (>= 60%)
        return c.dependencies.every(depId => {
          const depProgress = progressMap.get(depId.toString());
          return depProgress && depProgress.masteryScore >= 60;
        });
      })
      .slice(0, 3)
      .map(c => ({
        conceptId: c._id,
        name: c.name,
        type: 'new' as const,
        reason: 'Ready to learn — prerequisites met',
        priority: 3,
        mastery: 0,
      }));

    // 4. Mistake-heavy concepts
    const mistakeConcepts = [...new Set(mistakes.filter(m => m.count >= 3).map(m => m.conceptId.toString()))];
    const problemAreas = mistakeConcepts.slice(0, 3).map(conceptId => {
      const concept = allConcepts.find(c => c._id.toString() === conceptId);
      const mistakeCount = mistakes.filter(m => m.conceptId.toString() === conceptId).reduce((sum, m) => sum + m.count, 0);
      return {
        conceptId,
        name: concept?.name || 'Unknown',
        type: 'fix_mistakes' as const,
        reason: `${mistakeCount} repeated mistakes — needs attention`,
        priority: 1,
        mastery: progressMap.get(conceptId)?.masteryScore || 0,
      };
    });

    // Combine and sort by priority
    const recommendations = [...dueForReview, ...problemAreas, ...weakAreas, ...nextTopics]
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 10);

    res.json({ recommendations, stats: { dueReviews: dueForReview.length, weakCount: weakAreas.length, newAvailable: nextTopics.length } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
