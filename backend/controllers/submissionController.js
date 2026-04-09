import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUBMISSIONS_DIR = path.join(__dirname, '..', 'submissions');

if (!fs.existsSync(SUBMISSIONS_DIR)) fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });

export const saveSubmission = async (req, res) => {
  try {
    const { userId, problemId, code, language } = req.body;

    if (!userId || !problemId || !code || !language) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Fetch problem to get sample + hidden test cases
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const allTestCases = [
      ...(problem.sampleTestCases || []).map(tc => ({ input: tc.input, expectedOutput: tc.output, isHidden: false })),
      ...(problem.hiddenTestCases || []).map(tc => ({ input: tc.input, expectedOutput: tc.output, isHidden: true }))
    ];

    // Upsert submission (pre-save hook writes the code file)
    let submission = await Submission.findOne({ userId, problemId });
    if (submission) {
      submission.code = code;
      submission.language = language;
    } else {
      submission = new Submission({ userId, problemId, code, language });
    }
    await submission.save();

    const mlUrl = process.env.ML_MODEL_URL;
    if (!mlUrl || mlUrl.includes('your-ngrok-url')) {
      return res.json({ success: true, submission, analysis: { error: 'ML_MODEL_URL not configured in .env' } });
    }

    // Build multipart form: code file (same as before) + test cases JSON
    const form = new FormData();
    const fileExt = submission.filePath.slice(submission.filePath.lastIndexOf('.'));
    form.append('file', fs.createReadStream(submission.filePath), {
      filename: `submission${fileExt}`,
      contentType: 'text/plain'
    });
    form.append('test_cases', JSON.stringify(allTestCases), {
      contentType: 'application/json'
    });

    console.log(`Sending to ML: file=${submission.filePath}, testCases=${allTestCases.length}`);

    try {
      const mlResponse = await fetch(mlUrl, {
        method: 'POST',
        body: form,
        headers: { ...form.getHeaders(), 'ngrok-skip-browser-warning': 'true' }
      });

      if (!mlResponse.ok) {
        const errText = await mlResponse.text();
        console.error('ML error:', errText);
        return res.json({ success: true, submission, analysis: { error: `ML model error: ${mlResponse.status} - ${errText}` } });
      }

      const mlResult = await mlResponse.json();

      // Persist test results if ML returns them
      if (Array.isArray(mlResult.test_results)) {
        submission.testResults = mlResult.test_results.map((r, i) => ({
          input:          allTestCases[i]?.input,
          expectedOutput: allTestCases[i]?.expectedOutput,
          passed:         r.passed,
          isHidden:       allTestCases[i]?.isHidden
        }));
        submission.totalPassed = submission.testResults.filter(r => r.passed).length;
        submission.totalTests  = submission.testResults.length;
        submission.mlAnalysis  = mlResult;
        await submission.save();
      }

      res.json({ success: true, submission, analysis: mlResult });
    } catch (mlError) {
      console.error('ML fetch error:', mlError.message);
      res.json({ success: true, submission, analysis: { error: `ML unreachable: ${mlError.message}` } });
    }
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
