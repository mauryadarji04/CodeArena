import express from 'express';
import { saveSubmission, getSubmission, getUserAnalytics, getProblemAnalytics } from '../controllers/submissionController.js';

const router = express.Router();

router.post('/submissions', saveSubmission);
router.get('/submissions', getSubmission);

// Analytics
router.get('/analytics/user/:userId', getUserAnalytics);
router.get('/analytics/problem/:problemId', getProblemAnalytics);

export default router;
