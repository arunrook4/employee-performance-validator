# Employee Performance Validator

A comprehensive MERN stack application for managing employee performance evaluations, goals, and employee records with advanced search and filtering capabilities.

## 🚀 Features

### Core Functionality
- **Employee Management**: Create, view, edit, and delete employee records
- **Performance Evaluations**: Comprehensive performance assessment system
- **Goal Management**: Set, track, and manage employee goals with progress updates
- **Advanced Search**: Debounced search with 3-character minimum across all modules
- **Responsive Design**: Modern UI built with Tailwind CSS

### Employee Features
- Complete employee profile management
- Department and position tracking
- Hire date and contact information
- Soft delete functionality
- Full name search capability

### Performance Evaluation Features
- Multi-criteria performance assessment
- Evaluator assignment system
- Status tracking (Draft, Submitted, Approved, Rejected)
- Rating system with visual indicators
- Employee and evaluator search

### Goal Management Features
- Goal creation with title, target type, and due dates
- Progress tracking with percentage updates
- Employee assignment for goals
- Status management (In Progress, Completed, Overdue)
- Target type categorization (Quarterly, Annual)

### Search & Filtering
- **Debounced Search**: 500ms delay to prevent excessive API calls
- **Minimum Character Requirement**: 3+ characters for search activation
- **Multi-field Search**: Search across names, emails, IDs, and titles
- **Filter Options**: Department, status, target type, and employee filters
- **Pagination**: Efficient data loading with page navigation

## 🛠️ Tech Stack

### Backend
- **Node.js** (v20.0.0+)
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logger
- **express-rate-limit** - Rate limiting

### Frontend
- **React** (v18.2.0) - UI library
- **React Router DOM** - Client-side routing
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Heroicons** - Additional icon set
- **React Hot Toast** - Toast notifications
- **React Hook Form** - Form management

## 📋 Prerequisites

- Node.js (v20.0.0 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd employee-performance-validator
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Environment Configuration
```bash
cp env.example .env
```

Edit the `.env` file with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/employee-performance-validator

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRE=30d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

## 🏃‍♂️ Running the Application

### Development Mode

#### Option 1: Standard Setup
1. **Start Backend Server**
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

2. **Start Frontend Development Server**
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`

#### Option 2: Reverse Proxy Setup (Recommended)
```bash
# Install nginx (if not already installed)
# macOS: brew install nginx
# Ubuntu: sudo apt-get install nginx

# Start with reverse proxy
./start-with-proxy.sh
```

**Benefits of Reverse Proxy Setup:**
- Single domain access (`http://localhost`)
- No CORS issues
- Better security and performance
- Production-ready configuration

For detailed reverse proxy setup instructions, see [REVERSE_PROXY_SETUP.md](REVERSE_PROXY_SETUP.md).

### Production Mode

1. **Build Frontend**
```bash
cd frontend
npm run build
```

2. **Start Production Server**
```bash
cd backend
npm start
```

### Docker Deployment
```bash
# Build and start all services
docker-compose up --build

# Access application at http://localhost
```

## 📁 Project Structure

```
employee-performance-validator/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Employee.js
│   │   ├── Performance.js
│   │   ├── Goal.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── employees.js
│   │   ├── performance.js
│   │   └── goals.js
│   ├── server.js
│   ├── package.json
│   └── env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── hooks/
│   │   │   └── useDebounce.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Employees.js
│   │   │   ├── EmployeeForm.js
│   │   │   ├── EmployeeDetail.js
│   │   │   ├── Performance.js
│   │   │   ├── PerformanceForm.js
│   │   │   ├── PerformanceDetail.js
│   │   │   ├── Goals.js
│   │   │   ├── GoalForm.js
│   │   │   ├── GoalDetail.js
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── README.md
└── .gitignore
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Employees
- `GET /api/employees` - Get all employees (with search/filter)
- `POST /api/employees` - Create new employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Performance Evaluations
- `GET /api/performance` - Get all evaluations (with search/filter)
- `POST /api/performance` - Create new evaluation
- `GET /api/performance/:id` - Get evaluation by ID
- `PUT /api/performance/:id` - Update evaluation
- `DELETE /api/performance/:id` - Delete evaluation

### Goals
- `GET /api/goals` - Get all goals (with search/filter)
- `POST /api/goals` - Create new goal
- `GET /api/goals/:id` - Get goal by ID
- `PUT /api/goals/:id` - Update goal
- `PATCH /api/goals/:id/progress` - Update goal progress
- `DELETE /api/goals/:id` - Delete goal
- `GET /api/goals/employee/:employeeId` - Get goals by employee

## 🔍 Search Features

### Employee Search
- Search by first name, last name, full name, email, or employee ID
- Full name search supports "John Doe" format
- Department filtering

### Performance Search
- Search by employee name or evaluator name
- Status filtering (Draft, Submitted, Approved, Rejected)

### Goal Search
- Search by goal title
- Filter by target type (Quarterly, Annual)
- Filter by status (In Progress, Completed, Overdue)
- Filter by assigned employee

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean interface with Tailwind CSS
- **Loading States**: Smooth loading indicators
- **Toast Notifications**: User feedback for actions
- **Pagination**: Efficient data navigation
- **Empty States**: Helpful messages when no data is found

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: express-validator for data validation
- **Rate Limiting**: Protection against abuse
- **CORS Configuration**: Secure cross-origin requests
- **Helmet**: Security headers

## 📚 Documentation

Detailed documentation for all features is available in the [`docs/`](docs/) folder:

- **[Features Overview](docs/README.md)** - Complete guide to all application features
- **[Employee Management](docs/features/EMPLOYEE_MANAGEMENT_FEATURE.md)** - Employee profile management and search
- **[Performance Evaluation](docs/features/PERFORMANCE_EVALUATION_FEATURE.md)** - Performance assessment system
- **[Goal Management](docs/features/GOALS_FEATURE.md)** - Goal creation and tracking
- **[Competencies & Skills](docs/features/COMPETENCIES_FEATURE.md)** - Skill assessment and development

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables for production
2. Configure MongoDB connection
3. Set up JWT secret
4. Deploy to your preferred hosting service

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure proxy settings if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

**Built with ❤️ using the MERN stack** 