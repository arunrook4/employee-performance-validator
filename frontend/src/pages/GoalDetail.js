import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { goalsAPI } from '../services/api';
import { ArrowLeftIcon, PencilIcon, TrashIcon, CalendarIcon, FlagIcon } from '@heroicons/react/24/outline';
import ConfirmDialog from '../components/ConfirmDialog';

const GoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [progress, setProgress] = useState(0);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false
  });

  // Fetch goal data
  const { data: goal, isLoading, error } = useQuery(
    ['goal', id],
    () => goalsAPI.getById(id),
    {
      onSuccess: (data) => {
        setProgress(data.progress || 0);
      }
    }
  );

  // Update progress mutation
  const updateProgressMutation = useMutation(
    (newProgress) => goalsAPI.updateProgress(id, newProgress),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['goal', id]);
        queryClient.invalidateQueries(['goals']);
        setIsUpdatingProgress(false);
      },
      onError: () => {
        setIsUpdatingProgress(false);
      }
    }
  );

  // Delete goal mutation
  const deleteMutation = useMutation(
    () => goalsAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['goals']);
        navigate('/goals');
      },
    }
  );

  const handleProgressChange = (e) => {
    const newProgress = parseInt(e.target.value) || 0;
    setProgress(newProgress);
  };

  const handleProgressUpdate = async () => {
    if (progress < 0 || progress > 100) return;
    
    setIsUpdatingProgress(true);
    try {
      await updateProgressMutation.mutateAsync(progress);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleDelete = () => {
    setDeleteDialog({
      isOpen: true
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTargetTypeColor = (targetType) => {
    return targetType === 'quarterly' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-orange-100 text-orange-800';
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `${diffDays} days remaining`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading goal
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error.message}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Goal not found</h3>
        <p className="text-gray-500 mb-6">The goal you're looking for doesn't exist or has been deleted.</p>
        <Link
          to="/goals"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Back to Goals
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/goals')}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{goal.title}</h1>
              <div className="mt-2 flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTargetTypeColor(goal.targetType)}`}>
                  {goal.targetType}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                  {goal.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link
              to={`/goals/${id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isLoading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Progress Tracking</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Current Progress</span>
                  <span className="text-sm text-gray-500">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      goal.progress >= 100 ? 'bg-green-600' : 
                      goal.status === 'overdue' ? 'bg-red-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <label htmlFor="progress-input" className="block text-sm font-medium text-gray-700 mb-1">
                    Update Progress
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      id="progress-input"
                      value={progress}
                      onChange={handleProgressChange}
                      min="0"
                      max="100"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      disabled={isUpdatingProgress}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleProgressUpdate}
                  disabled={isUpdatingProgress || progress < 0 || progress > 100}
                  className="mt-6 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingProgress ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>

          {/* Goal Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Goal Details</h2>
            
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Title</dt>
                <dd className="mt-1 text-sm text-gray-900">{goal.title}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Target Type</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTargetTypeColor(goal.targetType)}`}>
                    {goal.targetType}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                    {goal.status}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Assigned Employee</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {goal.assignedEmployee ? (
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{goal.assignedEmployee.firstName} {goal.assignedEmployee.lastName}</span>
                      <span className="ml-2 text-xs text-gray-500">({goal.assignedEmployee.employeeId})</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Not assigned</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Due Date Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Due Date</h3>
                <p className="text-sm text-gray-500">
                  {new Date(goal.dueDate).toLocaleDateString()}
                </p>
                <p className={`text-sm font-medium ${
                  goal.status === 'overdue' ? 'text-red-600' : 
                  goal.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {getDaysRemaining(goal.dueDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Goal Created</p>
                  <p className="text-xs text-gray-500">
                    {new Date(goal.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${
                    goal.status === 'completed' ? 'bg-green-600' : 
                    goal.status === 'overdue' ? 'bg-red-600' : 'bg-gray-300'
                  }`}></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Due Date</p>
                  <p className="text-xs text-gray-500">
                    {new Date(goal.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to={`/goals/${id}/edit`}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Edit Goal
              </Link>
              <button
                onClick={() => setProgress(100)}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Mark as Complete
              </button>
              <button
                onClick={handleDelete}
                className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                Delete Goal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default GoalDetail; 