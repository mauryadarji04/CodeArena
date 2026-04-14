import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
  input:          String,
  expectedOutput: String,
  actual:         String,
  error:          String,
  passed:         Boolean,
  isHidden:       Boolean
}, { _id: false });

const submissionRecordSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  problemId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  language:    { type: String, required: true },
  type:        { type: String, enum: ['run', 'submit'], required: true },
  status:      { type: String, enum: ['pending', 'accepted', 'wrong_answer'], default: 'pending' },
  totalPassed: { type: Number, default: 0 },
  totalTests:  { type: Number, default: 0 },
  testResults: [testResultSchema],
  mlAnalysis:  { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// Indexes for fast analytics queries
submissionRecordSchema.index({ userId: 1, status: 1, type: 1 });
submissionRecordSchema.index({ problemId: 1, status: 1, type: 1 });

export default mongoose.model('SubmissionRecord', submissionRecordSchema);
