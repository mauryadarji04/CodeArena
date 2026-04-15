import express from 'express';
import { getAllProblems, getProblemById, getProblemByIdAdmin, createProblem, updateProblem, deleteProblem } from '../controllers/problemController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/problems', getAllProblems);
router.get('/problems/:id', getProblemById);
router.get('/admin/problems/:id', authenticateToken, requireAdmin, getProblemByIdAdmin);
router.post('/problems', authenticateToken, requireAdmin, createProblem);
router.put('/problems/:id', authenticateToken, requireAdmin, updateProblem);
router.delete('/problems/:id', authenticateToken, requireAdmin, deleteProblem);

export default router;
