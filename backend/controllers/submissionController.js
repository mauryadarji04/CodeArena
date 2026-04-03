import Submission from '../models/Submission.js';
import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

export const saveSubmission = async (req, res) => {
  try {
    const { userId, problemId, code, language } = req.body;
    
    console.log('Received submission:', { userId, problemId, language, codeLength: code?.length });
    
    if (!userId || !problemId || !code || !language) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    let submission = await Submission.findOne({ userId, problemId });
    if (submission) {
      submission.code = code;
      submission.language = language;
    } else {
      submission = new Submission({ userId, problemId, code, language });
    }
    await submission.save();

    // Write latest code to file before sending
    const filePath = submission.filePath;
    fs.writeFileSync(filePath, code);

    // Send file to ML model
    const form = new FormData();
    const ext = filePath.slice(filePath.lastIndexOf('.'));
    form.append('file', fs.createReadStream(filePath), {
      filename: `submission${ext}`,
      contentType: 'text/plain'
    });
    form.append('language', language);

    console.log('Sending to ML model, file:', filePath);

    const mlResponse = await fetch('https://6f85-103-210-37-45.ngrok-free.app/analyze', {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders(),
        'ngrok-skip-browser-warning': 'true'
      }
    });

    console.log('ML response status:', mlResponse.status, mlResponse.statusText);

    if (!mlResponse.ok) {
      const errText = await mlResponse.text();
      console.error('ML error response:', errText);
      return res.json({ success: true, submission, analysis: { error: `ML model error: ${mlResponse.status} - ${errText}` } });
    }

    const mlResult = await mlResponse.json();
    console.log('Submission saved:', submission._id);
    res.json({ success: true, submission, analysis: mlResult });
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
