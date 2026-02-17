import Problem from '../models/Problem.js';

export const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find().select('problemNumber title difficulty tags').sort({ problemNumber: 1 });
    res.json({ success: true, problems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.json({ success: true, problem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProblem = async (req, res) => {
  try {
    const problem = await Problem.create(req.body);
    res.status(201).json({ success: true, problem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
