import { Router, Request, Response } from 'express';
import User from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { clerkClient } from '@clerk/express';

const router = Router();

// GET /auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    if (!clerkId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let user = await User.findOne({ clerkId });

    if (!user) {
      // Auto-provision user on first login
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || '';
      const name = clerkUser.firstName 
        ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() 
        : email.split('@')[0];

      user = await User.create({
        clerkId,
        name,
        email,
      });
    } else {
      // Update streak
      const now = new Date();
      const lastActive = new Date(user.lastActiveDate);
      const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
      user.lastActiveDate = now;
      user.completedToday = 0;
      await user.save();
    }

    res.json(user);
  } catch (err: any) {
    console.error('Error in /auth/me:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /auth/settings
router.put('/settings', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(404).json({ error: 'User not found in database' });
      return;
    }

    const { learningStyle, mentorPersonality, dailyGoal } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { learningStyle, mentorPersonality, dailyGoal },
      { new: true }
    );
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
