import { Router, Response } from 'express';
import Course from '../models/Course';
import User from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /courses - Get all available courses
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.find().populate('concepts');
    res.json(courses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /courses/my - Get courses the user is enrolled in
router.get('/my', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ clerkId: req.auth?.userId }).populate({
      path: 'enrolledCourses',
      populate: { path: 'concepts' }
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user.enrolledCourses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /courses/:id/enroll - Enroll in a course
router.post('/:id/enroll', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const courseId = req.params.id;
    const user = await User.findOne({ clerkId: req.auth?.userId });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.enrolledCourses.includes(courseId as any)) {
      res.status(400).json({ error: 'Already enrolled in this course' });
      return;
    }

    user.enrolledCourses.push(courseId as any);
    await user.save();

    res.json({ message: 'Enrolled successfully', enrolledCourses: user.enrolledCourses });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
