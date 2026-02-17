import express from 'express';
import { getAllProblems, getProblemById, createProblem } from '../controllers/problemController.js';

const router = express.Router();

router.get('/problems', getAllProblems);
router.get('/problems/:id', getProblemById);
router.post('/problems', createProblem);

export default router;
