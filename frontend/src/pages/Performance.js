import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, BarChart3, Star } from 'lucide-react';
import { performanceAPI } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

const Performance = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1
  });
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    performanceId: null,
    employeeName: ''
  });
  const queryClient = useQueryClient();

  // Initialize filters from URL parameters
  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    const searchFromUrl = searchParams.get('search');
    
    setFilters(prev => ({
      ...prev,
      status: statusFromUrl || '',
      search: searchFromUrl || ''
    }));
  }, [searchParams]);

  // Debounce the search term
  const debouncedSearch = useDebounce(filters.search, 500);

  // Only include search in API call if it has more than 3 characters
  const searchParam = debouncedSearch.length > 3 ? debouncedSearch : undefined;

  const { data, isLoading, error } = useQuery(
    ['performance', { ...filters, search: searchParam }],
    () => performanceAPI.getAll({
      page: filters.page,
      limit: 10,
      search: searchParam,
      status: filters.status || undefined,
    })
  );

  const deleteMutation = useMutation(
    (id) => performanceAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('performance');
        toast.success('Performance evaluation deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error deleting performance evaluation');
      },
    }
  );

  const handleDelete = (id, employeeName) => {
    setDeleteDialog({
      isOpen: true,
      performanceId: id,
      employeeName: employeeName
    });
  };

  const confirmDelete = () => {
    if (deleteDialog.performanceId) {
      deleteMutation.mutate(deleteDialog.performanceId);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      performanceId: null,
      employeeName: ''
    });
  };

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
        <p className="text-red-600">Error loading performance evaluations: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Evaluations</h1>
          <p className="mt-2 text-gray-600">
            Manage and review employee performance evaluations
          </p>
        </div>
        <Link
          to="/performance/new"
          className="btn-primary inline-flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Evaluation</span>
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
                  placeholder="Search evaluations (min 3 characters)..."
                  value={filters.search}
                  onChange={(e) => {
                    e.preventDefault();
                    const newSearch = e.target.value;
                    setFilters({ ...filters, search: newSearch, page: 1 });
                    
                    // Update URL parameters for search
                    const currentParams = Object.fromEntries(searchParams.entries());
                    if (newSearch) {
                      setSearchParams({ ...currentParams, search: newSearch });
                    } else {
                      delete currentParams.search;
                      setSearchParams(currentParams);
                    }
                  }}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filters.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  setFilters({ ...filters, status: newStatus, page: 1 });
                  
                  // Update URL parameters
                  if (newStatus) {
                    setSearchParams({ status: newStatus });
                  } else {
                    setSearchParams({});
                  }
                }}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Performance Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Employee</th>
                <th className="table-header-cell">Evaluator</th>
                <th className="table-header-cell">Rating</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Evaluation Date</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {data?.performances?.map((performance) => (
                <tr key={performance._id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {performance.employee?.firstName} {performance.employee?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{performance.employee?.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <p className="text-gray-900">
                      {performance.evaluator?.firstName} {performance.evaluator?.lastName}
                    </p>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-1">
                      <Star className={`w-4 h-4 ${getRatingColor(performance.overallRating)}`} />
                      <span className={`font-medium ${getRatingColor(performance.overallRating)}`}>
                        {performance.overallRating}/5
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(performance.status)}`}>
                      {performance.status.charAt(0).toUpperCase() + performance.status.slice(1)}
                    </span>
                  </td>
                  <td className="table-cell">
                    {new Date(performance.evaluationDate).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/performance/${performance._id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/performance/${performance._id}/edit`}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(performance._id, `${performance.employee?.firstName} ${performance.employee?.lastName}`)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {(!data?.performances || data.performances.length === 0) && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No performance evaluations found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.status
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first performance evaluation.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((filters.page - 1) * 10) + 1} to{' '}
            {Math.min(filters.page * 10, data.total)} of {data.total} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {filters.page} of {data.totalPages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page === data.totalPages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
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
        title="Delete Performance Evaluation"
        message={`Are you sure you want to delete the performance evaluation for ${deleteDialog.employeeName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Performance; 