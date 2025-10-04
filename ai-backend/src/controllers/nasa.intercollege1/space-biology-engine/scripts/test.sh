#!/bin/bash

# Space Biology Knowledge Engine Testing Script
echo "🧪 Testing Space Biology Knowledge Engine..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_status="$3"
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        if [ "$expected_status" = "0" ]; then
            echo -e "${GREEN}✅ PASSED${NC}"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}❌ FAILED (expected failure but got success)${NC}"
            ((TESTS_FAILED++))
        fi
    else
        if [ "$expected_status" = "1" ]; then
            echo -e "${GREEN}✅ PASSED (expected failure)${NC}"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}❌ FAILED${NC}"
            ((TESTS_FAILED++))
        fi
    fi
}

# Function to test HTTP endpoint
test_endpoint() {
    local endpoint="$1"
    local expected_status="$2"
    local test_name="$3"
    
    echo -n "Testing $test_name... "
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint")
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSED (HTTP $status_code)${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED (Expected HTTP $expected_status, got $status_code)${NC}"
        ((TESTS_FAILED++))
    fi
}

echo "🔍 Starting comprehensive tests..."
echo ""

# Test 1: Check if Docker is running
echo "📦 Docker Tests"
run_test "Docker installation" "docker --version" "0"
run_test "Docker Compose installation" "docker-compose --version" "0"

echo ""

# Test 2: Check if services are running
echo "🐳 Service Health Tests"
test_endpoint "http://localhost:5000/health" "200" "Backend Health Check"
test_endpoint "http://localhost:3000" "200" "Frontend Accessibility"
test_endpoint "http://localhost:8000/api/v1/heartbeat" "200" "ChromaDB Health Check"

echo ""

# Test 3: Database connectivity
echo "🗄️ Database Tests"
run_test "PostgreSQL connection" "docker-compose exec -T postgres pg_isready -U postgres" "0"

echo ""

# Test 4: API Endpoints
echo "🔌 API Endpoint Tests"
test_endpoint "http://localhost:5000/api/search?q=space" "200" "Search API"
test_endpoint "http://localhost:5000/api/publications" "200" "Publications API"
test_endpoint "http://localhost:5000/api/knowledge-graph/publications" "200" "Knowledge Graph API"

# Test authentication endpoints (these might return 401 which is expected)
test_endpoint "http://localhost:5000/api/auth/me" "401" "Auth Check (Unauthorized)"

echo ""

# Test 5: Frontend Routes
echo "🌐 Frontend Route Tests"
test_endpoint "http://localhost:3000/" "200" "Landing Page"
test_endpoint "http://localhost:3000/auth/login" "200" "Login Page"
test_endpoint "http://localhost:3000/dashboard" "200" "Dashboard Page"
test_endpoint "http://localhost:3000/knowledge-graph" "200" "Knowledge Graph Page"

echo ""

# Test 6: File System Tests
echo "📁 File System Tests"
run_test "Backend uploads directory" "test -d backend/uploads" "0"
run_test "Backend node_modules" "test -d backend/node_modules" "0"
run_test "Frontend node_modules" "test -d frontend/node_modules" "0"

echo ""

# Test 7: Environment Configuration
echo "⚙️ Configuration Tests"
run_test "Backend .env file" "test -f backend/.env" "0"
run_test "Frontend .env.local file" "test -f frontend/.env.local || test -f frontend/.env" "0"

echo ""

# Test 8: Build Tests
echo "🔨 Build Tests"
echo "Testing backend build..."
cd backend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend build PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Backend build FAILED${NC}"
    ((TESTS_FAILED++))
fi

cd ../frontend
echo "Testing frontend build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend build PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Frontend build FAILED${NC}"
    ((TESTS_FAILED++))
fi

cd ..

echo ""

# Test 9: API Integration Tests
echo "🔗 Integration Tests"

# Test search functionality
echo "Testing search integration..."
search_response=$(curl -s "http://localhost:5000/api/search?q=biology&limit=5")
if echo "$search_response" | grep -q "success"; then
    echo -e "${GREEN}✅ Search integration PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Search integration FAILED${NC}"
    ((TESTS_FAILED++))
fi

# Test knowledge graph
echo "Testing knowledge graph integration..."
kg_response=$(curl -s "http://localhost:5000/api/knowledge-graph/publications?limit=10")
if echo "$kg_response" | grep -q "nodes"; then
    echo -e "${GREEN}✅ Knowledge graph integration PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Knowledge graph integration FAILED${NC}"
    ((TESTS_FAILED++))
fi

echo ""

# Test 10: Performance Tests
echo "⚡ Performance Tests"

# Test API response time
echo "Testing API response time..."
response_time=$(curl -s -w "%{time_total}" -o /dev/null "http://localhost:5000/health")
if (( $(echo "$response_time < 2.0" | bc -l) )); then
    echo -e "${GREEN}✅ API response time PASSED (${response_time}s)${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️ API response time SLOW (${response_time}s)${NC}"
    ((TESTS_FAILED++))
fi

# Test frontend response time
echo "Testing frontend response time..."
response_time=$(curl -s -w "%{time_total}" -o /dev/null "http://localhost:3000")
if (( $(echo "$response_time < 3.0" | bc -l) )); then
    echo -e "${GREEN}✅ Frontend response time PASSED (${response_time}s)${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️ Frontend response time SLOW (${response_time}s)${NC}"
    ((TESTS_FAILED++))
fi

echo ""

# Final Results
echo "📊 Test Results Summary"
echo "===================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}All tests passed! Your Space Biology Knowledge Engine is ready to go!${NC}"
    exit 0
else
    echo -e "\n⚠️ ${YELLOW}Some tests failed. Please check the issues above.${NC}"
    echo ""
    echo "Common solutions:"
    echo "1. Make sure all services are running: docker-compose up -d"
    echo "2. Wait for services to fully start (may take 1-2 minutes)"
    echo "3. Check service logs: docker-compose logs [service-name]"
    echo "4. Verify environment configuration"
    echo "5. Ensure all dependencies are installed"
    exit 1
fi
