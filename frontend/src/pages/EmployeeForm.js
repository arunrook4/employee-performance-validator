import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Save, User } from 'lucide-react';
import { employeeAPI } from '../services/api';
import toast from 'react-hot-toast';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const { data: employee, isLoading } = useQuery(
    ['employee', id],
    () => employeeAPI.getById(id),
    { enabled: isEditing }
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const mutation = useMutation(
    (data) => isEditing ? employeeAPI.update(id, data) : employeeAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        toast.success(`Employee ${isEditing ? 'updated' : 'created'} successfully`);
        navigate('/employees');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || `Error ${isEditing ? 'updating' : 'creating'} employee`);
      },
    }
  );

  React.useEffect(() => {
    if (employee && isEditing) {
      const formData = { ...employee };
      if (formData.hireDate) {
        formData.hireDate = new Date(formData.hireDate).toISOString().split('T')[0];
      }
      reset(formData);
    }
  }, [employee, isEditing, reset]);

  const onSubmit = (data) => {
    mutation.mutate(data);
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

  if (isLoading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="-mt-8 -mx-4 px-4 py-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/employees')}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-100">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {isEditing ? 'Edit Employee' : 'Add Employee'}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Employee ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Employee ID *
              </label>
              <input
                type="text"
                {...register('employeeId', { required: 'Employee ID is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="EMP001"
              />
              {errors.employeeId && (
                <p className="mt-2 text-sm text-red-600">{errors.employeeId.message}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Department *
              </label>
              <select
                {...register('department', { required: 'Department is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="mt-2 text-sm text-red-600">{errors.department.message}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                First Name *
              </label>
              <input
                type="text"
                {...register('firstName', { required: 'First name is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="John"
              />
              {errors.firstName && (
                <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Last Name *
              </label>
              <input
                type="text"
                {...register('lastName', { required: 'Last name is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Email *
              </label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="john.doe@company.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Position *
              </label>
              <input
                type="text"
                {...register('position', { required: 'Position is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Software Engineer"
              />
              {errors.position && (
                <p className="mt-2 text-sm text-red-600">{errors.position.message}</p>
              )}
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Salary *
              </label>
              <input
                type="number"
                {...register('salary', { 
                  required: 'Salary is required',
                  min: { value: 0, message: 'Salary must be positive' }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="75000"
              />
              {errors.salary && (
                <p className="mt-2 text-sm text-red-600">{errors.salary.message}</p>
              )}
            </div>

            {/* Hire Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Hire Date *
              </label>
              <input
                type="date"
                {...register('hireDate', { required: 'Hire date is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.hireDate && (
                <p className="mt-2 text-sm text-red-600">{errors.hireDate.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Employee' : 'Create Employee')}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm; 