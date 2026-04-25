import { Router, Response } from 'express';
import Concept from '../models/Concept';
import UserProgress from '../models/UserProgress';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /concepts - Get all concepts with user progress
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const concepts = await Concept.find().sort({ order: 1 }).populate('dependencies', 'name');
    const progress = await UserProgress.find({ userId: req.userId });

    const progressMap = new Map(progress.map(p => [p.conceptId.toString(), p]));

    const enriched = concepts.map(c => ({
      ...c.toObject(),
      progress: progressMap.get(c._id.toString()) || {
        masteryScore: 0, status: 'not_started', accuracy: 0,
        totalAttempts: 0, lastReviewed: null, nextReviewDate: null,
      },
    }));

    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /concepts/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const concept = await Concept.findById(req.params.id).populate('dependencies', 'name');
    if (!concept) { res.status(404).json({ error: 'Concept not found' }); return; }

    const progress = await UserProgress.findOne({ userId: req.userId, conceptId: concept._id });

    res.json({ ...concept.toObject(), progress: progress || { masteryScore: 0, status: 'not_started' } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
