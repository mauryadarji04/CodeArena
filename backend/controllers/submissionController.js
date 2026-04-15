import Submission from '../models/Submission.js';
import SubmissionRecord from '../models/SubmissionRecord.js';
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
    const { userId, problemId, code, language, type = 'submit' } = req.body;

    if (!userId || !problemId || !code || !language) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // For 'run': only sample test cases. For 'submit': all test cases
    const allTestCases = type === 'run'
      ? (problem.sampleTestCases || []).map(tc => ({ input: tc.input, expectedOutput: tc.output, isHidden: false }))
      : [
          ...(problem.sampleTestCases || []).map(tc => ({ input: tc.input, expectedOutput: tc.output, isHidden: false })),
          ...(problem.hiddenTestCases  || []).map(tc => ({ input: tc.input, expectedOutput: tc.output, isHidden: true }))
        ];

    // Upsert old Submission (file storage only)
    let submission = await Submission.findOne({ userId, problemId });
    if (submission) {
      submission.code = code;
      submission.language = language;
    } else {
      submission = new Submission({ userId, problemId, code, language });
    }
    await submission.save();
    console.log(`[${type.toUpperCase()}] File saved: ${submission.filePath}`);

    const mlUrl = process.env.ML_MODEL_URL;
    if (!mlUrl || mlUrl.includes('your-ngrok-url')) {
      return res.json({ success: true, submission, analysis: { error: 'ML_MODEL_URL not configured in .env' } });
    }

    console.log(`[${type.toUpperCase()}] Sending to model: ${mlUrl}`);
    console.log(`[${type.toUpperCase()}] userId: ${userId} | problemId: ${problemId} | language: ${language}`);
    console.log(`[${type.toUpperCase()}] Test cases: ${allTestCases.length} | trapKeywords: [${(problem.trapKeywords || []).join(', ')}]`);

    const form = new FormData();
    const fileExt = submission.filePath.slice(submission.filePath.lastIndexOf('.'));
    form.append('file', fs.createReadStream(submission.filePath), {
      filename: `submission${fileExt}`,
      contentType: 'text/plain'
    });
    form.append('test_cases',    JSON.stringify(allTestCases),              { contentType: 'application/json' });

    const trapKeywordsStr = JSON.stringify((problem.trapKeywords || []).map(k => ({ variable: k })));
    console.log(`[${type.toUpperCase()}] trap_keywords being sent:`, trapKeywordsStr);
    form.append('trap_keywords', trapKeywordsStr, { contentType: 'application/json' });
    form.append('language',      language,                                  { contentType: 'text/plain' });

    try {
      const mlResponse = await fetch(mlUrl, {
        method: 'POST',
        body: form,
        headers: { ...form.getHeaders(), 'ngrok-skip-browser-warning': 'true' }
      });

      if (!mlResponse.ok) {
        const errText = await mlResponse.text();
        return res.json({ success: true, submission, analysis: { error: `ML model error: ${mlResponse.status} - ${errText}` } });
      }

      const mlResult = await mlResponse.json();
      console.log(`[${type.toUpperCase()}] Model response received | status: ${mlResult.status} | ai_detected: ${mlResult.ai_detected ?? 'none'}`);
      console.log(`[${type.toUpperCase()}] Full model response:`, JSON.stringify(mlResult, null, 2));
      console.log(`[${type.toUpperCase()}] Test cases sent:`, JSON.stringify(allTestCases, null, 2));
      console.log(`[${type.toUpperCase()}] File path sent: ${submission.filePath}`);
      console.log(`[${type.toUpperCase()}] Language sent: ${language}`);
      console.log(`[${type.toUpperCase()}] trapKeywords sent: ${trapKeywordsStr}`);

      // Normalize testcasepassed object → array
      const testCasePassed = mlResult.testcasepassed || {};
      const normalize = s => String(s ?? '').replace(/\s+/g, '').toLowerCase();
      const testResultsArr = Object.entries(testCasePassed).map(([key, val], i) => {
        const statusPassed = val?.status === 'passed';
        const comparePassed = normalize(val?.actual) === normalize(val?.expected);
        const passed = statusPassed || comparePassed;
        return {
          label:    key,
          passed,
          expected: val?.expected,
          actual:   val?.actual,
          error:    val?.error,
          isHidden: allTestCases[i]?.isHidden ?? false
        };
      });

      // Build and save SubmissionRecord
      const record = new SubmissionRecord({ userId, problemId, language, type });

      if (testResultsArr.length > 0) {
        record.testResults = testResultsArr;
        record.totalPassed = testResultsArr.filter(r => r.passed).length;
        record.totalTests  = testResultsArr.length;
        record.mlAnalysis  = mlResult;
        record.status = (type === 'submit' && record.totalPassed === record.totalTests)
          ? 'accepted'
          : 'wrong_answer';
      }
      await record.save();
      console.log(`[${type.toUpperCase()}] SubmissionRecord saved | status: ${record.status} | passed: ${record.totalPassed}/${record.totalTests}`);

      // Save plagiarism from ai_detected field
      const aiDetected  = mlResult.ai_detected ?? 0;
      const plagVerdict = aiDetected === 1 ? 'flagged' : 'clean';
      const plagiarismData = {
        checked:         true,
        score:           aiDetected * 100,
        verdict:         plagVerdict,
        detectedSignals: aiDetected === 1 ? ['ai_pattern_detected'] : [],
        matchedKeywords: [],
        checkedAt:       new Date()
      };
      submission.plagiarism = plagiarismData;
      submission.markModified('plagiarism');
      await submission.save();
      console.log(`[${type.toUpperCase()}] Plagiarism saved | verdict: ${plagVerdict} | ai_detected: ${aiDetected}`);

      res.json({
        success:    true,
        submission,
        record,
        analysis: {
          ...mlResult,
          test_results: testResultsArr
        },
        plagiarism: plagiarismData
      });
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

// --- Analytics ---

// GET /api/analytics/user/:userId  → problems solved count + list
export const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;

    const solvedProblemIds = await SubmissionRecord.find({ userId, status: 'accepted', type: 'submit' })
      .distinct('problemId');

    res.json({
      success: true,
      solvedCount: solvedProblemIds.length,
      solvedProblems: solvedProblemIds
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/problem/:problemId  → users who solved count + list
export const getProblemAnalytics = async (req, res) => {
  try {
    const { problemId } = req.params;

    const solvedByUserIds = await SubmissionRecord.find({ problemId, status: 'accepted', type: 'submit' })
      .distinct('userId');

    res.json({
      success: true,
      solvedByCount: solvedByUserIds.length,
      solvedByUsers: solvedByUserIds
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
