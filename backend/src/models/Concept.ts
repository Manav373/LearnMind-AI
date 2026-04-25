import mongoose, { Schema, Document } from 'mongoose';

export interface IConcept extends Document {
  name: string;
  description: string;
  category: string;
  dependencies: mongoose.Types.ObjectId[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  order: number;
}

const ConceptSchema = new Schema<IConcept>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  dependencies: [{ type: Schema.Types.ObjectId, ref: 'Concept' }],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  estimatedMinutes: { type: Number, default: 10 },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IConcept>('Concept', ConceptSchema);
