# API Documentation

This document provides comprehensive API documentation for the Employee Performance Validator application.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Postman Collection](#postman-collection)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## 🚀 Quick Start

### Prerequisites
- Backend server running on `http://localhost:5000`
- MongoDB database connected
- Valid user account

### Base URL
```
http://localhost:5000/api
```

### Authentication
All API endpoints (except registration and login) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🔐 Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "admin@company.com",
  "email": "admin@company.com",
  "password": "admin123",
  "firstName": "Admin",
  "lastName": "User"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "username": "admin@company.com",
    "email": "admin@company.com",
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "username": "admin@company.com",
    "email": "admin@company.com",
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

## 👥 Employees

### Get All Employees
```http
GET /api/employees?search=john&department=Engineering&page=1&limit=10
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `search` (optional): Search by name, email, or employee ID
- `department` (optional): Filter by department
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

### Create Employee
```http
POST /api/employees
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "employeeId": "EMP001",
  "email": "john.doe@company.com",
  "phone": "+1234567890",
  "department": "Engineering",
  "position": "Software Engineer",
  "hireDate": "2023-01-15",
  "manager": "manager_id_here"
}
```

### Get Employee by ID
```http
GET /api/employees/:id
Authorization: Bearer <jwt-token>
```

### Update Employee
```http
PUT /api/employees/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "position": "Senior Software Engineer",
  "department": "Engineering",
  "phone": "+1234567891"
}
```

### Delete Employee
```http
DELETE /api/employees/:id
Authorization: Bearer <jwt-token>
```

## 📊 Performance Evaluations

### Get All Evaluations
```http
GET /api/performance?search=john&status=submitted&page=1&limit=10
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `search` (optional): Search by employee or evaluator name
- `status` (optional): Filter by status (draft, submitted, approved, rejected)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

### Create Evaluation
```http
POST /api/performance
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "employee": "employee_id",
  "evaluator": "evaluator_id",
  "evaluationPeriod": {
    "startDate": "2024-01-01",
    "endDate": "2024-03-31"
  },
  "overallRating": 4,
  "status": "draft",
  "comments": "Excellent performance during Q1 2024.",
  "evaluationDate": "2024-03-31"
}
```

### Get Evaluation by ID
```http
GET /api/performance/:id
Authorization: Bearer <jwt-token>
```

### Update Evaluation
```http
PUT /api/performance/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "overallRating": 5,
  "status": "submitted",
  "comments": "Updated comments with additional feedback."
}
```

### Delete Evaluation
```http
DELETE /api/performance/:id
Authorization: Bearer <jwt-token>
```

## 🎯 Goals

### Get All Goals
```http
GET /api/goals?search=project&targetType=quarterly&page=1&limit=10
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `search` (optional): Search by goal title
- `targetType` (optional): Filter by target type (quarterly, annual)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

### Create Goal
```http
POST /api/goals
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Complete Project Alpha",
  "targetType": "quarterly",
  "dueDate": "2024-06-30",
  "progress": 0
}
```

### Get Goal by ID
```http
GET /api/goals/:id
Authorization: Bearer <jwt-token>
```

### Update Goal
```http
PUT /api/goals/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Updated Project Alpha Goal",
  "dueDate": "2024-07-15",
  "progress": 50
}
```

### Update Goal Progress
```http
PATCH /api/goals/:id/progress
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "progress": 75
}
```

### Get Goals by Employee
```http
GET /api/goals/employee/:employeeId
Authorization: Bearer <jwt-token>
```

### Delete Goal
```http
DELETE /api/goals/:id
Authorization: Bearer <jwt-token>
```

## 🧠 Competencies

### Get All Competencies
```http
GET /api/competencies?search=javascript&category=Technical&status=proficient&page=1&limit=10
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `search` (optional): Search by skill name
- `category` (optional): Filter by skill category
- `status` (optional): Filter by assessment status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

### Create Competency
```http
POST /api/competencies
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "employee": "employee_id",
  "skillName": "JavaScript",
  "category": "Technical",
  "currentLevel": 3,
  "targetLevel": 4,
  "assessmentDate": "2024-03-31",
  "nextReviewDate": "2024-06-30",
  "description": "JavaScript programming skills including ES6+ features",
  "evidence": "Successfully completed multiple JavaScript projects",
  "developmentPlan": "Focus on advanced JavaScript patterns and frameworks",
  "status": "developing",
  "assessedBy": "assessor_id"
}
```

### Get Competency by ID
```http
GET /api/competencies/:id
Authorization: Bearer <jwt-token>
```

### Update Competency
```http
PUT /api/competencies/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "currentLevel": 4,
  "status": "proficient",
  "evidence": "Updated evidence of advanced JavaScript skills",
  "nextReviewDate": "2024-09-30"
}
```

### Get Employee Competencies
```http
GET /api/competencies/employee/:employeeId
Authorization: Bearer <jwt-token>
```

### Get Competency Statistics
```http
GET /api/competencies/stats/overview
Authorization: Bearer <jwt-token>
```

### Delete Competency
```http
DELETE /api/competencies/:id
Authorization: Bearer <jwt-token>
```

## 📦 Postman Collection

### Import Instructions

1. **Import Collection:**
   - Open Postman
   - Click "Import" button
   - Select `Employee_Performance_Validator_API.postman_collection.json`

2. **Import Environment:**
   - Click "Import" button again
   - Select `Employee_Performance_Validator_Environment.postman_environment.json`

3. **Set Environment:**
   - Select "Employee Performance Validator Environment" from the environment dropdown

4. **Update Base URL:**
   - If your server runs on a different port, update the `baseUrl` variable

### Using the Collection

1. **Start with Authentication:**
   - Run "Register User" to create an account
   - Run "Login User" to get an authentication token
   - The token will be automatically saved to the environment

2. **Test Employee Operations:**
   - Create an employee using "Create Employee"
   - Copy the returned employee ID to the `employeeId` environment variable
   - Test other employee endpoints

3. **Test Other Features:**
   - Follow the same pattern for performance evaluations, goals, and competencies
   - Update environment variables with returned IDs for related operations

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `baseUrl` | API base URL | `http://localhost:5000` |
| `authToken` | JWT authentication token | `eyJhbGciOiJIUzI1NiIs...` |
| `userId` | Current user ID | `507f1f77bcf86cd799439011` |
| `employeeId` | Employee ID for testing | `507f1f77bcf86cd799439012` |
| `managerId` | Manager ID for employee creation | `507f1f77bcf86cd799439013` |
| `evaluatorId` | Evaluator ID for performance reviews | `507f1f77bcf86cd799439014` |
| `goalId` | Goal ID for testing | `507f1f77bcf86cd799439015` |
| `evaluationId` | Evaluation ID for testing | `507f1f77bcf86cd799439016` |
| `competencyId` | Competency ID for testing | `507f1f77bcf86cd799439017` |
| `assessorId` | Assessor ID for competencies | `507f1f77bcf86cd799439018` |

## ⚠️ Error Handling

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate data (e.g., duplicate email) |
| 422 | Unprocessable Entity - Validation errors |
| 500 | Internal Server Error |

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 🚦 Rate Limiting

The API implements rate limiting to prevent abuse:
- **Authentication endpoints**: 5 requests per minute
- **Other endpoints**: 100 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔍 Search Features

### Employee Search
- Search by first name, last name, full name, email, or employee ID
- Full name search supports "John Doe" format
- Department filtering available

### Performance Search
- Search by employee name or evaluator name
- Status filtering (draft, submitted, approved, rejected)

### Goal Search
- Search by goal title
- Filter by target type (quarterly, annual)
- Filter by status (in-progress, completed, overdue)

### Competency Search
- Search by skill name
- Filter by category (Technical, Soft Skills, Leadership, etc.)
- Filter by status (developing, proficient, expert, needs improvement)

## 📝 Data Models

### Employee Model
```javascript
{
  _id: ObjectId,
  firstName: String (required),
  lastName: String (required),
  employeeId: String (required, unique),
  email: String (required, unique),
  phone: String,
  department: String (required),
  position: String (required),
  hireDate: Date (required),
  manager: ObjectId (reference to Employee),
  isActive: Boolean (soft delete),
  createdAt: Date,
  updatedAt: Date
}
```

### Performance Model
```javascript
{
  _id: ObjectId,
  employee: ObjectId (reference to Employee),
  evaluator: ObjectId (reference to Employee),
  evaluationPeriod: {
    startDate: Date,
    endDate: Date
  },
  overallRating: Number (1-5),
  status: String (draft, submitted, approved, rejected),
  comments: String,
  evaluationDate: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Goal Model
```javascript
{
  _id: ObjectId,
  title: String (required),
  targetType: String (quarterly, annual),
  dueDate: Date (required),
  progress: Number (0-100),
  user: ObjectId (reference to User),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Competency Model
```javascript
{
  _id: ObjectId,
  employee: ObjectId (reference to Employee),
  skillName: String (required),
  category: String (required),
  currentLevel: Number (1-5),
  targetLevel: Number (1-5),
  assessmentDate: Date,
  nextReviewDate: Date,
  description: String,
  evidence: String,
  developmentPlan: String,
  status: String,
  assessedBy: ObjectId (reference to User),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🛠️ Development

### Testing the API

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Import Postman collection and environment**

3. **Test authentication flow:**
   - Register a user
   - Login to get token
   - Test protected endpoints

4. **Test CRUD operations:**
   - Create test data
   - Verify responses
   - Test error scenarios

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for your frontend domain
2. **Authentication Errors**: Check token format and expiration
3. **Validation Errors**: Review required fields and data types
4. **Database Errors**: Ensure MongoDB is running and accessible

## 📞 Support

For API support and questions:
1. Check the error messages in responses
2. Review the data models and validation rules
3. Test with the provided Postman collection
4. Check server logs for detailed error information 