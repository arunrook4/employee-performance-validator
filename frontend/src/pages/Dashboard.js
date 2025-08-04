import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Users, BarChart3, Plus, TrendingUp, UserCheck, Clock, Target, Brain } from 'lucide-react';
import { employeeAPI, performanceAPI, goalsAPI, competenciesAPI } from '../services/api';

const Dashboard = () => {
  const { data: employeesData, isLoading: employeesLoading } = useQuery(
    'employees',
    () => employeeAPI.getAll({ limit: 1000 })
  );

  const { data: performanceData, isLoading: performanceLoading } = useQuery(
    'performance',
    () => performanceAPI.getAll({ limit: 1000 })
  );

  const { data: goalsData, isLoading: goalsLoading } = useQuery(
    'goals',
    () => goalsAPI.getAll({ limit: 1000 })
  );

  const { data: competenciesData, isLoading: competenciesLoading } = useQuery(
    'competency-stats',
    () => competenciesAPI.getStats()
  );

  const isLoading = employeesLoading || performanceLoading || goalsLoading || competenciesLoading;

  const stats = [
    {
      name: 'Total Employees',
      value: employeesData?.employees?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
      link: '/employees',
    },
    {
      name: 'Performance Evaluations',
      value: performanceData?.performances?.length || 0,
      icon: BarChart3,
      color: 'bg-green-500',
      link: '/performance',
    },
    {
      name: 'Pending Reviews',
      value: performanceData?.performances?.filter(p => p.status === 'draft')?.length || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/performance?status=draft',
    },
    {
      name: 'Completed Reviews',
      value: performanceData?.performances?.filter(p => p.status === 'approved')?.length || 0,
      icon: UserCheck,
      color: 'bg-purple-500',
      link: '/performance?status=approved',
    },
    {
      name: 'Active Goals',
      value: goalsData?.goals?.length || 0,
      icon: Target,
      color: 'bg-orange-500',
      link: '/goals',
    },
    {
      name: 'Total Competencies',
      value: competenciesData?.totalCompetencies || 0,
      icon: Brain,
      color: 'bg-indigo-500',
      link: '/competencies',
    },
  ];

  const quickActions = [
    {
      name: 'Add Employee',
      description: 'Create a new employee record',
      icon: Plus,
      link: '/employees/new',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Create Performance Review',
      description: 'Start a new performance evaluation',
      icon: BarChart3,
      link: '/performance/new',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      name: 'View Reports',
      description: 'Analyze performance data',
      icon: TrendingUp,
      link: '/performance',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      name: 'Manage Goals',
      description: 'Set and track your goals',
      icon: Target,
      link: '/goals',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      name: 'Skill Assessments',
      description: 'Track competencies and development areas',
      icon: Brain,
      link: '/competencies',
      color: 'bg-indigo-600 hover:bg-indigo-700',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to the Employee Performance Validator system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.link}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.link}
                className={`card ${action.color} text-white hover:shadow-lg transition-all duration-200`}
              >
                <div className="flex items-center">
                  <Icon className="w-8 h-8" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">{action.name}</h3>
                    <p className="text-blue-100">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="card">
          <div className="space-y-4">
            {performanceData?.performances?.slice(0, 5).map((performance) => (
              <div key={performance._id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Performance review for {performance.employee?.firstName} {performance.employee?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Evaluated by {performance.evaluator?.firstName} {performance.evaluator?.lastName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Rating: {performance.overallRating}/5
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(performance.evaluationDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {(!performanceData?.performances || performanceData.performances.length === 0) && (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Goals Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Goals Overview</h2>
          <Link
            to="/goals"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all goals →
          </Link>
        </div>
        <div className="card">
          <div className="space-y-4">
            {goalsData?.goals?.slice(0, 3).map((goal) => (
              <div key={goal._id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">{goal.title}</p>
                    <p className="text-sm text-gray-600">
                      {goal.targetType} • Due: {new Date(goal.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {goal.progress}% complete
                  </p>
                  <div className="w-20 bg-gray-200 rounded-full h-1 mt-1">
                    <div
                      className={`h-1 rounded-full ${
                        goal.progress >= 100 ? 'bg-green-600' : 
                        goal.status === 'overdue' ? 'bg-red-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            {(!goalsData?.goals || goalsData.goals.length === 0) && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No goals set yet</p>
                <Link
                  to="/goals/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Create your first goal
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 