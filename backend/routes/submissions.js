import express from 'express';
import { saveSubmission, getSubmission } from '../controllers/submissionController.js';

const router = express.Router();

router.post('/submissions', saveSubmission);
router.get('/submissions', getSubmission);

export default router;
