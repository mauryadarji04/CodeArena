import Submission from '../models/Submission.js';

export const saveSubmission = async (req, res) => {
  try {
    const { userId, problemId, code, language } = req.body;
    
    console.log('Received submission:', { userId, problemId, language, codeLength: code?.length });
    
    if (!userId || !problemId || !code || !language) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const submission = await Submission.findOneAndUpdate(
      { userId, problemId },
      { code, language },
      { upsert: true, new: true }
    );
    
    console.log('Submission saved:', submission._id);
    res.json({ success: true, submission });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubmission = async (req, res) => {
  try {
    const { userId, problemId } = req.query;
    const submission = await Submission.findOne({ userId, problemId });
    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
