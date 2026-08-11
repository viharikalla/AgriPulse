import mongoose, { Schema, Document } from 'mongoose';
import { FieldAnalysis } from '../types/index.js';

export interface IAnalysisDocument extends Omit<FieldAnalysis, 'id'>, Document {}

const AnalysisSchema = new Schema<IAnalysisDocument>(
  {
    sessionId: { type: String, required: true, index: true },
    userId: { type: String, index: true },
    createdAt: { type: String, required: true, default: () => new Date().toISOString(), index: true },
    location: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    crop: {
      name: { type: String, required: true, index: true },
      displayName: { type: String, required: true },
    },
    photoUrl: { type: String, required: true },
    assessment: { type: Schema.Types.Mixed, required: true },
    weatherSnapshot: { type: Schema.Types.Mixed, required: true },
    decision: { type: Schema.Types.Mixed, required: true },
    managementActions: { type: Schema.Types.Mixed, required: true },
    sourceMetadata: { type: Schema.Types.Mixed, required: true },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound Indexes for High-Frequency Application Queries
AnalysisSchema.index({ sessionId: 1, createdAt: -1 });
AnalysisSchema.index({ userId: 1, createdAt: -1 });
AnalysisSchema.index({ _id: 1, sessionId: 1 });
AnalysisSchema.index({ _id: 1, userId: 1 });
AnalysisSchema.index({ 'crop.name': 1, createdAt: -1 });

export const AnalysisModel = mongoose.model<IAnalysisDocument>('Analysis', AnalysisSchema);

// In-memory fallback repository for dev/test when MongoDB is not connected
export class InMemAnalysisStore {
  private static store: Map<string, FieldAnalysis> = new Map();

  public static async save(analysis: FieldAnalysis): Promise<FieldAnalysis> {
    this.store.set(analysis.id, analysis);
    return analysis;
  }

  public static async findById(id: string, sessionId?: string, userId?: string): Promise<FieldAnalysis | null> {
    const item = this.store.get(id);
    if (!item) return null;
    
    // Ownership Check: User ownership takes priority if userId is provided
    if (userId && item.userId) {
      if (item.userId !== userId) return null;
      return item;
    }

    if (sessionId && item.sessionId !== sessionId) return null;
    return item;
  }

  public static async findBySession(sessionId: string): Promise<FieldAnalysis[]> {
    return Array.from(this.store.values())
      .filter((item) => item.sessionId === sessionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async findByUser(userId: string): Promise<FieldAnalysis[]> {
    return Array.from(this.store.values())
      .filter((item) => item.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static clear(): void {
    this.store.clear();
  }
}
