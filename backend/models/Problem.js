import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  problemNumber: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  tags: [{ type: String }],
  problemStatement: { type: String, required: true },
  constraints: { type: String, required: true },
  sampleTestCases: [{
    input: String,
    output: String,
    explanation: String
  }],
  hiddenTestCases: [{
    input: String,
    output: String
  }]
}, { timestamps: true });

export default mongoose.model('Problem', problemSchema);
