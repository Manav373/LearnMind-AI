import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  category: string;
  concepts: mongoose.Types.ObjectId[];
  instructor: string;
  thumbnail: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  concepts: [{ type: Schema.Types.ObjectId, ref: 'Concept' }],
  instructor: { type: String, default: 'AI Mentor' },
  thumbnail: { type: String },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
}, { timestamps: true });

export default mongoose.model<ICourse>('Course', CourseSchema);
