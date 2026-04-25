import mongoose, { Schema, Document } from 'mongoose';

export interface IMistake extends Document {
  userId: mongoose.Types.ObjectId;
  conceptId: mongoose.Types.ObjectId;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  errorType: 'conceptual' | 'careless' | 'knowledge_gap' | 'misunderstanding';
  count: number;
  lastOccurred: Date;
}

const MistakeSchema = new Schema<IMistake>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  conceptId: { type: Schema.Types.ObjectId, ref: 'Concept', required: true },
  questionText: { type: String, required: true },
  userAnswer: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  errorType: { type: String, enum: ['conceptual', 'careless', 'knowledge_gap', 'misunderstanding'], default: 'conceptual' },
  count: { type: Number, default: 1 },
  lastOccurred: { type: Date, default: Date.now },
}, { timestamps: true });

MistakeSchema.index({ userId: 1, conceptId: 1 });

export default mongoose.model<IMistake>('Mistake', MistakeSchema);
