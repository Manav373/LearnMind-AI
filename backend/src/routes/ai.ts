import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import UserProgress from '../models/UserProgress';
import Concept from '../models/Concept';
import { 
  generateExplanation, 
  generateQuestions, 
  getChatResponse, 
  evaluateTeachBack, 
  evaluateAnswer,
  getCourseAssistantResponse,
  generateVideoNotes,
  generateVideoMCQs
} from '../services/aiService';
import { getExplanationStyle, getNextDifficulty } from '../services/adaptiveEngine';
import Mistake from '../models/Mistake';

const router = Router();

// POST /ai/explain
router.post('/explain', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { conceptId } = req.body;
    const user = await User.findById(req.userId);
    const concept = await Concept.findById(conceptId);
    if (!concept || !user) { res.status(404).json({ error: 'Not found' }); return; }

    const progress = await UserProgress.findOne({ userId: req.userId, conceptId });
    const mastery = progress?.masteryScore || 0;
    const mistakes = await Mistake.countDocuments({ userId: req.userId, conceptId });
    const style = getExplanationStyle(mastery, mistakes);

    const explanation = await generateExplanation(concept.name, style, mastery, user.mentorPersonality);
    res.json({ explanation, style, mastery });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ai/generate-questions
router.post('/generate-questions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { conceptId, count } = req.body;
    const concept = await Concept.findById(conceptId);
    if (!concept) { res.status(404).json({ error: 'Concept not found' }); return; }

    const progress = await UserProgress.findOne({ userId: req.userId, conceptId });
    const difficulty = getNextDifficulty(progress?.accuracy || 0);

    const questions = await generateQuestions(concept.name, difficulty, count || 5);
    res.json({ questions, difficulty });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ai/chat
router.post('/chat', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { messages, message, conceptId, context } = req.body;
    const user = await User.findById(req.userId);
    let conceptContext: string | undefined = context;

    if (conceptId && conceptId.match(/^[0-9a-fA-F]{24}$/)) {
      const concept = await Concept.findById(conceptId);
      if (concept) conceptContext = (conceptContext ? conceptContext + "\n" : "") + `Topic: ${concept.name} — ${concept.description}`;
    }

    const response = await getChatResponse(messages || [], message, conceptContext, user?.mentorPersonality);
    res.json({ response });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ai/evaluate-answer
router.post('/evaluate-answer', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { question, studentAnswer, correctAnswer } = req.body;
    const result = await evaluateAnswer(question, studentAnswer, correctAnswer);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ai/teach-back
router.post('/teach-back', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { conceptId, explanation } = req.body;
    const concept = await Concept.findById(conceptId);
    if (!concept) { res.status(404).json({ error: 'Concept not found' }); return; }

    const result = await evaluateTeachBack(concept.name, explanation);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ai/course-assistant
router.post('/course-assistant', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { messages, message } = req.body;
    const Course = (await import('../models/Course')).default;
    const availableCourses = await Course.find();
    const { getCourseAssistantResponse } = require('../services/aiService');
    
    const response = await getCourseAssistantResponse(messages || [], message, availableCourses);
    res.json({ response });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ai/generate-notes
router.post('/generate-notes', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { videoTitle, videoDescription } = req.body;
    if (!videoTitle) {
      res.status(400).json({ error: 'Video title is required' });
      return;
    }
    const notes = await generateVideoNotes(videoTitle, videoDescription || '');
    res.json({ notes });
  } catch (err: any) {
    console.error('Error generating notes:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /ai/generate-video-mcqs
router.post('/generate-video-mcqs', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { videoTitle, videoDescription, count } = req.body;
    if (!videoTitle) {
      res.status(400).json({ error: 'Video title is required' });
      return;
    }
    const questions = await generateVideoMCQs(videoTitle, videoDescription || '', count || 5);
    res.json({ questions });
  } catch (err: any) {
    console.error('Error generating MCQs:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
