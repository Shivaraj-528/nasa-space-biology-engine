import { Schema, model, models } from 'mongoose';

const QuestionSchema = new Schema(
  {
    question: String,
    options: [String],
    answerIndex: Number,
    explanation: String,
  },
  { _id: false }
);

const QuizSchema = new Schema(
  {
    title: String,
    publicationIds: [{ type: Schema.Types.ObjectId, ref: 'Publication' }],
    questions: [QuestionSchema],
    createdBy: String,
  },
  { timestamps: true }
);

const QuizModel = models.Quiz || model('Quiz', QuizSchema);
export default QuizModel;
