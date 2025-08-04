# Reverse Proxy Setup Guide

This guide explains how to set up a reverse proxy using nginx to serve both the frontend and backend of the Employee Performance Validator application through a single domain.

## 🎯 Overview

The reverse proxy setup provides:
- **Single Domain Access**: Both frontend and backend served from `http://localhost`
- **No CORS Issues**: Eliminates cross-origin request problems
- **Better Security**: Centralized security headers and rate limiting
- **Performance**: Gzip compression and static asset caching
- **Production Ready**: Proper error handling and health checks

## 📁 Files Created

1. **`nginx.conf`** - Main nginx configuration
2. **`docker-compose.yml`** - Docker Compose configuration (optional)
3. **`backend/Dockerfile`** - Backend container configuration
4. **`frontend/Dockerfile`** - Frontend container configuration
5. **`frontend/nginx-spa.conf`** - Frontend-specific nginx config
6. **`start-with-proxy.sh`** - Updated start script with nginx support

## 🚀 Quick Start

### Option 1: Using the Start Script (Recommended)

1. **Install nginx** (if not already installed):
   ```bash
   # macOS
   brew install nginx
   
   # Ubuntu/Debian
   sudo apt-get update && sudo apt-get install -y nginx
   
   # CentOS/RHEL
   sudo yum install nginx
   ```

2. **Start the application with reverse proxy**:
   ```bash
   ./start-with-proxy.sh
   ```

3. **Access your application**:
   - Frontend: `http://localhost`
   - Backend API: `http://localhost/api`
   - Health Check: `http://localhost/health`

### Option 2: Using Docker Compose

1. **Build and start all services**:
   ```bash
   docker-compose up --build
   ```

2. **Access your application**:
   - Frontend: `http://localhost`
   - Backend API: `http://localhost/api`

## 🔧 Configuration Details

### Nginx Configuration (`nginx.conf`)

The nginx configuration includes:

- **Upstream Definitions**: Routes traffic to backend (port 5000) and frontend (port 3000)
- **API Routing**: All `/api/*` requests are proxied to the backend
- **Frontend Routing**: All other requests are proxied to the frontend
- **Security Headers**: XSS protection, content type options, frame options
- **Gzip Compression**: Reduces bandwidth usage
- **Static Asset Caching**: Improves performance for static files
- **CORS Handling**: Proper CORS headers for API requests

### Frontend Configuration

The frontend API configuration has been updated to:
- Use relative paths (`/api`) in production
- Fall back to `http://localhost:5000/api` in development
- Support environment variable overrides

### Backend Configuration

Added a health check endpoint at `/health` that returns:
- Service status
- Timestamp
- Uptime
- Environment information

## 🌐 URL Structure

With the reverse proxy, your application URLs become:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | `http://localhost` | React application |
| Backend API | `http://localhost/api` | All API endpoints |
| Health Check | `http://localhost/health` | Service health status |
| Auth API | `http://localhost/api/auth` | Authentication endpoints |
| Employees API | `http://localhost/api/employees` | Employee management |
| Performance API | `http://localhost/api/performance` | Performance reviews |
| Goals API | `http://localhost/api/goals` | Goal management |

## 🔒 Security Features

### Security Headers
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: XSS protection
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Content-Security-Policy**: Content security policy
- **Referrer-Policy**: Controls referrer information

### Rate Limiting
- Backend includes rate limiting (100 requests per 15 minutes per IP)
- Nginx can be configured for additional rate limiting

### CORS Configuration
- Proper CORS headers for API requests
- Preflight request handling
- Configurable origins

## 📊 Performance Features

### Gzip Compression
- Compresses text-based files (HTML, CSS, JS, JSON)
- Reduces bandwidth usage by 60-80%
- Configurable compression levels

### Static Asset Caching
- Static files cached for 1 year
- Immutable cache headers
- Improved loading times

### Load Balancing Ready
- Upstream definitions allow easy scaling
- Multiple backend/frontend instances can be added

## 🐳 Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- Environment variables set (MONGODB_URI, JWT_SECRET)

### Deployment Steps
1. **Set environment variables**:
   ```bash
   export MONGODB_URI="your_mongodb_connection_string"
   export JWT_SECRET="your_jwt_secret"
   ```

2. **Build and start services**:
   ```bash
   docker-compose up --build -d
   ```

3. **Check service status**:
   ```bash
   docker-compose ps
   ```

4. **View logs**:
   ```bash
   docker-compose logs -f
   ```

## 🔍 Troubleshooting

### Common Issues

1. **Port 80 already in use**:
   ```bash
   # Check what's using port 80
   sudo lsof -i :80
   
   # Stop conflicting service
   sudo nginx -s stop  # if nginx is running
   ```

2. **Permission denied for nginx**:
   ```bash
   # Make sure nginx.conf is readable
   chmod 644 nginx.conf
   
   # Check nginx configuration
   sudo nginx -t
   ```

3. **Services not starting**:
   ```bash
   # Check backend logs
   tail -f backend.log
   
   # Check frontend logs
   tail -f frontend.log
   
   # Check nginx logs
   sudo tail -f /var/log/nginx/error.log
   ```

### Health Checks

1. **Backend Health**:
   ```bash
   curl http://localhost/health
   ```

2. **Frontend Status**:
   ```bash
   curl http://localhost
   ```

3. **API Status**:
   ```bash
   curl http://localhost/api
   ```

## 🔄 Development vs Production

### Development Mode
- Uses `start-with-proxy.sh` script
- Runs services directly on host
- Hot reloading enabled
- Debug logging enabled

### Production Mode
- Uses Docker Compose
- Containerized services
- Optimized builds
- Production logging

## 📈 Monitoring

### Log Files
- **Backend**: `backend.log`
- **Frontend**: `frontend.log`
- **Nginx**: `/var/log/nginx/access.log` and `/var/log/nginx/error.log`

### Health Monitoring
- Health check endpoint: `http://localhost/health`
- Returns service status and uptime
- Can be used with monitoring tools

## 🚀 Next Steps

1. **SSL/HTTPS Setup**: Add SSL certificates for production
2. **Load Balancing**: Scale to multiple backend instances
3. **Monitoring**: Add application monitoring (Prometheus, Grafana)
4. **Logging**: Centralized logging with ELK stack
5. **CI/CD**: Automated deployment pipeline

## 📚 Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [React Production Build](https://create-react-app.dev/docs/production-build/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/) 