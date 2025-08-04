#!/bin/bash

echo "🚀 Starting Employee Performance Validator with Reverse Proxy..."
echo "=============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
}

# Function to wait for a service to be ready
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}⏳ Waiting for $service_name to be ready on port $port...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if check_port $port; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ $service_name failed to start within expected time${NC}"
    return 1
}

# Function to install nginx if not present
install_nginx() {
    if ! command -v nginx &> /dev/null; then
        echo -e "${YELLOW}⚠️  Installing nginx...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew install nginx
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            sudo apt-get update
            sudo apt-get install -y nginx
        else
            echo -e "${RED}❌ Unsupported operating system for automatic nginx installation${NC}"
            echo "Please install nginx manually and try again."
            exit 1
        fi
    fi
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}📡 Starting backend server...${NC}"
    cd backend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  Installing backend dependencies...${NC}"
        npm install
    fi
    
    # Start backend in background
    npm start > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    echo -e "${GREEN}✅ Backend started with PID: $BACKEND_PID${NC}"
    
    # Wait for backend to be ready
    if wait_for_service 5000 "Backend"; then
        return 0
    else
        return 1
    fi
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}🌐 Starting frontend server...${NC}"
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  Installing frontend dependencies...${NC}"
        npm install
    fi
    
    # Start frontend in background
    npm start > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    echo -e "${GREEN}✅ Frontend started with PID: $FRONTEND_PID${NC}"
    
    # Wait for frontend to be ready
    if wait_for_service 3000 "Frontend"; then
        return 0
    else
        return 1
    fi
}

# Function to start nginx
start_nginx() {
    echo -e "${BLUE}🔧 Starting nginx reverse proxy...${NC}"
    
    # Check if nginx config exists
    if [ ! -f "nginx.conf" ]; then
        echo -e "${RED}❌ nginx.conf not found. Please create the configuration file first.${NC}"
        return 1
    fi
    
    # Stop nginx if running
    if pgrep nginx > /dev/null; then
        echo -e "${YELLOW}⚠️  Stopping existing nginx process...${NC}"
        sudo nginx -s stop
    fi
    
    # Start nginx
    sudo nginx -c $(pwd)/nginx.conf
    NGINX_PID=$(pgrep nginx)
    
    if [ ! -z "$NGINX_PID" ]; then
        echo -e "${GREEN}✅ Nginx started with PID: $NGINX_PID${NC}"
        
        # Wait for nginx to be ready
        if wait_for_service 80 "Nginx"; then
            return 0
        else
            return 1
        fi
    else
        echo -e "${RED}❌ Failed to start nginx${NC}"
        return 1
    fi
}

# Function to stop all services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    
    # Stop nginx
    if pgrep nginx > /dev/null; then
        sudo nginx -s stop
        echo -e "${GREEN}✅ Nginx stopped${NC}"
    fi
    
    # Stop backend
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Backend stopped${NC}"
    fi
    
    # Stop frontend
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    fi
}

# Trap to stop services on script exit
trap stop_services EXIT

# Main execution
main() {
    # Install nginx if needed
    install_nginx
    
    # Start backend
    if ! start_backend; then
        echo -e "${RED}❌ Failed to start backend${NC}"
        exit 1
    fi
    
    # Start frontend
    if ! start_frontend; then
        echo -e "${RED}❌ Failed to start frontend${NC}"
        exit 1
    fi
    
    # Start nginx
    if ! start_nginx; then
        echo -e "${RED}❌ Failed to start nginx${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}🎉 All services started successfully!${NC}"
    echo -e "${BLUE}📱 Frontend: http://localhost${NC}"
    echo -e "${BLUE}🔧 Backend API: http://localhost/api${NC}"
    echo -e "${BLUE}🏥 Health Check: http://localhost/health${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
    
    # Keep script running
    while true; do
        sleep 1
    done
}

# Run main function
main 