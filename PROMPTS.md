# Employee Performance Validator - Build Prompts

This document contains a comprehensive set of prompts that would be needed to build the Employee Performance Validator application from scratch. The prompts are organized in logical development phases and can be used sequentially to create the complete application.

## Phase 1: Project Setup and Architecture

### 1.1 Project Initialization
```
Create a new MERN stack application called "Employee Performance Validator" with the following structure:
- Backend: Node.js with Express
- Frontend: React with modern tooling
- Database: MongoDB with Mongoose
- Authentication: JWT-based
- UI Framework: Tailwind CSS

The application should be a comprehensive employee performance management system with the following core features:
- Employee management (CRUD operations)
- Performance evaluations
- Goal management
- Advanced search and filtering
- Responsive design

Set up the basic project structure with proper folder organization for both frontend and backend.
```

### 1.2 Backend Setup
```
Set up the Node.js backend for the Employee Performance Validator with the following specifications:

Dependencies to include:
- express: Web framework
- mongoose: MongoDB ODM
- cors: Cross-origin resource sharing
- dotenv: Environment variables
- helmet: Security middleware
- morgan: HTTP request logger
- express-rate-limit: Rate limiting
- express-validator: Input validation
- jsonwebtoken: JWT authentication
- bcryptjs: Password hashing
- nodemon: Development server

Create the basic server.js file with:
- Express server setup
- Middleware configuration (CORS, helmet, morgan, rate limiting)
- Environment variable loading
- Basic error handling
- Health check endpoint

Set up package.json with proper scripts for development and production.
```

### 1.3 Frontend Setup
```
Set up the React frontend for the Employee Performance Validator with the following specifications:

Dependencies to include:
- react and react-dom
- react-router-dom: Client-side routing
- react-query: Data fetching and caching
- axios: HTTP client
- tailwindcss: Utility-first CSS framework
- lucide-react: Icon library
- @heroicons/react: Additional icon set
- react-hot-toast: Toast notifications
- react-hook-form: Form management
- clsx and tailwind-merge: Utility classes

Configure:
- Tailwind CSS with PostCSS
- React Router for navigation
- React Query for API state management
- Basic folder structure for components, pages, services, and hooks

Create the main App.js with routing setup and basic layout structure.
```

### 1.4 Database Design
```
Design the MongoDB database schema for the Employee Performance Validator with the following models:

1. User Model:
   - Fields: username, email, password (hashed), role, createdAt, updatedAt
   - Methods: password comparison, JWT token generation

2. Employee Model:
   - Fields: employeeId, firstName, lastName, email, phone, department, position, hireDate, isActive, createdAt, updatedAt
   - Virtual: fullName (firstName + lastName)
   - Indexes: employeeId (unique), email (unique), firstName, lastName

3. Performance Model:
   - Fields: employee (ref to Employee), evaluator (ref to User), evaluationDate, status (Draft/Submitted/Approved/Rejected), ratings (object), comments, createdAt, updatedAt
   - Status enum: Draft, Submitted, Approved, Rejected

4. Goal Model:
   - Fields: title, description, employee (ref to Employee), targetType (Quarterly/Annual), targetValue, currentValue, dueDate, status (In Progress/Completed/Overdue), createdAt, updatedAt
   - Status enum: In Progress, Completed, Overdue
   - TargetType enum: Quarterly, Annual

5. Competency Model:
   - Fields: name, description, category, level (Beginner/Intermediate/Advanced/Expert), createdAt, updatedAt

Include proper validation, indexes, and relationships between models.
```

## Phase 2: Authentication System

### 2.1 Authentication Backend
```
Implement JWT-based authentication system for the backend with the following features:

1. User Registration:
   - POST /api/auth/register
   - Validate: username (required, unique), email (required, unique, valid email), password (required, min 6 chars)
   - Hash password using bcryptjs
   - Create user and return JWT token

2. User Login:
   - POST /api/auth/login
   - Validate: email/username, password
   - Compare password hash
   - Return JWT token and user info

3. Authentication Middleware:
   - Verify JWT token from Authorization header
   - Extract user info and attach to request
   - Handle token expiration and invalid tokens

4. Protected Routes:
   - Apply auth middleware to all protected endpoints
   - Return 401 for unauthorized requests

5. User Profile:
   - GET /api/auth/profile (protected)
   - Return current user information

Include proper error handling, validation, and security measures.
```

### 2.2 Authentication Frontend
```
Implement authentication UI and logic for the React frontend:

1. Authentication Context:
   - Create AuthContext with user state management
   - Provide login, logout, and user state functions
   - Handle JWT token storage in localStorage
   - Auto-logout on token expiration

2. Login Page:
   - Form with email/username and password fields
   - Form validation using react-hook-form
   - Error handling and success messages
   - Redirect to dashboard on successful login

3. Register Page:
   - Form with username, email, and password fields
   - Password confirmation field
   - Form validation and error handling
   - Redirect to login on successful registration

4. Protected Routes:
   - Create PrivateRoute component
   - Redirect to login for unauthenticated users
   - Show loading state while checking authentication

5. Navigation:
   - Show/hide navigation based on auth status
   - Logout functionality
   - User profile display

Use react-hot-toast for notifications and proper error handling.
```

## Phase 3: Employee Management

### 3.1 Employee Backend API
```
Implement the employee management API endpoints:

1. GET /api/employees
   - Get all employees with pagination
   - Support search by firstName, lastName, fullName, email, employeeId
   - Support filtering by department, isActive status
   - Implement debounced search (3+ characters minimum)
   - Return paginated results with metadata

2. POST /api/employees
   - Create new employee
   - Validate: employeeId (unique), firstName, lastName, email (unique), phone, department, position, hireDate
   - Auto-generate employeeId if not provided
   - Return created employee

3. GET /api/employees/:id
   - Get employee by ID
   - Return 404 if not found

4. PUT /api/employees/:id
   - Update employee by ID
   - Validate same fields as creation
   - Return updated employee

5. DELETE /api/employees/:id
   - Soft delete employee (set isActive to false)
   - Return success message

Include proper validation, error handling, and search functionality with MongoDB text search.
```

### 3.2 Employee Frontend Pages
```
Create the employee management UI components:

1. Employees List Page:
   - Display employees in a responsive table/card layout
   - Search bar with debounced input (3+ characters)
   - Filter dropdowns for department and status
   - Pagination controls
   - Add new employee button
   - Edit and delete actions for each employee

2. Employee Form Component:
   - Reusable form for create/edit operations
   - Fields: employeeId, firstName, lastName, email, phone, department, position, hireDate
   - Form validation using react-hook-form
   - Submit and cancel buttons
   - Loading states and error handling

3. Employee Detail Page:
   - Display complete employee information
   - Show related performance evaluations and goals
   - Edit and delete buttons
   - Back to list navigation

4. Search and Filter:
   - Implement debounced search hook (500ms delay)
   - Search across firstName, lastName, fullName, email, employeeId
   - Filter by department and active status
   - Clear filters functionality

Use Tailwind CSS for styling, react-query for data fetching, and proper loading/error states.
```

## Phase 4: Performance Evaluation System

### 4.1 Performance Backend API
```
Implement the performance evaluation API endpoints:

1. GET /api/performance
   - Get all performance evaluations with pagination
   - Support search by employee name or evaluator name
   - Support filtering by status (Draft/Submitted/Approved/Rejected)
   - Include employee and evaluator details in response
   - Return paginated results

2. POST /api/performance
   - Create new performance evaluation
   - Validate: employee (required), evaluator (required), evaluationDate, ratings, comments
   - Ratings should be an object with criteria and scores
   - Set default status to "Draft"
   - Return created evaluation

3. GET /api/performance/:id
   - Get evaluation by ID with employee and evaluator details
   - Return 404 if not found

4. PUT /api/performance/:id
   - Update evaluation by ID
   - Validate same fields as creation
   - Allow status updates
   - Return updated evaluation

5. DELETE /api/performance/:id
   - Delete evaluation by ID
   - Return success message

Include proper validation, error handling, and relationship population.
```

### 4.2 Performance Frontend Pages
```
Create the performance evaluation UI components:

1. Performance List Page:
   - Display evaluations in a responsive layout
   - Search by employee or evaluator name
   - Filter by status (Draft/Submitted/Approved/Rejected)
   - Show employee name, evaluator, date, status, and overall rating
   - Add new evaluation button
   - Edit and delete actions

2. Performance Form Component:
   - Employee selection dropdown
   - Evaluator selection dropdown
   - Evaluation date picker
   - Rating criteria with score inputs (1-5 scale)
   - Comments textarea
   - Status selection (for updates)
   - Form validation and error handling

3. Performance Detail Page:
   - Display complete evaluation details
   - Show employee and evaluator information
   - Display all rating criteria with scores
   - Show comments and status
   - Edit and delete buttons
   - Status update functionality

4. Rating System:
   - Visual rating indicators (stars or progress bars)
   - Color-coded status badges
   - Overall score calculation
   - Rating criteria management

Use modern UI components, proper form validation, and responsive design.
```

## Phase 5: Goal Management System

### 5.1 Goal Backend API
```
Implement the goal management API endpoints:

1. GET /api/goals
   - Get all goals with pagination
   - Support search by goal title
   - Support filtering by targetType (Quarterly/Annual), status (In Progress/Completed/Overdue), employee
   - Include employee details in response
   - Return paginated results

2. POST /api/goals
   - Create new goal
   - Validate: title, description, employee (required), targetType, targetValue, dueDate
   - Set default status to "In Progress"
   - Set currentValue to 0
   - Return created goal

3. GET /api/goals/:id
   - Get goal by ID with employee details
   - Return 404 if not found

4. PUT /api/goals/:id
   - Update goal by ID
   - Validate same fields as creation
   - Allow status updates
   - Return updated goal

5. PATCH /api/goals/:id/progress
   - Update goal progress (currentValue)
   - Auto-update status based on progress and due date
   - Return updated goal

6. DELETE /api/goals/:id
   - Delete goal by ID
   - Return success message

7. GET /api/goals/employee/:employeeId
   - Get all goals for a specific employee
   - Include progress and status information

Include proper validation, status logic, and relationship population.
```

### 5.2 Goal Frontend Pages
```
Create the goal management UI components:

1. Goals List Page:
   - Display goals in a responsive layout
   - Search by goal title
   - Filter by targetType (Quarterly/Annual), status, and employee
   - Show title, employee, target type, progress, due date, and status
   - Add new goal button
   - Edit, delete, and update progress actions

2. Goal Form Component:
   - Title and description fields
   - Employee selection dropdown
   - Target type selection (Quarterly/Annual)
   - Target value input
   - Due date picker
   - Form validation and error handling

3. Goal Detail Page:
   - Display complete goal information
   - Show employee details
   - Display progress with visual indicator
   - Show target vs current values
   - Due date and status information
   - Progress update functionality
   - Edit and delete buttons

4. Progress Management:
   - Progress update modal/form
   - Visual progress indicators
   - Status auto-update based on progress
   - Overdue detection and highlighting

Use modern UI components, progress bars, and intuitive progress management.
```

## Phase 6: Advanced Search and Filtering

### 6.1 Search Implementation
```
Implement advanced search and filtering functionality:

1. Backend Search Features:
   - MongoDB text search for all entities
   - Debounced search with minimum character requirement (3+)
   - Multi-field search (names, emails, IDs, titles)
   - Case-insensitive search
   - Search result highlighting

2. Frontend Search Components:
   - Debounced search hook (500ms delay)
   - Search input with minimum character requirement
   - Search suggestions and autocomplete
   - Clear search functionality
   - Search result highlighting

3. Filter Implementation:
   - Dropdown filters for status, department, target type
   - Multi-select filters where appropriate
   - Clear all filters functionality
   - Filter state management
   - URL query parameter integration

4. Pagination:
   - Server-side pagination
   - Page size selection
   - Page navigation controls
   - Total count display
   - Loading states during pagination

Implement proper error handling and loading states for all search operations.
```

### 6.2 Search UI Components
```
Create reusable search and filter components:

1. SearchBar Component:
   - Debounced input with minimum character requirement
   - Search icon and clear button
   - Loading indicator during search
   - Placeholder text and accessibility

2. FilterDropdown Component:
   - Reusable dropdown for various filter types
   - Multi-select capability
   - Clear individual filters
   - Filter count badges

3. Pagination Component:
   - Page navigation controls
   - Page size selector
   - Total results display
   - First/previous/next/last buttons
   - Current page indicator

4. SearchResults Component:
   - Display search results with highlighting
   - Empty state when no results
   - Loading skeleton during search
   - Result count display

Use consistent styling with Tailwind CSS and proper accessibility features.
```

## Phase 7: UI/UX and Styling

### 7.1 Navigation and Layout
```
Create the main navigation and layout components:

1. Navbar Component:
   - Application logo and title
   - Navigation menu items
   - User profile dropdown
   - Logout functionality
   - Responsive mobile menu
   - Active page highlighting

2. Layout Component:
   - Main application layout wrapper
   - Sidebar navigation (optional)
   - Content area with proper spacing
   - Footer component
   - Responsive design

3. Dashboard Page:
   - Overview of key metrics
   - Quick access to main features
   - Recent activities
   - Status summaries
   - Navigation cards

4. Responsive Design:
   - Mobile-first approach
   - Tablet and desktop layouts
   - Touch-friendly interactions
   - Proper spacing and typography

Use Tailwind CSS for consistent styling and modern design patterns.
```

### 7.2 Component Library
```
Create a reusable component library:

1. Button Components:
   - Primary, secondary, danger button variants
   - Loading states
   - Disabled states
   - Icon support
   - Different sizes

2. Form Components:
   - Input fields with validation states
   - Select dropdowns
   - Date pickers
   - Textarea components
   - Form field wrappers

3. Card Components:
   - Content cards
   - Action cards
   - Status cards
   - Loading skeleton cards

4. Modal Components:
   - Confirmation dialogs
   - Form modals
   - Alert modals
   - Loading modals

5. Table Components:
   - Data tables
   - Sortable columns
   - Row actions
   - Empty states
   - Loading states

Use consistent design tokens and proper accessibility features.
```

## Phase 8: Error Handling and Validation

### 8.1 Backend Error Handling
```
Implement comprehensive error handling:

1. Global Error Middleware:
   - Catch all unhandled errors
   - Format error responses consistently
   - Log errors for debugging
   - Handle different error types

2. Validation Middleware:
   - Input validation using express-validator
   - Custom validation rules
   - Validation error formatting
   - Sanitization of inputs

3. Database Error Handling:
   - MongoDB connection errors
   - Duplicate key errors
   - Validation errors
   - Connection timeout handling

4. Authentication Error Handling:
   - Invalid token errors
   - Expired token errors
   - Missing token errors
   - Permission denied errors

5. Rate Limiting:
   - Configure rate limiting middleware
   - Custom rate limit responses
   - Rate limit headers

Implement proper HTTP status codes and error messages.
```

### 8.2 Frontend Error Handling
```
Implement frontend error handling and user feedback:

1. Error Boundaries:
   - React error boundaries for component errors
   - Fallback UI components
   - Error reporting

2. API Error Handling:
   - Axios interceptors for error handling
   - Network error handling
   - Server error handling
   - Timeout handling

3. Form Validation:
   - Client-side validation
   - Server-side validation display
   - Field-level error messages
   - Form-level error messages

4. Toast Notifications:
   - Success messages
   - Error messages
   - Warning messages
   - Info messages
   - Auto-dismiss functionality

5. Loading States:
   - Page loading indicators
   - Button loading states
   - Skeleton loading components
   - Progress indicators

Use react-hot-toast for notifications and proper error state management.
```

## Phase 9: Security and Performance

### 9.1 Security Implementation
```
Implement security measures:

1. Authentication Security:
   - JWT token expiration
   - Secure token storage
   - Password strength requirements
   - Account lockout mechanisms

2. Input Security:
   - Input sanitization
   - SQL injection prevention
   - XSS prevention
   - CSRF protection

3. API Security:
   - Rate limiting
   - Request size limits
   - CORS configuration
   - Security headers

4. Data Security:
   - Sensitive data encryption
   - Secure password hashing
   - Data validation
   - Access control

5. Environment Security:
   - Environment variable management
   - Secret management
   - Production security settings

Implement security best practices and regular security audits.
```

### 9.2 Performance Optimization
```
Implement performance optimizations:

1. Backend Performance:
   - Database indexing
   - Query optimization
   - Caching strategies
   - Response compression

2. Frontend Performance:
   - Code splitting
   - Lazy loading
   - Image optimization
   - Bundle optimization

3. API Performance:
   - Pagination
   - Selective field loading
   - Response caching
   - Database connection pooling

4. Search Performance:
   - Debounced search
   - Search result caching
   - Index optimization
   - Query optimization

5. Loading Performance:
   - Skeleton loading
   - Progressive loading
   - Optimistic updates
   - Background data fetching

Use React Query for caching and performance optimization.
```

## Phase 10: Testing and Documentation

### 10.1 Testing Setup
```
Set up testing infrastructure:

1. Backend Testing:
   - Unit tests for models and utilities
   - Integration tests for API endpoints
   - Authentication tests
   - Database tests

2. Frontend Testing:
   - Component unit tests
   - Integration tests
   - User interaction tests
   - API integration tests

3. E2E Testing:
   - Complete user workflows
   - Critical path testing
   - Cross-browser testing
   - Performance testing

4. Test Data:
   - Seed data for testing
   - Mock data for development
   - Test fixtures
   - Test utilities

Set up testing frameworks and CI/CD pipeline.
```

### 10.2 Documentation
```
Create comprehensive documentation:

1. API Documentation:
   - Endpoint documentation
   - Request/response examples
   - Authentication documentation
   - Error code documentation

2. User Documentation:
   - User guides
   - Feature documentation
   - Troubleshooting guides
   - FAQ section

3. Developer Documentation:
   - Setup instructions
   - Architecture documentation
   - Code style guide
   - Contributing guidelines

4. Deployment Documentation:
   - Production deployment guide
   - Environment setup
   - Monitoring and logging
   - Backup and recovery

Create clear and comprehensive documentation for all stakeholders.
```

## Phase 11: Deployment and DevOps

### 11.1 Docker Configuration
```
Set up Docker configuration:

1. Backend Dockerfile:
   - Multi-stage build
   - Production dependencies
   - Environment configuration
   - Health checks

2. Frontend Dockerfile:
   - Build optimization
   - Nginx configuration
   - Static file serving
   - Environment variables

3. Docker Compose:
   - Multi-service setup
   - Network configuration
   - Volume management
   - Environment variables

4. Production Configuration:
   - Environment-specific configs
   - SSL certificate setup
   - Reverse proxy configuration
   - Monitoring setup

Create production-ready Docker configuration with proper security and performance.
```

### 11.2 Deployment Scripts
```
Create deployment automation:

1. Build Scripts:
   - Frontend build process
   - Backend build process
   - Asset optimization
   - Environment configuration

2. Deployment Scripts:
   - Production deployment
   - Database migrations
   - Environment setup
   - Health checks

3. Monitoring Scripts:
   - Application monitoring
   - Database monitoring
   - Performance monitoring
   - Error tracking

4. Backup Scripts:
   - Database backups
   - File backups
   - Configuration backups
   - Recovery procedures

Create automated deployment and maintenance scripts.
```

## Phase 12: Final Polish and Optimization

### 12.1 Code Quality
```
Implement code quality measures:

1. Code Formatting:
   - ESLint configuration
   - Prettier setup
   - Code style enforcement
   - Pre-commit hooks

2. Code Review:
   - Review guidelines
   - Quality checklists
   - Performance review
   - Security review

3. Refactoring:
   - Code optimization
   - Performance improvements
   - Security enhancements
   - Maintainability improvements

4. Documentation Updates:
   - Code documentation
   - API documentation
   - User documentation
   - Deployment documentation

Ensure high code quality and maintainability.
```

### 12.2 Final Testing
```
Conduct comprehensive testing:

1. Functional Testing:
   - All user workflows
   - Edge cases
   - Error scenarios
   - Performance under load

2. Security Testing:
   - Authentication testing
   - Authorization testing
   - Input validation testing
   - Vulnerability scanning

3. Performance Testing:
   - Load testing
   - Stress testing
   - Database performance
   - Frontend performance

4. User Acceptance Testing:
   - User feedback
   - Usability testing
   - Accessibility testing
   - Cross-browser testing

Ensure the application is production-ready and meets all requirements.
```

---

## Usage Instructions

1. **Sequential Execution**: Follow the prompts in order from Phase 1 to Phase 12
2. **Customization**: Modify prompts based on specific requirements
3. **Iteration**: Each phase can be iterated upon based on feedback
4. **Testing**: Test each phase before moving to the next
5. **Documentation**: Update documentation as you progress

## Notes

- Each prompt can be used independently or as part of the complete sequence
- Modify prompts based on specific business requirements
- Consider adding additional prompts for specific features
- Test thoroughly after each phase
- Maintain code quality and documentation throughout the process
