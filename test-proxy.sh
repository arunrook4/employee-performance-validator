#!/bin/bash

echo "🧪 Testing Reverse Proxy Setup..."
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=$3
    
    echo -e "${BLUE}Testing: $description${NC}"
    echo -e "URL: $url"
    
    # Make request and capture status code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ Success! Status: $status_code${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed! Expected: $expected_status, Got: $status_code${NC}"
        return 1
    fi
}

# Function to test API endpoint
test_api_endpoint() {
    local url=$1
    local description=$2
    
    echo -e "${BLUE}Testing: $description${NC}"
    echo -e "URL: $url"
    
    # Make request and capture response
    response=$(curl -s "$url")
    
    if [ $? -eq 0 ] && [ ! -z "$response" ]; then
        echo -e "${GREEN}✅ Success! Response received${NC}"
        echo -e "${YELLOW}Response: $response${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed! No response or error${NC}"
        return 1
    fi
}

# Check if services are running
echo -e "${YELLOW}Checking if services are running...${NC}"

# Check nginx
if pgrep nginx > /dev/null; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx is not running${NC}"
    exit 1
fi

# Check backend
if lsof -i :5000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on port 5000${NC}"
else
    echo -e "${RED}❌ Backend is not running on port 5000${NC}"
    exit 1
fi

# Check frontend
if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running on port 3000${NC}"
else
    echo -e "${RED}❌ Frontend is not running on port 3000${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Testing endpoints...${NC}"
echo ""

# Test frontend
test_endpoint "http://localhost" "Frontend (React App)" "200"

# Test backend health check
test_api_endpoint "http://localhost/health" "Backend Health Check"

# Test backend API root
test_api_endpoint "http://localhost/api" "Backend API Root"

# Test specific API endpoints
test_endpoint "http://localhost/api/auth" "Auth API" "404"  # Should return 404 for GET without auth

echo ""
echo -e "${GREEN}🎉 Reverse proxy test completed!${NC}"
echo ""
echo -e "${BLUE}Access your application at:${NC}"
echo -e "  📱 Frontend: http://localhost"
echo -e "  🔧 Backend API: http://localhost/api"
echo -e "  🏥 Health Check: http://localhost/health" 