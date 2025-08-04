import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, Users } from 'lucide-react';
import { employeeAPI } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

const Employees = () => {
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    page: 1
  });
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    employeeId: null,
    employeeName: ''
  });
  const queryClient = useQueryClient();

  // Debounce the search term
  const debouncedSearch = useDebounce(filters.search, 500);

  // Only include search in API call if it has more than 3 characters
  const searchParam = debouncedSearch.length > 3 ? debouncedSearch : undefined;

  const { data, isLoading, error } = useQuery(
    ['employees', { ...filters, search: searchParam }],
    () => employeeAPI.getAll({
      page: filters.page,
      limit: 10,
      search: searchParam,
      department: filters.department || undefined,
    })
  );

  const deleteMutation = useMutation(
    (id) => employeeAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        toast.success('Employee deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error deleting employee');
      },
    }
  );

  const handleDelete = (id, name) => {
    setDeleteDialog({
      isOpen: true,
      employeeId: id,
      employeeName: name
    });
  };

  const confirmDelete = () => {
    if (deleteDialog.employeeId) {
      deleteMutation.mutate(deleteDialog.employeeId);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      employeeId: null,
      employeeName: ''
    });
  };

  const departments = [
    'Engineering',
    'Marketing',
    'Sales',
    'Human Resources',
    'Finance',
    'Operations',
    'Customer Support',
  ];

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
        <p className="text-red-600">Error loading employees: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="mt-2 text-gray-600">
            Manage employee information and records
          </p>
        </div>
        <Link
          to="/employees/new"
          className="btn-primary inline-flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
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
                  placeholder="Search employees (min 3 characters)..."
                  value={filters.search}
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
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })}
                className="input-field"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Employees Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Employee</th>
                <th className="table-header-cell">Department</th>
                <th className="table-header-cell">Position</th>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Hire Date</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {data?.employees?.map((employee) => (
                <tr key={employee._id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{employee.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {employee.department}
                    </span>
                  </td>
                  <td className="table-cell">{employee.position}</td>
                  <td className="table-cell">{employee.email}</td>
                  <td className="table-cell">
                    {new Date(employee.hireDate).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/employees/${employee._id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/employees/${employee._id}/edit`}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(employee._id, `${employee.firstName} ${employee.lastName}`)}
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
        {(!data?.employees || data.employees.length === 0) && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.department
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first employee.'}
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
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteDialog.employeeName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Employees; 