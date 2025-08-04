const mongoose = require('mongoose');

const competencySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  skillName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technical', 'Soft Skills', 'Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Adaptability', 'Other'],
    default: 'Other'
  },
  currentLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 1
  },
  targetLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 3
  },
  assessmentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  nextReviewDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  evidence: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  developmentPlan: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['Developing', 'Proficient', 'Expert', 'Needs Improvement'],
    default: 'Developing'
  },
  assessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
competencySchema.index({ employee: 1 });
competencySchema.index({ category: 1 });
competencySchema.index({ status: 1 });
competencySchema.index({ assessmentDate: -1 });

// Virtual for competency gap
competencySchema.virtual('gap').get(function() {
  return this.targetLevel - this.currentLevel;
});

// Virtual for progress percentage
competencySchema.virtual('progressPercentage').get(function() {
  return Math.round((this.currentLevel / this.targetLevel) * 100);
});

// Ensure virtual fields are serialized
competencySchema.set('toJSON', { virtuals: true });
competencySchema.set('toObject', { virtuals: true });

// Pre-save middleware to set next review date if not provided
competencySchema.pre('save', function(next) {
  if (!this.nextReviewDate) {
    // Set next review date to 6 months from assessment date
    this.nextReviewDate = new Date(this.assessmentDate);
    this.nextReviewDate.setMonth(this.nextReviewDate.getMonth() + 6);
  }
  next();
});

module.exports = mongoose.model('Competency', competencySchema); 