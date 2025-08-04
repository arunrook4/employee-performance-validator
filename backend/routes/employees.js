const express = require('express');
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const router = express.Router();

// Validation middleware
const validateEmployee = [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('salary').isNumeric().withMessage('Salary must be a number'),
];

// Get all employees
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, department, search } = req.query;
    
    let query = { isActive: true };
    
    if (department) {
      query.department = department;
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        // Search for full name (firstName + lastName)
        { $expr: { $regexMatch: { input: { $concat: ["$firstName", " ", "$lastName"] }, regex: search, options: "i" } } }
      ];
    }
    
    const employees = await Employee.find(query)
      .populate('manager', 'firstName lastName employeeId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Employee.countDocuments(query);
    
    res.json({
      employees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
});

// Get single employee
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('manager', 'firstName lastName employeeId');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee', error: error.message });
  }
});

// Create new employee
router.post('/', validateEmployee, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Check if employee ID or email already exists
    const existingEmployee = await Employee.findOne({
      $or: [
        { employeeId: req.body.employeeId },
        { email: req.body.email }
      ]
    });
    
    if (existingEmployee) {
      return res.status(400).json({ 
        message: 'Employee with this ID or email already exists' 
      });
    }
    
    const employee = new Employee(req.body);
    await employee.save();
    
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error creating employee', error: error.message });
  }
});

// Update employee
router.put('/:id', validateEmployee, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error updating employee', error: error.message });
  }
});

// Delete employee (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee', error: error.message });
  }
});

// Get employees by department
router.get('/department/:department', async (req, res) => {
  try {
    const employees = await Employee.find({ 
      department: req.params.department,
      isActive: true 
    }).populate('manager', 'firstName lastName employeeId');
    
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees by department', error: error.message });
  }
});

module.exports = router; 