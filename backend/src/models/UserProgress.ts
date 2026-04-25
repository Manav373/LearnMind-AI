import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  conceptId: mongoose.Types.ObjectId;
  masteryScore: number;
  accuracy: number;
  speed: number;
  consistency: number;
  totalAttempts: number;
  correctAttempts: number;
  lastReviewed: Date;
  nextReviewDate: Date;
  reviewInterval: number; // days
  easeFactor: number; // for spaced repetition (SM-2)
  status: 'not_started' | 'learning' | 'reviewing' | 'mastered';
}

const UserProgressSchema = new Schema<IUserProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  conceptId: { type: Schema.Types.ObjectId, ref: 'Concept', required: true },
  masteryScore: { type: Number, default: 0, min: 0, max: 100 },
  accuracy: { type: Number, default: 0 },
  speed: { type: Number, default: 0 },
  consistency: { type: Number, default: 0 },
  totalAttempts: { type: Number, default: 0 },
  correctAttempts: { type: Number, default: 0 },
  lastReviewed: { type: Date, default: Date.now },
  nextReviewDate: { type: Date, default: Date.now },
  reviewInterval: { type: Number, default: 1 },
  easeFactor: { type: Number, default: 2.5 },
  status: { type: String, enum: ['not_started', 'learning', 'reviewing', 'mastered'], default: 'not_started' },
}, { timestamps: true });

UserProgressSchema.index({ userId: 1, conceptId: 1 }, { unique: true });

export default mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
