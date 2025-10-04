import { Schema, model, models } from 'mongoose';

const PublicationSchema = new Schema(
  {
    title: { type: String },
    authors: [String],
    year: Number,
    institution: String,
    source: { type: String, enum: ['upload', 'arxiv', 'pubmed', 'crossref', 'nasa'], default: 'upload' },
    url: String,
    summary: String,
    extractedKeywords: [String],
    rawTextLength: Number,
    createdBy: String,
  },
  { timestamps: true }
);

// Compound text index to support relevance sorting and search
PublicationSchema.index({ title: 'text', summary: 'text', extractedKeywords: 'text' });

const PublicationModel = models.Publication || model('Publication', PublicationSchema);
export default PublicationModel;
