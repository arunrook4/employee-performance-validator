import React from 'react';
import { useQuery } from 'react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, User, Mail, Calendar, DollarSign, Building, Users, BarChart3, Star, Eye, Flag, Target } from 'lucide-react';
import { employeeAPI, performanceAPI, goalsAPI } from '../services/api';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: employee, isLoading, error } = useQuery(
    ['employee', id],
    () => employeeAPI.getById(id)
  );

  // Fetch performance reviews for this employee
  const { data: performanceReviews, isLoading: reviewsLoading } = useQuery(
    ['performance', 'employee', id],
    () => performanceAPI.getByEmployee(id),
    {
      enabled: !!id
    }
  );

  // Fetch goals assigned to this employee
  const { data: employeeGoals, isLoading: goalsLoading } = useQuery(
    ['goals', 'employee', id],
    () => goalsAPI.getByEmployee(id),
    {
      enabled: !!id
    }
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
        <p className="text-red-600">Error loading employee: {error.message}</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Employee not found</p>
      </div>
    );
  }

  const emp = employee;

  // Helper functions for performance reviews
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

  // Helper functions for goals
  const getGoalStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTargetTypeColor = (targetType) => {
    return targetType === 'quarterly'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-orange-100 text-orange-800';
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-green-600';
    if (progress >= 75) return 'bg-blue-600';
    if (progress >= 50) return 'bg-yellow-600';
    if (progress >= 25) return 'bg-orange-600';
    return 'bg-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/employees')}
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {emp.firstName} {emp.lastName}
            </h1>
            <p className="mt-2 text-gray-600">{emp.position}</p>
          </div>
        </div>
        <Link
          to={`/employees/${id}/edit`}
          className="btn-primary inline-flex items-center"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Employee
        </Link>
      </div>

      {/* Employee Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Employee Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Employee ID</p>
                    <p className="text-gray-900">{emp.employeeId}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{emp.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p className="text-gray-900">{emp.department}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Hire Date</p>
                    <p className="text-gray-900">
                      {new Date(emp.hireDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Salary</p>
                    <p className="text-gray-900">
                      ${emp.salary?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Manager</p>
                    <p className="text-gray-900">
                      {emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : 'No manager assigned'}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Employment Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  emp.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {emp.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p className="text-gray-900">
                  {new Date(emp.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-gray-900">
                  {new Date(emp.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Reviews */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Performance Reviews</h2>
          <Link
            to={`/performance/new?employee=${emp._id}`}
            className="btn-primary inline-flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Add Review
          </Link>
        </div>
        
        {reviewsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : performanceReviews && performanceReviews.length > 0 ? (
          <div className="space-y-4">
            {performanceReviews.map((review) => (
              <div key={review._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Performance Review
                      </h3>
                      <p className="text-sm text-gray-500">
                        Evaluated by {review.evaluator?.firstName} {review.evaluator?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Star className={`w-4 h-4 ${getRatingColor(review.overallRating)}`} />
                      <span className={`font-medium ${getRatingColor(review.overallRating)}`}>
                        {review.overallRating}/5
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Evaluation Date:</span>
                    <p className="font-medium">
                      {new Date(review.evaluationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Period:</span>
                    <p className="font-medium">
                      {new Date(review.evaluationPeriod.startDate).toLocaleDateString()} - {new Date(review.evaluationPeriod.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Average Rating:</span>
                    <p className="font-medium">
                      {review.averageCategoryRating?.toFixed(1)}/5
                    </p>
                  </div>
                </div>

                {review.comments && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-gray-500 text-sm">Comments:</span>
                    <p className="text-sm mt-1">{review.comments}</p>
                  </div>
                )}

                <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100">
                  <Link
                    to={`/performance/${review._id}`}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">No Performance Reviews</p>
            <p className="text-sm mb-4">
              This employee hasn't had any performance reviews yet.
            </p>
            <Link
              to={`/performance/new?employee=${emp._id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Create First Review
            </Link>
          </div>
                 )}
       </div>

       {/* Goals */}
       <div className="card">
         <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-semibold text-gray-900">Assigned Goals</h2>
           <Link
             to={`/goals/new?employee=${emp._id}`}
             className="btn-primary inline-flex items-center"
           >
             <Flag className="w-4 h-4 mr-2" />
             Add Goal
           </Link>
         </div>
         
         {goalsLoading ? (
           <div className="flex items-center justify-center py-8">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
           </div>
                   ) : employeeGoals && employeeGoals.goals && employeeGoals.goals.length > 0 ? (
            <div className="space-y-4">
              {employeeGoals.goals.map((goal) => (
               <div key={goal._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center space-x-3">
                     <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                       <Target className="w-4 h-4 text-green-600" />
                     </div>
                     <div>
                       <h3 className="font-medium text-gray-900">
                         {goal.title}
                       </h3>
                       <p className="text-sm text-gray-500">
                         {goal.description}
                       </p>
                     </div>
                   </div>
                   <div className="flex items-center space-x-3">
                     <div className="flex items-center space-x-1">
                       <span className="text-sm font-medium text-gray-600">
                         {goal.progress}%
                       </span>
                     </div>
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGoalStatusColor(goal.status)}`}>
                       {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                     </span>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                   <div>
                     <span className="text-gray-500">Target Type:</span>
                     <p className="font-medium">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTargetTypeColor(goal.targetType)}`}>
                         {goal.targetType.charAt(0).toUpperCase() + goal.targetType.slice(1)}
                       </span>
                     </p>
                   </div>
                   <div>
                     <span className="text-gray-500">Due Date:</span>
                     <p className="font-medium">
                       {new Date(goal.dueDate).toLocaleDateString()}
                     </p>
                   </div>
                   <div>
                     <span className="text-gray-500">Priority:</span>
                     <p className="font-medium">
                       {goal.priority || 'Not set'}
                     </p>
                   </div>
                   <div>
                     <span className="text-gray-500">Created:</span>
                     <p className="font-medium">
                       {new Date(goal.createdAt).toLocaleDateString()}
                     </p>
                   </div>
                 </div>

                 {/* Progress Bar */}
                 <div className="mt-3">
                   <div className="flex items-center justify-between text-sm mb-1">
                     <span className="text-gray-600">Progress</span>
                     <span className="font-medium">{goal.progress}%</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div
                       className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal.progress)}`}
                       style={{ width: `${Math.min(goal.progress, 100)}%` }}
                     ></div>
                   </div>
                 </div>

                 {goal.notes && (
                   <div className="mt-3 pt-3 border-t border-gray-100">
                     <span className="text-gray-500 text-sm">Notes:</span>
                     <p className="text-sm mt-1">{goal.notes}</p>
                   </div>
                 )}

                 <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100">
                   <Link
                     to={`/goals/${goal._id}`}
                     className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                   >
                     <Eye className="w-4 h-4 mr-1" />
                     View Details
                   </Link>
                 </div>
               </div>
             ))}
           </div>
         ) : (
           <div className="text-center py-8 text-gray-500">
             <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
             <p className="text-lg font-medium text-gray-900 mb-2">No Goals Assigned</p>
             <p className="text-sm mb-4">
               This employee hasn't been assigned any goals yet.
             </p>
             <Link
               to={`/goals/new?employee=${emp._id}`}
               className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
             >
               <Flag className="w-4 h-4 mr-2" />
               Assign First Goal
             </Link>
           </div>
         )}
       </div>
     </div>
   );
 };

export default EmployeeDetail; 