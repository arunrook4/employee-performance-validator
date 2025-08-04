const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  evaluator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  evaluationPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  evaluationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  categories: {
    technicalSkills: {
      rating: { type: Number, min: 1, max: 5, required: true },
      comments: { type: String, trim: true }
    },
    communication: {
      rating: { type: Number, min: 1, max: 5, required: true },
      comments: { type: String, trim: true }
    },
    teamwork: {
      rating: { type: Number, min: 1, max: 5, required: true },
      comments: { type: String, trim: true }
    },
    leadership: {
      rating: { type: Number, min: 1, max: 5, required: true },
      comments: { type: String, trim: true }
    },
    productivity: {
      rating: { type: Number, min: 1, max: 5, required: true },
      comments: { type: String, trim: true }
    }
  },
  strengths: [{
    type: String,
    trim: true
  }],
  areasForImprovement: [{
    type: String,
    trim: true
  }],
  goals: [{
    description: { type: String, required: true, trim: true },
    targetDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' }
  }],
  comments: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Index for better query performance
performanceSchema.index({ employee: 1, evaluationDate: -1 });
performanceSchema.index({ evaluator: 1 });
performanceSchema.index({ status: 1 });

// Virtual for average category rating
performanceSchema.virtual('averageCategoryRating').get(function() {
  const categories = this.categories;
  const ratings = [
    categories.technicalSkills.rating,
    categories.communication.rating,
    categories.teamwork.rating,
    categories.leadership.rating,
    categories.productivity.rating
  ];
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Ensure virtual fields are serialized
performanceSchema.set('toJSON', { virtuals: true });
performanceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Performance', performanceSchema); 