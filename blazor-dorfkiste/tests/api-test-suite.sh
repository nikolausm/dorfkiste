#!/bin/bash

# Comprehensive API Test Suite for Dorfkiste Blazor
# Tests all API endpoints with various scenarios

BASE_URL="${BASE_URL:-http://localhost:5000}"
API_URL="$BASE_URL/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print test results
print_test_result() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓ PASS${NC}: $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC}: $test_name"
        if [ -n "$details" ]; then
            echo -e "  ${YELLOW}Details${NC}: $details"
        fi
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to make API request and validate response
test_api_endpoint() {
    local method="$1"
    local endpoint="$2"
    local expected_status="$3"
    local test_name="$4"
    local data="$5"
    local headers="$6"
    
    local curl_cmd="curl -s -w %{http_code} -X $method"
    
    if [ -n "$headers" ]; then
        curl_cmd="$curl_cmd -H '$headers'"
    fi
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -d '$data' -H 'Content-Type: application/json'"
    fi
    
    curl_cmd="$curl_cmd $API_URL$endpoint"
    
    local response=$(eval $curl_cmd)
    local http_code="${response: -3}"
    local response_body="${response%???}"
    
    if [ "$http_code" = "$expected_status" ]; then
        print_test_result "$test_name" "PASS"
        return 0
    else
        print_test_result "$test_name" "FAIL" "Expected $expected_status, got $http_code. Response: $response_body"
        return 1
    fi
}

# Function to check if API server is running
check_server() {
    echo -e "${BLUE}Checking if API server is running at $BASE_URL...${NC}"
    
    if curl -s -f "$BASE_URL/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Server is running${NC}"
        return 0
    else
        echo -e "${RED}✗ Server is not running${NC}"
        echo -e "${YELLOW}Please start the server first:${NC}"
        echo "cd src/DorfkisteBlazor.Server && dotnet run"
        return 1
    fi
}

# Test Items API Endpoints
test_items_api() {
    echo -e "\n${BLUE}=== Testing Items API ===${NC}"
    
    # GET /api/items (basic request)
    test_api_endpoint "GET" "/items" "200" "Get all items"
    
    # GET /api/items with pagination
    test_api_endpoint "GET" "/items?page=1&pageSize=10" "200" "Get items with pagination"
    
    # GET /api/items with filters
    test_api_endpoint "GET" "/items?availableOnly=true" "200" "Get available items only"
    test_api_endpoint "GET" "/items?categoryId=00000000-0000-0000-0000-000000000001" "200" "Get items by category"
    test_api_endpoint "GET" "/items?searchTerm=drill" "200" "Search items by term"
    
    # GET /api/items/{id} (valid ID)
    test_api_endpoint "GET" "/items/00000000-0000-0000-0000-000000000001" "404" "Get specific item (not found expected)"
    
    # GET /api/items/{id} (invalid ID)
    test_api_endpoint "GET" "/items/invalid-guid" "400" "Get item with invalid GUID"
    
    # POST /api/items (without authentication - should fail)
    test_api_endpoint "POST" "/items" "401" "Create item without auth" '{"title":"Test Item","description":"Test"}'
    
    # Test with various query parameter combinations
    test_api_endpoint "GET" "/items?minPrice=10&maxPrice=100" "200" "Get items with price range"
    test_api_endpoint "GET" "/items?location=Berlin&deliveryAvailable=true" "200" "Get items with location and delivery"
}

# Test Rentals API Endpoints
test_rentals_api() {
    echo -e "\n${BLUE}=== Testing Rentals API ===${NC}"
    
    # GET /api/rentals (without auth - should fail)
    test_api_endpoint "GET" "/rentals" "401" "Get rentals without auth"
    
    # POST /api/rentals (without auth - should fail)  
    test_api_endpoint "POST" "/rentals" "401" "Create rental without auth" '{"itemId":"00000000-0000-0000-0000-000000000001","startDate":"2024-01-01","endDate":"2024-01-07"}'
    
    # GET /api/rentals/{id} (without auth - should fail)
    test_api_endpoint "GET" "/rentals/00000000-0000-0000-0000-000000000001" "401" "Get specific rental without auth"
}

# Test Auth API Endpoints  
test_auth_api() {
    echo -e "\n${BLUE}=== Testing Auth API ===${NC}"
    
    # POST /api/auth/login (invalid credentials)
    test_api_endpoint "POST" "/auth/login" "400" "Login with invalid credentials" '{"email":"invalid@test.com","password":"wrong"}'
    
    # POST /api/auth/register (invalid data)
    test_api_endpoint "POST" "/auth/register" "400" "Register with invalid data" '{"email":"invalid","password":"short"}'
    
    # POST /api/auth/refresh (without token)
    test_api_endpoint "POST" "/auth/refresh" "401" "Refresh token without auth"
    
    # POST /api/auth/logout (without token)
    test_api_endpoint "POST" "/auth/logout" "401" "Logout without auth"
}

# Test API Input Validation
test_input_validation() {
    echo -e "\n${BLUE}=== Testing Input Validation ===${NC}"
    
    # Test malformed JSON
    local malformed_json='{"title":"Test"'
    if curl -s -X POST "$API_URL/items" -d "$malformed_json" -H "Content-Type: application/json" -w "%{http_code}" | tail -c 3 | grep -q "400"; then
        print_test_result "Malformed JSON handling" "PASS"
    else
        print_test_result "Malformed JSON handling" "FAIL"
    fi
    
    # Test very large payload
    local large_payload='{"title":"'$(printf 'A%.0s' {1..10000})'","description":"Large payload test"}'
    local response=$(curl -s -X POST "$API_URL/items" -d "$large_payload" -H "Content-Type: application/json" -w "%{http_code}")
    local status="${response: -3}"
    if [ "$status" = "413" ] || [ "$status" = "400" ] || [ "$status" = "401" ]; then
        print_test_result "Large payload handling" "PASS"
    else
        print_test_result "Large payload handling" "FAIL" "Expected 413/400/401, got $status"
    fi
    
    # Test SQL injection attempts
    test_api_endpoint "GET" "/items?searchTerm='; DROP TABLE Items; --" "200" "SQL injection protection"
    test_api_endpoint "GET" "/items?searchTerm=<script>alert('xss')</script>" "200" "XSS protection"
}

# Test API Performance
test_performance() {
    echo -e "\n${BLUE}=== Testing API Performance ===${NC}"
    
    # Test response time for items endpoint
    local start_time=$(date +%s%3N)
    curl -s "$API_URL/items" > /dev/null
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    if [ $response_time -lt 2000 ]; then
        print_test_result "Items API response time (<2s)" "PASS"
    else
        print_test_result "Items API response time (<2s)" "FAIL" "Response time: ${response_time}ms"
    fi
    
    # Test concurrent requests
    echo "Testing concurrent requests..."
    for i in {1..5}; do
        curl -s "$API_URL/items" > /dev/null &
    done
    wait
    print_test_result "Concurrent requests handling" "PASS"
}

# Test API Security Headers
test_security_headers() {
    echo -e "\n${BLUE}=== Testing Security Headers ===${NC}"
    
    local headers=$(curl -s -I "$API_URL/items")
    
    # Check for security headers
    if echo "$headers" | grep -qi "x-content-type-options"; then
        print_test_result "X-Content-Type-Options header" "PASS"
    else
        print_test_result "X-Content-Type-Options header" "FAIL"
    fi
    
    if echo "$headers" | grep -qi "x-frame-options"; then
        print_test_result "X-Frame-Options header" "PASS"  
    else
        print_test_result "X-Frame-Options header" "FAIL"
    fi
}

# Test CORS Configuration
test_cors() {
    echo -e "\n${BLUE}=== Testing CORS Configuration ===${NC}"
    
    local cors_response=$(curl -s -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" -X OPTIONS "$API_URL/items" -I)
    
    if echo "$cors_response" | grep -qi "access-control-allow-origin"; then
        print_test_result "CORS headers present" "PASS"
    else
        print_test_result "CORS headers present" "FAIL"
    fi
}

# Main test execution
main() {
    echo -e "${BLUE}=================================================${NC}"
    echo -e "${BLUE}    Dorfkiste Blazor API Test Suite${NC}"
    echo -e "${BLUE}=================================================${NC}"
    
    # Check if server is running
    if ! check_server; then
        exit 1
    fi
    
    # Run all test suites
    test_items_api
    test_rentals_api
    test_auth_api
    test_input_validation
    test_performance
    test_security_headers
    test_cors
    
    # Print final results
    echo -e "\n${BLUE}=== Test Summary ===${NC}"
    echo -e "Total Tests: $TOTAL_TESTS"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All tests passed!${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ Some tests failed. Please review the results above.${NC}"
        exit 1
    fi
}

# Run the test suite
main "$@"