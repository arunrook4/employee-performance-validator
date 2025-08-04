# Goal Management Feature

## Overview
The goal management feature has been successfully added to the Employee Performance Validator application. This feature allows users to create, track, and manage their personal and professional goals.

## Features Implemented

### 1. Goal Creation
- **Title**: Users can create goals with descriptive titles (max 200 characters)
- **Target Type**: Choose between quarterly or annual goals
- **Due Date**: Set specific due dates for goals
- **Progress Tracking**: Numeric progress tracking (0-100%)

### 2. Goal Management
- **List View**: Display all goals with filtering options
- **Progress Updates**: Real-time progress tracking with visual progress bars
- **Status Tracking**: Automatic status calculation (in-progress, completed, overdue)
- **Edit & Delete**: Full CRUD operations for goals

### 3. User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Visual Progress Bars**: Color-coded progress indicators
- **Status Badges**: Clear visual indicators for goal status
- **Filtering**: Filter goals by target type and status
- **Pagination**: Handle large numbers of goals efficiently

## Technical Implementation

### Backend Components

#### 1. Goal Model (`backend/models/Goal.js`)
```javascript
- title: String (required, max 200 chars)
- targetType: Enum ['quarterly', 'annual']
- dueDate: Date (required)
- progress: Number (0-100, default 0)
- user: ObjectId (reference to User)
- isActive: Boolean (soft delete)
- Virtual fields: progressPercentage, status
```

#### 2. Goal Routes (`backend/routes/goals.js`)
- `GET /api/goals` - Get all goals for user
- `GET /api/goals/:id` - Get single goal
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `PATCH /api/goals/:id/progress` - Update progress only
- `DELETE /api/goals/:id` - Delete goal (soft delete)
- `GET /api/goals/type/:targetType` - Get goals by type

### Frontend Components

#### 1. Goals Page (`frontend/src/pages/Goals.js`)
- Main goals listing with filtering and pagination
- Progress update functionality
- Delete confirmation
- Empty state handling

#### 2. Goal Form (`frontend/src/pages/GoalForm.js`)
- Create and edit goal forms
- Form validation
- Progress preview
- Date validation

#### 3. Goal Detail (`frontend/src/pages/GoalDetail.js`)
- Detailed goal view
- Progress tracking interface
- Timeline display
- Quick actions

#### 4. API Integration (`frontend/src/services/api.js`)
- Complete CRUD operations for goals
- Progress update endpoint
- Error handling

## Database Schema

### Goals Collection
```javascript
{
  _id: ObjectId,
  title: String,
  targetType: String, // 'quarterly' or 'annual'
  dueDate: Date,
  progress: Number, // 0-100
  user: ObjectId, // Reference to User
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication Required
All goal endpoints require authentication via JWT token.

### Request/Response Examples

#### Create Goal
```http
POST /api/goals
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Complete Project X",
  "targetType": "quarterly",
  "dueDate": "2024-03-31",
  "progress": 25
}
```

#### Update Progress
```http
PATCH /api/goals/:id/progress
Content-Type: application/json
Authorization: Bearer <token>

{
  "progress": 75
}
```

#### Get Goals with Filters
```http
GET /api/goals?targetType=quarterly&status=in-progress&page=1&limit=10
Authorization: Bearer <token>
```

## Status Calculation

Goals automatically calculate their status based on:
- **Completed**: Progress >= 100%
- **Overdue**: Due date has passed and progress < 100%
- **In Progress**: Due date hasn't passed and progress < 100%

## Navigation Integration

### Navbar
- Added "Goals" link to main navigation
- Uses Target icon from Lucide React

### Dashboard
- Added goals overview section
- Shows recent goals with progress
- Quick action to create new goals
- Stats card showing total active goals

## Security Features

1. **User Isolation**: Users can only access their own goals
2. **Input Validation**: Server-side validation for all inputs
3. **Authentication**: All endpoints require valid JWT tokens
4. **Soft Delete**: Goals are marked inactive rather than deleted

## Error Handling

- Form validation with user-friendly error messages
- API error handling with proper HTTP status codes
- Loading states for better UX
- Confirmation dialogs for destructive actions

## Future Enhancements

Potential improvements for the goal management feature:
1. Goal categories/tags
2. Goal sharing between users
3. Goal templates
4. Goal analytics and reporting
5. Goal reminders and notifications
6. Goal dependencies and relationships
7. Goal history and audit trail

## Testing

To test the goal management feature:

1. Start the backend server: `cd backend && npm start`
2. Start the frontend: `cd frontend && npm start`
3. Login to the application
4. Navigate to the Goals page
5. Create a new goal
6. Test progress updates
7. Test filtering and pagination
8. Test edit and delete functionality

## Dependencies Added

### Frontend
- `@heroicons/react`: For goal-related icons

### Backend
- No new dependencies required (uses existing packages)

## File Structure

```
backend/
├── models/
│   └── Goal.js (new)
├── routes/
│   └── goals.js (new)
└── server.js (updated)

frontend/
├── src/
│   ├── pages/
│   │   ├── Goals.js (new)
│   │   ├── GoalForm.js (new)
│   │   └── GoalDetail.js (new)
│   ├── components/
│   │   └── Navbar.js (updated)
│   ├── services/
│   │   └── api.js (updated)
│   └── App.js (updated)
└── package.json (updated)
```

The goal management feature is now fully integrated into the Employee Performance Validator application and ready for use! 