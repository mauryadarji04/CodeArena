import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Submission from './models/Submission.js';
import User from './models/User.js';
import Problem from './models/Problem.js';

dotenv.config();

const viewSubmissions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    const submissions = await Submission.find()
      .populate('userId', 'name email')
      .populate('problemId', 'problemNumber title');
    
    console.log(`Total Submissions: ${submissions.length}\n`);
    
    if (submissions.length === 0) {
      console.log('No submissions found in database.');
    } else {
      submissions.forEach((sub, index) => {
        console.log(`--- Submission ${index + 1} ---`);
        console.log(`User: ${sub.userId?.name} (${sub.userId?.email})`);
        console.log(`Problem: ${sub.problemId?.problemNumber}. ${sub.problemId?.title}`);
        console.log(`Language: ${sub.language}`);
        console.log(`Code Length: ${sub.code.length} characters`);
        console.log(`Last Updated: ${sub.updatedAt}`);
        console.log(`Code Preview: ${sub.code.substring(0, 100)}...`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

viewSubmissions();
