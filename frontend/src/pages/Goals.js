import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { goalsAPI } from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Search } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import ConfirmDialog from '../components/ConfirmDialog';

const Goals = () => {
  const [filters, setFilters] = useState({
    targetType: '',
    status: '',
    page: 1,
    employee: '',
    search: ''
  });
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    goalId: null,
    goalTitle: ''
  });
  
  const queryClient = useQueryClient();

  // Debounce the search term
  const debouncedSearch = useDebounce(filters.search, 500);

  // Only include search in API call if it has more than 3 characters
  const searchParam = debouncedSearch.length > 3 ? debouncedSearch : undefined;

  // Fetch goals
  const { data: goalsData, isLoading, error } = useQuery(
    ['goals', { ...filters, search: searchParam }],
    () => goalsAPI.getAll({ ...filters, search: searchParam }),
    {
      keepPreviousData: true,
    }
  );

  // Delete goal mutation
  const deleteMutation = useMutation(
    (goalId) => goalsAPI.delete(goalId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['goals']);
      },
    }
  );

  // Update progress mutation
  const updateProgressMutation = useMutation(
    ({ goalId, progress }) => goalsAPI.updateProgress(goalId, progress),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['goals']);
      },
    }
  );

  const handleDelete = (goalId, goalTitle) => {
    setDeleteDialog({
      isOpen: true,
      goalId: goalId,
      goalTitle: goalTitle
    });
  };

  const confirmDelete = async () => {
    if (deleteDialog.goalId) {
      try {
        await deleteMutation.mutateAsync(deleteDialog.goalId);
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      goalId: null,
      goalTitle: ''
    });
  };

  const handleProgressUpdate = async (goalId, newProgress) => {
    try {
      await updateProgressMutation.mutateAsync({ goalId, progress: newProgress });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
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
              Error loading goals
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error.message}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your personal and professional goals
          </p>
        </div>
        <Link
          to="/goals/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Goal
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search goals (min 3 characters)..."
                  value={filters.search || ''}
                  onChange={(e) => {
                    e.preventDefault();
                    setFilters({ ...filters, search: e.target.value, page: 1 });
                  }}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filters.targetType}
                onChange={(e) => setFilters({ ...filters, targetType: e.target.value, page: 1 })}
                className="input-field"
              >
                <option value="">All Types</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div className="sm:w-48">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="sm:w-48">
              <select
                value={filters.employee}
                onChange={(e) => setFilters({ ...filters, employee: e.target.value, page: 1 })}
                className="input-field"
              >
                <option value="">All Employees</option>
                {goalsData?.goals?.reduce((employees, goal) => {
                  if (goal.assignedEmployee && !employees.find(emp => emp._id === goal.assignedEmployee._id)) {
                    employees.push(goal.assignedEmployee);
                  }
                  return employees;
                }, []).map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Goals List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {goalsData?.goals?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first goal.</p>
            <Link
              to="/goals/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Goal
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {goalsData?.goals?.map((goal) => (
              <li key={goal._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {goal.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTargetTypeColor(goal.targetType)}`}>
                          {goal.targetType}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                          {goal.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
                        <span>Progress: {goal.progress}%</span>
                        {goal.assignedEmployee && (
                          <span className="flex items-center">
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {goal.assignedEmployee.firstName} {goal.assignedEmployee.lastName}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            goal.progress >= 100 ? 'bg-green-600' : 
                            goal.status === 'overdue' ? 'bg-red-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(goal.progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center space-x-2">
                    {/* Progress Update Input */}
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={goal.progress}
                      onChange={(e) => handleProgressUpdate(goal._id, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={updateProgressMutation.isLoading}
                    />
                    <span className="text-sm text-gray-500">%</span>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1">
                      <Link
                        to={`/goals/${goal._id}`}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="View Goal"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/goals/${goal._id}/edit`}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit Goal"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(goal._id, goal.title)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete Goal"
                        disabled={deleteMutation.isLoading}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {goalsData?.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {goalsData.currentPage} of {goalsData.totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page <= 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page >= goalsData.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Goal"
        message={`Are you sure you want to delete "${deleteDialog.goalTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Goals; 