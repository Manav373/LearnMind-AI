import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  conceptId: mongoose.Types.ObjectId;
  accuracy: number;
  responseTime: number;
  mistakes: number;
  questionsAttempted: number;
  questionsCorrect: number;
  xpEarned: number;
  duration: number; // seconds
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  conceptId: { type: Schema.Types.ObjectId, ref: 'Concept', required: true },
  accuracy: { type: Number, default: 0 },
  responseTime: { type: Number, default: 0 },
  mistakes: { type: Number, default: 0 },
  questionsAttempted: { type: Number, default: 0 },
  questionsCorrect: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
}, { timestamps: true });

export default mongoose.model<ISession>('Session', SessionSchema);
