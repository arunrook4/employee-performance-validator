import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Brain, 
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { competenciesAPI, employeeAPI } from '../services/api';

const CompetencyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    employee: '',
    skillName: '',
    category: 'Technical',
    currentLevel: 1,
    targetLevel: 3,
    assessmentDate: new Date().toISOString().split('T')[0],
    nextReviewDate: '',
    description: '',
    evidence: '',
    developmentPlan: '',
    status: 'Developing'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch employees for dropdown
  const { data: employeesData } = useQuery(
    ['employees'],
    () => employeeAPI.getAll({ limit: 1000 }),
    { staleTime: 300000 } // 5 minutes
  );

  // Fetch competency data if editing
  const { data: competencyData, isLoading: isLoadingCompetency } = useQuery(
    ['competency', id],
    () => competenciesAPI.getById(id),
    { 
      enabled: isEditing,
      onSuccess: (data) => {
        if (data) {
          setFormData({
            employee: data.employee._id,
            skillName: data.skillName,
            category: data.category,
            currentLevel: data.currentLevel,
            targetLevel: data.targetLevel,
            assessmentDate: new Date(data.assessmentDate).toISOString().split('T')[0],
            nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate).toISOString().split('T')[0] : '',
            description: data.description || '',
            evidence: data.evidence || '',
            developmentPlan: data.developmentPlan || '',
            status: data.status
          });
        }
      }
    }
  );

  // Create/Update mutation
  const mutation = useMutation(
    (data) => isEditing ? competenciesAPI.update(id, data) : competenciesAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['competencies']);
        queryClient.invalidateQueries(['competency-stats']);
        navigate('/competencies');
      },
      onError: (error) => {
        if (error.response?.data?.message) {
          setErrors({ general: error.response.data.message });
        }
        setIsSubmitting(false);
      }
    }
  );

  useEffect(() => {
    // Set default next review date to 6 months from assessment date
    if (formData.assessmentDate && !formData.nextReviewDate) {
      const assessmentDate = new Date(formData.assessmentDate);
      const nextReviewDate = new Date(assessmentDate);
      nextReviewDate.setMonth(nextReviewDate.getMonth() + 6);
      setFormData(prev => ({
        ...prev,
        nextReviewDate: nextReviewDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.assessmentDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employee) {
      newErrors.employee = 'Employee is required';
    }
    if (!formData.skillName.trim()) {
      newErrors.skillName = 'Skill name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (formData.currentLevel < 1 || formData.currentLevel > 5) {
      newErrors.currentLevel = 'Current level must be between 1 and 5';
    }
    if (formData.targetLevel < 1 || formData.targetLevel > 5) {
      newErrors.targetLevel = 'Target level must be between 1 and 5';
    }
    if (formData.currentLevel > formData.targetLevel) {
      newErrors.targetLevel = 'Target level must be greater than or equal to current level';
    }
    if (!formData.assessmentDate) {
      newErrors.assessmentDate = 'Assessment date is required';
    }
    if (!formData.nextReviewDate) {
      newErrors.nextReviewDate = 'Next review date is required';
    }
    if (new Date(formData.nextReviewDate) <= new Date(formData.assessmentDate)) {
      newErrors.nextReviewDate = 'Next review date must be after assessment date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const submitData = {
      ...formData,
      assessmentDate: new Date(formData.assessmentDate).toISOString(),
      nextReviewDate: new Date(formData.nextReviewDate).toISOString()
    };

    mutation.mutate(submitData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Expert': return 'text-green-600';
      case 'Proficient': return 'text-blue-600';
      case 'Developing': return 'text-yellow-600';
      case 'Needs Improvement': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoadingCompetency) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Competency' : 'Add New Competency'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update employee skill assessment' : 'Create a new skill assessment for an employee'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{errors.general}</p>
              </div>
            </div>
          </div>
        )}

        {/* Employee Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Employee *
          </label>
          <select
            name="employee"
            value={formData.employee}
            onChange={handleInputChange}
            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.employee ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isEditing}
          >
            <option value="">Select an employee</option>
            {employeesData?.employees?.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.firstName} {employee.lastName} - {employee.employeeId} ({employee.department})
              </option>
            ))}
          </select>
          {errors.employee && (
            <p className="mt-1 text-sm text-red-600">{errors.employee}</p>
          )}
        </div>

        {/* Skill Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Brain className="w-4 h-4 inline mr-2" />
              Skill Name *
            </label>
            <input
              type="text"
              name="skillName"
              value={formData.skillName}
              onChange={handleInputChange}
              placeholder="e.g., JavaScript, Leadership, Communication"
              className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.skillName ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.skillName && (
              <p className="mt-1 text-sm text-red-600">{errors.skillName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.category ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="Technical">Technical</option>
              <option value="Soft Skills">Soft Skills</option>
              <option value="Leadership">Leadership</option>
              <option value="Communication">Communication</option>
              <option value="Problem Solving">Problem Solving</option>
              <option value="Teamwork">Teamwork</option>
              <option value="Adaptability">Adaptability</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Skill Levels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Level (1-5) *
            </label>
            <select
              name="currentLevel"
              value={formData.currentLevel}
              onChange={handleInputChange}
              className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.currentLevel ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value={1}>1 - Beginner</option>
              <option value={2}>2 - Basic</option>
              <option value={3}>3 - Intermediate</option>
              <option value={4}>4 - Advanced</option>
              <option value={5}>5 - Expert</option>
            </select>
            {errors.currentLevel && (
              <p className="mt-1 text-sm text-red-600">{errors.currentLevel}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Level (1-5) *
            </label>
            <select
              name="targetLevel"
              value={formData.targetLevel}
              onChange={handleInputChange}
              className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.targetLevel ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value={1}>1 - Beginner</option>
              <option value={2}>2 - Basic</option>
              <option value={3}>3 - Intermediate</option>
              <option value={4}>4 - Advanced</option>
              <option value={5}>5 - Expert</option>
            </select>
            {errors.targetLevel && (
              <p className="mt-1 text-sm text-red-600">{errors.targetLevel}</p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Assessment Date *
            </label>
            <input
              type="date"
              name="assessmentDate"
              value={formData.assessmentDate}
              onChange={handleInputChange}
              className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.assessmentDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.assessmentDate && (
              <p className="mt-1 text-sm text-red-600">{errors.assessmentDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Review Date *
            </label>
            <input
              type="date"
              name="nextReviewDate"
              value={formData.nextReviewDate}
              onChange={handleInputChange}
              className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.nextReviewDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.nextReviewDate && (
              <p className="mt-1 text-sm text-red-600">{errors.nextReviewDate}</p>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Developing">Developing</option>
            <option value="Proficient">Proficient</option>
            <option value="Expert">Expert</option>
            <option value="Needs Improvement">Needs Improvement</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Current status: <span className={getStatusColor(formData.status)}>{formData.status}</span>
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Describe the skill and what it entails..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Evidence */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Evidence of Current Level
          </label>
          <textarea
            name="evidence"
            value={formData.evidence}
            onChange={handleInputChange}
            rows={3}
            placeholder="Provide evidence or examples that support the current skill level..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Development Plan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Development Plan
          </label>
          <textarea
            name="developmentPlan"
            value={formData.developmentPlan}
            onChange={handleInputChange}
            rows={3}
            placeholder="Outline the plan to reach the target level..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Progress Indicator */}
        {formData.currentLevel && formData.targetLevel && (
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">
                {formData.currentLevel}/{formData.targetLevel} ({Math.round((formData.currentLevel / formData.targetLevel) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(formData.currentLevel / formData.targetLevel) * 100}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Gap to target: {formData.targetLevel - formData.currentLevel} levels
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/competencies')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Update Competency' : 'Create Competency'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompetencyForm; 