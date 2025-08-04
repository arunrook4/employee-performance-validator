const express = require('express');
const router = express.Router();
const Competency = require('../models/Competency');
const Employee = require('../models/Employee');
const { authenticateToken } = require('../middleware/auth');

// Get all competencies with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      employee,
      category,
      status,
      search,
      sortBy = 'assessmentDate',
      sortOrder = 'desc'
    } = req.query;

    const query = { isActive: true };

    // Filter by employee
    if (employee) {
      query.employee = employee;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { skillName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const competencies = await Competency.find(query)
      .populate('employee', 'firstName lastName employeeId department position')
      .populate('assessedBy', 'firstName lastName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Competency.countDocuments(query);

    res.json({
      competencies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching competencies:', error);
    res.status(500).json({ message: 'Error fetching competencies' });
  }
});

// Get competencies for a specific employee
router.get('/employee/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { category, status } = req.query;

    const query = { 
      employee: employeeId,
      isActive: true 
    };

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    const competencies = await Competency.find(query)
      .populate('assessedBy', 'firstName lastName')
      .sort({ assessmentDate: -1 });

    // Calculate summary statistics
    const totalSkills = competencies.length;
    const averageCurrentLevel = totalSkills > 0 
      ? competencies.reduce((sum, comp) => sum + comp.currentLevel, 0) / totalSkills 
      : 0;
    const averageTargetLevel = totalSkills > 0 
      ? competencies.reduce((sum, comp) => sum + comp.targetLevel, 0) / totalSkills 
      : 0;
    const skillsNeedingImprovement = competencies.filter(comp => comp.currentLevel < comp.targetLevel).length;

    res.json({
      competencies,
      summary: {
        totalSkills,
        averageCurrentLevel: Math.round(averageCurrentLevel * 10) / 10,
        averageTargetLevel: Math.round(averageTargetLevel * 10) / 10,
        skillsNeedingImprovement,
        overallProgress: totalSkills > 0 
          ? Math.round((averageCurrentLevel / averageTargetLevel) * 100)
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching employee competencies:', error);
    res.status(500).json({ message: 'Error fetching employee competencies' });
  }
});

// Get a single competency by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const competency = await Competency.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId department position email')
      .populate('assessedBy', 'firstName lastName email');

    if (!competency) {
      return res.status(404).json({ message: 'Competency not found' });
    }

    res.json(competency);
  } catch (error) {
    console.error('Error fetching competency:', error);
    res.status(500).json({ message: 'Error fetching competency' });
  }
});

// Create a new competency
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      employee,
      skillName,
      category,
      currentLevel,
      targetLevel,
      assessmentDate,
      nextReviewDate,
      description,
      evidence,
      developmentPlan,
      status
    } = req.body;

    // Validate employee exists
    const employeeExists = await Employee.findById(employee);
    if (!employeeExists) {
      return res.status(400).json({ message: 'Employee not found' });
    }

    const competency = new Competency({
      employee,
      skillName,
      category,
      currentLevel,
      targetLevel,
      assessmentDate: assessmentDate || new Date(),
      nextReviewDate,
      description,
      evidence,
      developmentPlan,
      status,
      assessedBy: req.user.id
    });

    const savedCompetency = await competency.save();
    const populatedCompetency = await Competency.findById(savedCompetency._id)
      .populate('employee', 'firstName lastName employeeId department position')
      .populate('assessedBy', 'firstName lastName');

    res.status(201).json(populatedCompetency);
  } catch (error) {
    console.error('Error creating competency:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating competency' });
  }
});

// Update a competency
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      skillName,
      category,
      currentLevel,
      targetLevel,
      assessmentDate,
      nextReviewDate,
      description,
      evidence,
      developmentPlan,
      status
    } = req.body;

    const competency = await Competency.findById(req.params.id);
    if (!competency) {
      return res.status(404).json({ message: 'Competency not found' });
    }

    // Update fields
    if (skillName !== undefined) competency.skillName = skillName;
    if (category !== undefined) competency.category = category;
    if (currentLevel !== undefined) competency.currentLevel = currentLevel;
    if (targetLevel !== undefined) competency.targetLevel = targetLevel;
    if (assessmentDate !== undefined) competency.assessmentDate = assessmentDate;
    if (nextReviewDate !== undefined) competency.nextReviewDate = nextReviewDate;
    if (description !== undefined) competency.description = description;
    if (evidence !== undefined) competency.evidence = evidence;
    if (developmentPlan !== undefined) competency.developmentPlan = developmentPlan;
    if (status !== undefined) competency.status = status;

    const updatedCompetency = await competency.save();
    const populatedCompetency = await Competency.findById(updatedCompetency._id)
      .populate('employee', 'firstName lastName employeeId department position')
      .populate('assessedBy', 'firstName lastName');

    res.json(populatedCompetency);
  } catch (error) {
    console.error('Error updating competency:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating competency' });
  }
});

// Delete a competency (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const competency = await Competency.findById(req.params.id);
    if (!competency) {
      return res.status(404).json({ message: 'Competency not found' });
    }

    competency.isActive = false;
    await competency.save();

    res.json({ message: 'Competency deleted successfully' });
  } catch (error) {
    console.error('Error deleting competency:', error);
    res.status(500).json({ message: 'Error deleting competency' });
  }
});

// Get competency statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const { employee, department } = req.query;
    
    let matchQuery = { isActive: true };
    
    if (employee) {
      matchQuery.employee = employee;
    } else if (department) {
      // Get employees in the department first
      const employees = await Employee.find({ department });
      const employeeIds = employees.map(emp => emp._id);
      matchQuery.employee = { $in: employeeIds };
    }

    const stats = await Competency.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeData'
        }
      },
      {
        $group: {
          _id: null,
          totalCompetencies: { $sum: 1 },
          averageCurrentLevel: { $avg: '$currentLevel' },
          averageTargetLevel: { $avg: '$targetLevel' },
          skillsNeedingImprovement: {
            $sum: { $cond: [{ $lt: ['$currentLevel', '$targetLevel'] }, 1, 0] }
          },
          categoryBreakdown: {
            $push: '$category'
          },
          statusBreakdown: {
            $push: '$status'
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        totalCompetencies: 0,
        averageCurrentLevel: 0,
        averageTargetLevel: 0,
        skillsNeedingImprovement: 0,
        overallProgress: 0,
        categoryBreakdown: {},
        statusBreakdown: {}
      });
    }

    const stat = stats[0];
    const categoryCount = stat.categoryBreakdown.reduce((acc, category) => {
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const statusCount = stat.statusBreakdown.reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalCompetencies: stat.totalCompetencies,
      averageCurrentLevel: Math.round(stat.averageCurrentLevel * 10) / 10,
      averageTargetLevel: Math.round(stat.averageTargetLevel * 10) / 10,
      skillsNeedingImprovement: stat.skillsNeedingImprovement,
      overallProgress: Math.round((stat.averageCurrentLevel / stat.averageTargetLevel) * 100),
      categoryBreakdown: categoryCount,
      statusBreakdown: statusCount
    });
  } catch (error) {
    console.error('Error fetching competency statistics:', error);
    res.status(500).json({ message: 'Error fetching competency statistics' });
  }
});

module.exports = router; 