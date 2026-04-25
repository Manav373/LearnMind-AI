import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import User from '../models/User';

export interface AuthRequest extends Request {
  userId?: string;
  auth?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = getAuth(req);
    const clerkId = auth?.userId;

    if (!clerkId) {
      console.log(`❌ Auth failed for ${req.method} ${req.url} - No clerkId found in auth object`);
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    console.log(`✅ Auth success for ${clerkId} at ${req.method} ${req.url}`);

    // Attach auth to req for route handlers
    req.auth = auth;

    // Find user by clerkId
    const user = await User.findOne({ clerkId });
    
    if (user) {
      req.userId = user._id.toString();
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
