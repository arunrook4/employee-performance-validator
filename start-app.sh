#!/bin/bash

echo "🚀 Starting Employee Performance Validator Application..."
echo "=================================================="

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

# Function to start ngrok
start_ngrok() {
    echo -e "${BLUE}🔗 Starting ngrok tunnels...${NC}"
    
    # Check if ngrok is installed
    if ! command -v ngrok &> /dev/null; then
        echo -e "${RED}❌ ngrok is not installed. Please install it first:${NC}"
        echo "   npm install -g ngrok"
        echo "   or visit: https://ngrok.com/download"
        return 1
    fi
    
    # Start ngrok with all tunnels
    ngrok start --all > ngrok.log 2>&1 &
    NGROK_PID=$!
    
    echo -e "${GREEN}✅ Ngrok started with PID: $NGROK_PID${NC}"
    
    # Wait a moment for ngrok to start
    sleep 5
    
    # Display ngrok URLs
    echo -e "${BLUE}📊 Checking ngrok URLs...${NC}"
    sleep 3
    
    if [ -f "ngrok.log" ]; then
        echo -e "${GREEN}🌍 Ngrok URLs:${NC}"
        grep -o "https://[a-zA-Z0-9.-]*\.ngrok-free\.app" ngrok.log | head -2
        echo ""
        echo -e "${BLUE}📊 Ngrok Web Interface: http://localhost:4040${NC}"
    fi
    
    return 0
}

# Function to display final status
display_status() {
    echo ""
    echo -e "${GREEN}🎉 Application is now running!${NC}"
    echo "=================================================="
    echo ""
    echo -e "${BLUE}📡 Backend:${NC}"
    echo "   - Local: http://localhost:5000"
    echo "   - Logs: backend.log"
    echo ""
    echo -e "${BLUE}🌐 Frontend:${NC}"
    echo "   - Local: http://localhost:3000"
    echo "   - Logs: frontend.log"
    echo ""
    echo -e "${BLUE}🔗 Ngrok:${NC}"
    echo "   - Web Interface: http://localhost:4040"
    echo "   - Logs: ngrok.log"
    echo ""
    echo -e "${YELLOW}💡 To stop all services, run: pkill -f 'ngrok\|node'${NC}"
    echo -e "${YELLOW}💡 Or press Ctrl+C to stop this script${NC}"
    echo ""
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping all services...${NC}"
    pkill -f "ngrok" 2>/dev/null
    pkill -f "node.*5000" 2>/dev/null
    pkill -f "node.*3000" 2>/dev/null
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    # Check if ports are already in use
    if check_port 5000; then
        echo -e "${YELLOW}⚠️  Port 5000 is already in use. Backend might already be running.${NC}"
    fi
    
    if check_port 3000; then
        echo -e "${YELLOW}⚠️  Port 3000 is already in use. Frontend might already be running.${NC}"
    fi
    
    # Start services
    if start_backend; then
        if start_frontend; then
            if start_ngrok; then
                display_status
                
                # Keep script running
                echo -e "${BLUE}🔄 Services are running. Press Ctrl+C to stop all services...${NC}"
                wait
            else
                echo -e "${RED}❌ Failed to start ngrok${NC}"
                cleanup
            fi
        else
            echo -e "${RED}❌ Failed to start frontend${NC}"
            cleanup
        fi
    else
        echo -e "${RED}❌ Failed to start backend${NC}"
        cleanup
    fi
}

# Run main function
main 