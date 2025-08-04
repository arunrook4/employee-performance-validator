const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  targetType: {
    type: String,
    enum: ['quarterly', 'annual'],
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
goalSchema.index({ user: 1 });
goalSchema.index({ targetType: 1 });
goalSchema.index({ dueDate: 1 });
goalSchema.index({ isActive: 1 });
goalSchema.index({ assignedEmployee: 1 });

// Virtual for progress percentage
goalSchema.virtual('progressPercentage').get(function() {
  return `${this.progress}%`;
});

// Virtual for status based on due date and progress
goalSchema.virtual('status').get(function() {
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  
  if (this.progress >= 100) {
    return 'completed';
  } else if (dueDate < now) {
    return 'overdue';
  } else {
    return 'in-progress';
  }
});

// Ensure virtual fields are serialized
goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema); 