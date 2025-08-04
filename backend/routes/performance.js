const express = require('express');
const { body, validationResult } = require('express-validator');
const Performance = require('../models/Performance');
const Employee = require('../models/Employee');
const router = express.Router();

// Validation middleware
const validatePerformance = [
  body('employee').isMongoId().withMessage('Valid employee ID is required'),
  body('evaluator').isMongoId().withMessage('Valid evaluator ID is required'),
  body('overallRating').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
  body('evaluationPeriod.startDate').isISO8601().withMessage('Valid start date is required'),
  body('evaluationPeriod.endDate').isISO8601().withMessage('Valid end date is required'),
  body('categories.technicalSkills.rating').isInt({ min: 1, max: 5 }).withMessage('Technical skills rating must be between 1 and 5'),
  body('categories.communication.rating').isInt({ min: 1, max: 5 }).withMessage('Communication rating must be between 1 and 5'),
  body('categories.teamwork.rating').isInt({ min: 1, max: 5 }).withMessage('Teamwork rating must be between 1 and 5'),
  body('categories.leadership.rating').isInt({ min: 1, max: 5 }).withMessage('Leadership rating must be between 1 and 5'),
  body('categories.productivity.rating').isInt({ min: 1, max: 5 }).withMessage('Productivity rating must be between 1 and 5'),
];

// Get all performance evaluations
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, employee, evaluator, status, search } = req.query;
    
    let query = {};
    
    if (employee) {
      query.employee = employee;
    }
    
    if (evaluator) {
      query.evaluator = evaluator;
    }
    
    if (status) {
      query.status = status;
    }
    
    const performances = await Performance.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .populate('evaluator', 'firstName lastName employeeId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ evaluationDate: -1 });
    
    const total = await Performance.countDocuments(query);
    
    // Filter by search term if provided (search in employee names)
    let filteredPerformances = performances;
    if (search) {
      filteredPerformances = performances.filter(performance => {
        const employeeName = `${performance.employee?.firstName || ''} ${performance.employee?.lastName || ''}`.toLowerCase();
        const evaluatorName = `${performance.evaluator?.firstName || ''} ${performance.evaluator?.lastName || ''}`.toLowerCase();
        const searchTerm = search.toLowerCase();
        return employeeName.includes(searchTerm) || evaluatorName.includes(searchTerm);
      });
    }
    
    res.json({
      performances: filteredPerformances,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching performance evaluations', error: error.message });
  }
});

// Get single performance evaluation
router.get('/:id', async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId department position')
      .populate('evaluator', 'firstName lastName employeeId');
    
    if (!performance) {
      return res.status(404).json({ message: 'Performance evaluation not found' });
    }
    
    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching performance evaluation', error: error.message });
  }
});

// Create new performance evaluation
router.post('/', validatePerformance, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Check if employee and evaluator exist
    const [employee, evaluator] = await Promise.all([
      Employee.findById(req.body.employee),
      Employee.findById(req.body.evaluator)
    ]);
    
    if (!employee || !evaluator) {
      return res.status(400).json({ message: 'Employee or evaluator not found' });
    }
    
    // Check if evaluation period dates are valid
    const startDate = new Date(req.body.evaluationPeriod.startDate);
    const endDate = new Date(req.body.evaluationPeriod.endDate);
    
    if (startDate >= endDate) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }
    
    const performance = new Performance(req.body);
    await performance.save();
    
    const populatedPerformance = await Performance.findById(performance._id)
      .populate('employee', 'firstName lastName employeeId department')
      .populate('evaluator', 'firstName lastName employeeId');
    
    res.status(201).json(populatedPerformance);
  } catch (error) {
    res.status(500).json({ message: 'Error creating performance evaluation', error: error.message });
  }
});

// Update performance evaluation
router.put('/:id', validatePerformance, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const performance = await Performance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('employee', 'firstName lastName employeeId department')
     .populate('evaluator', 'firstName lastName employeeId');
    
    if (!performance) {
      return res.status(404).json({ message: 'Performance evaluation not found' });
    }
    
    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: 'Error updating performance evaluation', error: error.message });
  }
});

// Delete performance evaluation
router.delete('/:id', async (req, res) => {
  try {
    const performance = await Performance.findByIdAndDelete(req.params.id);
    
    if (!performance) {
      return res.status(404).json({ message: 'Performance evaluation not found' });
    }
    
    res.json({ message: 'Performance evaluation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting performance evaluation', error: error.message });
  }
});

// Get performance evaluations by employee
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const performances = await Performance.find({ employee: req.params.employeeId })
      .populate('evaluator', 'firstName lastName employeeId')
      .sort({ evaluationDate: -1 });
    
    res.json(performances);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee performance evaluations', error: error.message });
  }
});

// Get performance evaluations by evaluator
router.get('/evaluator/:evaluatorId', async (req, res) => {
  try {
    const performances = await Performance.find({ evaluator: req.params.evaluatorId })
      .populate('employee', 'firstName lastName employeeId department')
      .sort({ evaluationDate: -1 });
    
    res.json(performances);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching evaluator performance evaluations', error: error.message });
  }
});

// Update performance evaluation status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['draft', 'submitted', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const performance = await Performance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('employee', 'firstName lastName employeeId department')
     .populate('evaluator', 'firstName lastName employeeId');
    
    if (!performance) {
      return res.status(404).json({ message: 'Performance evaluation not found' });
    }
    
    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: 'Error updating performance evaluation status', error: error.message });
  }
});

module.exports = router; 