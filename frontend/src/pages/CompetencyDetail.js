import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ArrowLeft, 
  Edit, 
  User, 
  Brain, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { competenciesAPI } from '../services/api';

const CompetencyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: competency, isLoading, error } = useQuery(
    ['competency', id],
    () => competenciesAPI.getById(id)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Competency</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!competency) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Competency Not Found</h2>
          <p className="text-gray-600">The competency you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Expert': return 'bg-green-100 text-green-800';
      case 'Proficient': return 'bg-blue-100 text-blue-800';
      case 'Developing': return 'bg-yellow-100 text-yellow-800';
      case 'Needs Improvement': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Technical': return 'bg-purple-100 text-purple-800';
      case 'Soft Skills': return 'bg-pink-100 text-pink-800';
      case 'Leadership': return 'bg-indigo-100 text-indigo-800';
      case 'Communication': return 'bg-cyan-100 text-cyan-800';
      case 'Problem Solving': return 'bg-orange-100 text-orange-800';
      case 'Teamwork': return 'bg-teal-100 text-teal-800';
      case 'Adaptability': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (current, target) => {
    const percentage = (current / target) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLevelDescription = (level) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Basic';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  const isOverdue = new Date(competency.nextReviewDate) < new Date();
  const daysUntilReview = Math.ceil((new Date(competency.nextReviewDate) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/competencies')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Competency Details</h1>
            <p className="text-gray-600">Skill assessment for {competency.employee?.firstName} {competency.employee?.lastName}</p>
          </div>
        </div>
        <Link
          to={`/competencies/${id}/edit`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Link>
      </div>

      {/* Employee Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {competency.employee?.firstName} {competency.employee?.lastName}
            </h2>
            <p className="text-gray-600">
              {competency.employee?.employeeId} • {competency.employee?.position} • {competency.employee?.department}
            </p>
            <p className="text-sm text-gray-500">{competency.employee?.email}</p>
          </div>
        </div>
      </div>

      {/* Skill Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{competency.skillName}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(competency.category)}`}>
                {competency.category}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(competency.status)}`}>
                {competency.status}
              </span>
            </div>
          </div>
        </div>

        {/* Skill Levels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Current Level</span>
              <span className={`text-lg font-bold ${getLevelColor(competency.currentLevel, competency.targetLevel)}`}>
                {competency.currentLevel}/5
              </span>
            </div>
            <p className="text-sm text-gray-600">{getLevelDescription(competency.currentLevel)}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Target Level</span>
              <span className="text-lg font-bold text-gray-900">{competency.targetLevel}/5</span>
            </div>
            <p className="text-sm text-gray-600">{getLevelDescription(competency.targetLevel)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">
              {Math.round((competency.currentLevel / competency.targetLevel) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(competency.currentLevel / competency.targetLevel) * 100}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Gap to target: {competency.targetLevel - competency.currentLevel} levels
          </p>
        </div>

        {/* Description */}
        {competency.description && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-900">{competency.description}</p>
          </div>
        )}
      </div>

      {/* Assessment Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Assessment Details</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Assessment Date</p>
              <p className="text-gray-900">{new Date(competency.assessmentDate).toLocaleDateString()}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">Next Review Date</p>
              <div className="flex items-center space-x-2">
                <p className="text-gray-900">{new Date(competency.nextReviewDate).toLocaleDateString()}</p>
                {isOverdue ? (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Overdue
                  </span>
                ) : daysUntilReview <= 30 ? (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Due Soon
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    On Track
                  </span>
                )}
              </div>
              {!isOverdue && (
                <p className="text-sm text-gray-500">
                  {daysUntilReview > 0 ? `${daysUntilReview} days remaining` : 'Due today'}
                </p>
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">Assessed By</p>
              <p className="text-gray-900">{competency.assessedBy?.firstName} {competency.assessedBy?.lastName}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Development</h3>
          </div>
          
          <div className="space-y-3">
            {competency.evidence && (
              <div>
                <p className="text-sm font-medium text-gray-700">Evidence</p>
                <p className="text-gray-900 text-sm">{competency.evidence}</p>
              </div>
            )}
            
            {competency.developmentPlan && (
              <div>
                <p className="text-sm font-medium text-gray-700">Development Plan</p>
                <p className="text-gray-900 text-sm">{competency.developmentPlan}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium text-gray-700">Status</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(competency.status)}`}>
                {competency.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/competencies/${id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Assessment
          </Link>
          
          <Link
            to={`/employees/${competency.employee?._id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <User className="w-4 h-4 mr-2" />
            View Employee Profile
          </Link>
          
          <Link
            to={`/competencies/employee/${competency.employee?._id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Brain className="w-4 h-4 mr-2" />
            View All Skills
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompetencyDetail; 