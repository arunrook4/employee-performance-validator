const express = require('express');
const { body, validationResult } = require('express-validator');
const Goal = require('../models/Goal');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Validation middleware
const validateGoal = [
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
  body('targetType').isIn(['quarterly', 'annual']).withMessage('Target type must be quarterly or annual'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('progress').optional().isNumeric().withMessage('Progress must be a number').isFloat({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  body('assignedEmployee').notEmpty().withMessage('Assigned employee is required').isMongoId().withMessage('Valid employee ID is required')
];

// Get all goals for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, targetType, status, employee, search } = req.query;
    
    let query = { user: req.user.id, isActive: true };
    
    if (targetType) {
      query.targetType = targetType;
    }
    
    if (employee) {
      query.assignedEmployee = employee;
    }
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    if (status) {
      // For status filtering, we'll need to handle it differently since it's a virtual
      // We'll filter after fetching for now
    }
    
    const goals = await Goal.find(query)
      .populate('assignedEmployee', 'firstName lastName employeeId department')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ dueDate: 1 });
    
    const total = await Goal.countDocuments(query);
    
    // Filter by status if provided
    let filteredGoals = goals;
    if (status) {
      filteredGoals = goals.filter(goal => goal.status === status);
    }
    
    res.json({
      goals: filteredGoals,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals', error: error.message });
  }
});

// Get single goal
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id, isActive: true })
      .populate('assignedEmployee', 'firstName lastName employeeId department');
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goal', error: error.message });
  }
});

// Create new goal
router.post('/', authenticateToken, validateGoal, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const goalData = {
      ...req.body,
      user: req.user.id
    };
    
    const goal = new Goal(goalData);
    await goal.save();
    
    // Populate the assignedEmployee field before sending response
    await goal.populate('assignedEmployee', 'firstName lastName employeeId department');
    
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error creating goal', error: error.message });
  }
});

// Update goal
router.put('/:id', authenticateToken, validateGoal, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id, isActive: true },
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedEmployee', 'firstName lastName employeeId department');
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal', error: error.message });
  }
});

// Update goal progress only
router.patch('/:id/progress', authenticateToken, [
  body('progress').isNumeric().withMessage('Progress must be a number').isFloat({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id, isActive: true },
      { progress: req.body.progress },
      { new: true, runValidators: true }
    ).populate('assignedEmployee', 'firstName lastName employeeId department');
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal progress', error: error.message });
  }
});

// Delete goal (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id, isActive: true },
      { isActive: false },
      { new: true }
    );
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting goal', error: error.message });
  }
});

// Get goals by target type
router.get('/type/:targetType', authenticateToken, async (req, res) => {
  try {
    const { targetType } = req.params;
    
    if (!['quarterly', 'annual'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid target type' });
    }
    
    const goals = await Goal.find({ 
      user: req.user.id,
      targetType,
      isActive: true 
    })
    .populate('assignedEmployee', 'firstName lastName employeeId department')
    .sort({ dueDate: 1 });
    
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals by type', error: error.message });
  }
});

// Get goals by employee
router.get('/employee/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const goals = await Goal.find({ 
      assignedEmployee: employeeId,
      isActive: true 
    })
    .populate('assignedEmployee', 'firstName lastName employeeId department')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ dueDate: 1 });
    
    const total = await Goal.countDocuments({ 
      assignedEmployee: employeeId,
      isActive: true 
    });
    
    res.json({
      goals,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals by employee', error: error.message });
  }
});

module.exports = router; 