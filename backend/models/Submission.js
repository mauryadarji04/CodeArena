import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXTENSIONS = { cpp: '.cpp', python: '.py', javascript: '.js', java: '.java' };
const SUBMISSIONS_DIR = path.join(__dirname, '..', 'submissions');

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  filePath: { type: String }
}, { timestamps: true });

submissionSchema.pre('save', function (next) {
  if (!this.isModified('code')) return next();

  const ext = EXTENSIONS[this.language] || '.txt';
  const fileName = `${this.userId}_${this.problemId}_${Date.now()}${ext}`;
  const filePath = path.join(SUBMISSIONS_DIR, fileName);

  fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
  fs.writeFileSync(filePath, this.code);
  this.filePath = filePath;
  next();
});

submissionSchema.index({ userId: 1, problemId: 1 }, { unique: true });

export default mongoose.model('Submission', submissionSchema);
