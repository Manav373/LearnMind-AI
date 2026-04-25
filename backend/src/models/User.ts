import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  learningStyle: 'visual' | 'textual' | 'example';
  mentorPersonality: 'friendly' | 'strict' | 'coach';
  streak: number;
  lastActiveDate: Date;
  xp: number;
  level: number;
  dailyGoal: number;
  completedToday: number;
  confidenceScore: number;
  totalSessions: number;
  totalTimeSpent: number;
  enrolledCourses: mongoose.Types.ObjectId[];
  lastWatchedVideo?: {
    videoId: string;
    title: string;
    thumbnail: string;
    timestamp: number;
    lastAccessed: Date;
  };
  learningHistory: Array<{
    videoId: string;
    title: string;
    thumbnail: string;
    timestamp: number;
    lastAccessed: Date;
  }>;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  learningStyle: { type: String, enum: ['visual', 'textual', 'example'], default: 'visual' },
  mentorPersonality: { type: String, enum: ['friendly', 'strict', 'coach'], default: 'friendly' },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  dailyGoal: { type: Number, default: 5 },
  completedToday: { type: Number, default: 0 },
  confidenceScore: { type: Number, default: 50 },
  totalSessions: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 },
  enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  lastWatchedVideo: {
    videoId: String,
    title: String,
    thumbnail: String,
    timestamp: Number,
    lastAccessed: { type: Date, default: Date.now }
  },
  learningHistory: [{
    videoId: String,
    title: String,
    thumbnail: String,
    timestamp: Number,
    lastAccessed: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
