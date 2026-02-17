import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  code: { type: String, required: true },
  language: { type: String, required: true }
}, { timestamps: true });

submissionSchema.index({ userId: 1, problemId: 1 }, { unique: true });

export default mongoose.model('Submission', submissionSchema);
