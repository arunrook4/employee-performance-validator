import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Save, BarChart3, Star } from 'lucide-react';
import { performanceAPI, employeeAPI } from '../services/api';
import toast from 'react-hot-toast';

const PerformanceForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);
  const employeeFromUrl = searchParams.get('employee');

  const { data: performance, isLoading } = useQuery(
    ['performance', id],
    () => performanceAPI.getById(id),
    { enabled: isEditing }
  );

  const { data: employeesData } = useQuery(
    'employees',
    () => employeeAPI.getAll({ limit: 1000 })
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm();

  const mutation = useMutation(
    (data) => isEditing ? performanceAPI.update(id, data) : performanceAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('performance');
        toast.success(`Performance evaluation ${isEditing ? 'updated' : 'created'} successfully`);
        navigate('/performance');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || `Error ${isEditing ? 'updating' : 'creating'} performance evaluation`);
      },
    }
  );

  React.useEffect(() => {
    if (performance && isEditing) {
      const formData = { ...performance };
      if (formData.evaluationPeriod?.startDate) {
        formData.evaluationPeriod.startDate = new Date(formData.evaluationPeriod.startDate).toISOString().split('T')[0];
      }
      if (formData.evaluationPeriod?.endDate) {
        formData.evaluationPeriod.endDate = new Date(formData.evaluationPeriod.endDate).toISOString().split('T')[0];
      }
      if (formData.employee && typeof formData.employee === 'object') {
        formData.employee = formData.employee._id;
      }
      if (formData.evaluator && typeof formData.evaluator === 'object') {
        formData.evaluator = formData.evaluator._id;
      }
      reset(formData);
    } else if (!isEditing && employeeFromUrl) {
      // Set employee when creating new evaluation with employee parameter
      reset({ employee: employeeFromUrl });
    }
  }, [performance, isEditing, reset, employeeFromUrl]);

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const employees = employeesData?.employees || [];

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
              onClick={() => navigate('/performance')}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-green-100">
                <BarChart3 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {isEditing ? 'Edit Performance Evaluation' : 'Add Performance Evaluation'}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Employee */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Employee *
              </label>
              <select
                {...register('employee', { required: 'Employee is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName} - {employee.department}
                  </option>
                ))}
              </select>
              {errors.employee && (
                <p className="mt-1 text-sm text-red-600">{errors.employee.message}</p>
              )}
            </div>

            {/* Evaluator */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Evaluator *
              </label>
              <select
                {...register('evaluator', { required: 'Evaluator is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select Evaluator</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName} - {employee.department}
                  </option>
                ))}
              </select>
              {errors.evaluator && (
                <p className="mt-1 text-sm text-red-600">{errors.evaluator.message}</p>
              )}
            </div>

            {/* Evaluation Period Start */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evaluation Period Start *
              </label>
              <input
                type="date"
                {...register('evaluationPeriod.startDate', { required: 'Start date is required' })}
                className="input-field"
              />
              {errors.evaluationPeriod?.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.evaluationPeriod.startDate.message}</p>
              )}
            </div>

            {/* Evaluation Period End */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evaluation Period End *
              </label>
              <input
                type="date"
                {...register('evaluationPeriod.endDate', { required: 'End date is required' })}
                className="input-field"
              />
              {errors.evaluationPeriod?.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.evaluationPeriod.endDate.message}</p>
              )}
            </div>

            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating *
              </label>
              <select
                {...register('overallRating', { 
                  required: 'Overall rating is required',
                  valueAsNumber: true
                })}
                className="input-field"
              >
                <option value="">Select Rating</option>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Below Average</option>
                <option value="3">3 - Average</option>
                <option value="4">4 - Above Average</option>
                <option value="5">5 - Excellent</option>
              </select>
              {errors.overallRating && (
                <p className="mt-1 text-sm text-red-600">{errors.overallRating.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                {...register('status', { required: 'Status is required' })}
                className="input-field"
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Category Ratings */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-2 mb-6">
              <Star className="h-6 w-6 text-yellow-500" />
              <h3 className="text-xl font-bold text-gray-900">Category Ratings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Technical Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technical Skills *
                </label>
                <select
                  {...register('categories.technicalSkills.rating', { 
                    required: 'Technical skills rating is required',
                    valueAsNumber: true
                  })}
                  className="input-field"
                >
                  <option value="">Select Rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Below Average</option>
                  <option value="3">3 - Average</option>
                  <option value="4">4 - Above Average</option>
                  <option value="5">5 - Excellent</option>
                </select>
                <textarea
                  {...register('categories.technicalSkills.comments')}
                  placeholder="Comments on technical skills..."
                  className="input-field mt-2"
                  rows="2"
                />
              </div>

              {/* Communication */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Communication *
                </label>
                <select
                  {...register('categories.communication.rating', { 
                    required: 'Communication rating is required',
                    valueAsNumber: true
                  })}
                  className="input-field"
                >
                  <option value="">Select Rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Below Average</option>
                  <option value="3">3 - Average</option>
                  <option value="4">4 - Above Average</option>
                  <option value="5">5 - Excellent</option>
                </select>
                <textarea
                  {...register('categories.communication.comments')}
                  placeholder="Comments on communication..."
                  className="input-field mt-2"
                  rows="2"
                />
              </div>

              {/* Teamwork */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teamwork *
                </label>
                <select
                  {...register('categories.teamwork.rating', { 
                    required: 'Teamwork rating is required',
                    valueAsNumber: true
                  })}
                  className="input-field"
                >
                  <option value="">Select Rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Below Average</option>
                  <option value="3">3 - Average</option>
                  <option value="4">4 - Above Average</option>
                  <option value="5">5 - Excellent</option>
                </select>
                <textarea
                  {...register('categories.teamwork.comments')}
                  placeholder="Comments on teamwork..."
                  className="input-field mt-2"
                  rows="2"
                />
              </div>

              {/* Leadership */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leadership *
                </label>
                <select
                  {...register('categories.leadership.rating', { 
                    required: 'Leadership rating is required',
                    valueAsNumber: true
                  })}
                  className="input-field"
                >
                  <option value="">Select Rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Below Average</option>
                  <option value="3">3 - Average</option>
                  <option value="4">4 - Above Average</option>
                  <option value="5">5 - Excellent</option>
                </select>
                <textarea
                  {...register('categories.leadership.comments')}
                  placeholder="Comments on leadership..."
                  className="input-field mt-2"
                  rows="2"
                />
              </div>

              {/* Productivity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Productivity *
                </label>
                <select
                  {...register('categories.productivity.rating', { 
                    required: 'Productivity rating is required',
                    valueAsNumber: true
                  })}
                  className="input-field"
                >
                  <option value="">Select Rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Below Average</option>
                  <option value="3">3 - Average</option>
                  <option value="4">4 - Above Average</option>
                  <option value="5">5 - Excellent</option>
                </select>
                <textarea
                  {...register('categories.productivity.comments')}
                  placeholder="Comments on productivity..."
                  className="input-field mt-2"
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Additional Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments
            </label>
            <textarea
              {...register('comments')}
              placeholder="Additional comments about the performance evaluation..."
              className="input-field"
              rows="4"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/performance')}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Evaluation' : 'Create Evaluation')}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PerformanceForm; 