import { Router, Response } from 'express';
import { searchYouTube, getVideoDetails } from '../services/youtube.service';
import User from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/external/search?q=topic
router.get('/search', async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }
    const results = await searchYouTube(q as string);
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/external/video/:id
router.get('/video/:id', async (req: AuthRequest, res: Response) => {
  try {
    const details = await getVideoDetails(req.params.id as string);
    res.json(details);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/external/progress
router.post('/progress', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { videoId, title, thumbnail, timestamp } = req.body;
    const user = await User.findOne({ clerkId: req.auth?.userId });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const videoData = {
      videoId,
      title,
      thumbnail,
      timestamp,
      lastAccessed: new Date()
    };

    user.lastWatchedVideo = videoData;

    // Update history
    const historyIndex = user.learningHistory.findIndex(h => h.videoId === videoId);
    if (historyIndex > -1) {
      user.learningHistory.splice(historyIndex, 1);
    }
    user.learningHistory.unshift(videoData);
    
    // Keep only last 10
    if (user.learningHistory.length > 10) {
      user.learningHistory.pop();
    }

    await user.save();
    res.json({ message: 'Progress saved', lastWatchedVideo: user.lastWatchedVideo });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
