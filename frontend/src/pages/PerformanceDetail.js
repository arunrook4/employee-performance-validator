import React from 'react';
import { useQuery } from 'react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, BarChart3, Star, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import { performanceAPI } from '../services/api';

const PerformanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: performance, isLoading, error } = useQuery(
    ['performance', id],
    () => performanceAPI.getById(id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading performance evaluation: {error.message}</p>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Performance evaluation not found</p>
      </div>
    );
  }

  const perf = performance;

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingLabel = (rating) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Below Average';
      case 3: return 'Average';
      case 4: return 'Above Average';
      case 5: return 'Excellent';
      default: return 'Not Rated';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/performance')}
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Performance Evaluation
            </h1>
            <p className="mt-2 text-gray-600">
              {perf.employee?.firstName} {perf.employee?.lastName} - {perf.employee?.department}
            </p>
          </div>
        </div>
        <Link
          to={`/performance/${id}/edit`}
          className="btn-primary inline-flex items-center"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Evaluation
        </Link>
      </div>

      {/* Evaluation Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Evaluation Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Employee</p>
                    <p className="text-gray-900">
                      {perf.employee?.firstName} {perf.employee?.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Evaluator</p>
                    <p className="text-gray-900">
                      {perf.evaluator?.firstName} {perf.evaluator?.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Evaluation Date</p>
                    <p className="text-gray-900">
                      {new Date(perf.evaluationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Overall Rating</p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${getRatingColor(perf.overallRating)}`}>
                        {perf.overallRating}/5
                      </span>
                      <span className="text-sm text-gray-600">
                        ({getRatingLabel(perf.overallRating)})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(perf.status)}`}>
                      {perf.status.charAt(0).toUpperCase() + perf.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Evaluation Period</p>
                    <p className="text-gray-900">
                      {new Date(perf.evaluationPeriod.startDate).toLocaleDateString()} - {new Date(perf.evaluationPeriod.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div>
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p className="text-gray-900">
                  {new Date(perf.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-gray-900">
                  {new Date(perf.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Average Category Rating</p>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-bold ${getRatingColor(perf.averageCategoryRating)}`}>
                    {perf.averageCategoryRating?.toFixed(1)}/5
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Ratings */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Ratings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(perf.categories).map(([category, data]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div className="flex items-center space-x-2">
                  <Star className={`w-4 h-4 ${getRatingColor(data.rating)}`} />
                  <span className={`font-bold ${getRatingColor(data.rating)}`}>
                    {data.rating}/5
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-600">
                  {getRatingLabel(data.rating)}
                </span>
              </div>
              {data.comments && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Comments:</span> {data.comments}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      {(perf.strengths?.length > 0 || perf.areasForImprovement?.length > 0 || perf.comments) && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Information</h2>
          
          {perf.strengths?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                Strengths
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {perf.strengths.map((strength, index) => (
                  <li key={index} className="text-gray-700">{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {perf.areasForImprovement?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                Areas for Improvement
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {perf.areasForImprovement.map((area, index) => (
                  <li key={index} className="text-gray-700">{area}</li>
                ))}
              </ul>
            </div>
          )}

          {perf.comments && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Comments</h3>
              <p className="text-gray-700">{perf.comments}</p>
            </div>
          )}
        </div>
      )}

      {/* Goals Section */}
      {perf.goals?.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Goals</h2>
          <div className="space-y-4">
            {perf.goals.map((goal, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Goal {index + 1}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                    goal.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{goal.description}</p>
                <p className="text-sm text-gray-500">
                  Target Date: {new Date(goal.targetDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDetail; 