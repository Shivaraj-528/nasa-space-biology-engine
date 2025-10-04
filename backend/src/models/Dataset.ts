import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDataset extends Document {
  source: string; // GeneLab, NBISC, etc.
  type: string;   // genomics, proteomics, etc.
  title: string;
  organism?: string;
  assay_type?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DatasetSchema = new Schema<IDataset>(
  {
    source: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    organism: { type: String },
    assay_type: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export const Dataset: Model<IDataset> =
  mongoose.models.Dataset || mongoose.model<IDataset>('Dataset', DatasetSchema);
