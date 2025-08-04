import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { goalsAPI, employeeAPI } from '../services/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const GoalForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);
  const employeeFromUrl = searchParams.get('employee');

  const [formData, setFormData] = useState({
    title: '',
    targetType: 'quarterly',
    dueDate: '',
    progress: 0,
    assignedEmployee: ''
  });



  const [errors, setErrors] = useState({});

  // Set employee from URL parameter when creating new goal
  useEffect(() => {
    if (!isEditing && employeeFromUrl) {
      setFormData(prev => ({
        ...prev,
        assignedEmployee: employeeFromUrl
      }));
    }
  }, [isEditing, employeeFromUrl]);

  // Fetch employees for dropdown
  const { data: employeesData } = useQuery(
    ['employees'],
    () => employeeAPI.getAll({ limit: 1000 }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch goal data if editing
  const { data: goal, isLoading: isLoadingGoal } = useQuery(
    ['goal', id],
    () => goalsAPI.getById(id),
    {
      enabled: isEditing,
      onSuccess: (data) => {
        setFormData({
          title: data.title || '',
          targetType: data.targetType || 'quarterly',
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
          progress: data.progress || 0,
          assignedEmployee: data.assignedEmployee?._id || data.assignedEmployee || ''
        });
      }
    }
  );

  // Create/Update mutations
  const createMutation = useMutation(
    (data) => goalsAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['goals']);
        navigate('/goals');
      },
    }
  );

  const updateMutation = useMutation(
    (data) => goalsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['goals']);
        queryClient.invalidateQueries(['goal', id]);
        navigate('/goals');
      },
    }
  );

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

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.targetType) {
      newErrors.targetType = 'Target type is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    if (!formData.assignedEmployee) {
      newErrors.assignedEmployee = 'Assigned employee is required';
    }

    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'Progress must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      progress: parseInt(formData.progress) || 0
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync(submitData);
      } else {
        await createMutation.mutateAsync(submitData);
      }
    } catch (error) {
      console.error('Error saving goal:', error);
      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.path] = err.msg;
        });
        setErrors(serverErrors);
      }
    }
  };

  const handleCancel = () => {
    navigate('/goals');
  };

  if (isEditing && isLoadingGoal) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Goal' : 'Create New Goal'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing ? 'Update your goal details' : 'Set a new personal or professional goal'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Goal Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Enter your goal title"
              maxLength={200}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Target Type */}
          <div>
            <label htmlFor="targetType" className="block text-sm font-medium text-gray-700">
              Target Type *
            </label>
            <select
              id="targetType"
              name="targetType"
              value={formData.targetType}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.targetType ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            >
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
            {errors.targetType && (
              <p className="mt-1 text-sm text-red-600">{errors.targetType}</p>
            )}
          </div>

          {/* Assigned Employee */}
          <div>
            <label htmlFor="assignedEmployee" className="block text-sm font-medium text-gray-700">
              Assign to Employee *
            </label>
            <select
              id="assignedEmployee"
              name="assignedEmployee"
              value={formData.assignedEmployee}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.assignedEmployee ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            >
              <option value="">Select an employee</option>
              {employeesData?.employees?.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.firstName} {employee.lastName} - {employee.employeeId} ({employee.department})
                </option>
              ))}
            </select>

            {errors.assignedEmployee && (
              <p className="mt-1 text-sm text-red-600">{errors.assignedEmployee}</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Due Date *
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.dueDate ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
            )}
          </div>

          {/* Progress */}
          <div>
            <label htmlFor="progress" className="block text-sm font-medium text-gray-700">
              Progress (%)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="progress"
                name="progress"
                value={formData.progress}
                onChange={handleInputChange}
                min="0"
                max="100"
                className={`block w-full px-3 py-2 border ${
                  errors.progress ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="0"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
            {errors.progress && (
              <p className="mt-1 text-sm text-red-600">{errors.progress}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Enter a value between 0 and 100 to track your progress
            </p>
          </div>

          {/* Progress Bar Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress Preview
            </label>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  formData.progress >= 100 ? 'bg-green-600' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(formData.progress, 100)}%` }}
              ></div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {formData.progress}% complete
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isLoading || updateMutation.isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEditing ? 'Update Goal' : 'Create Goal'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm; 