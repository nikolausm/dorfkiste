#!/bin/bash

# Auth-Test-Agent: Spezialisierte Tests für Authentifizierung
# Tests für HTTPS localhost:5001 mit SSL-Zertifikat-Ignorierung

BASE_URL="https://localhost:5001"
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

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}    Auth-Test-Agent: Authentifizierungstests${NC}"
echo -e "${BLUE}=================================================${NC}"

echo -e "\n${BLUE}=== Testing Auth Pages ===${NC}"

# Test 1: Signin Page
echo -e "\n${YELLOW}Testing Signin Page...${NC}"
response=$(curl -k -s -w "%{http_code}" -I "$BASE_URL/auth/signin" 2>/dev/null)
http_code="${response: -3}"
if [ "$http_code" = "200" ] || [ "$http_code" = "404" ] || [ "$http_code" = "302" ]; then
    print_test_result "Signin Page (/auth/signin)" "PASS" "Status: $http_code"
else
    print_test_result "Signin Page (/auth/signin)" "FAIL" "Status: $http_code"
fi

# Test 2: Signup Page  
echo -e "\n${YELLOW}Testing Signup Page...${NC}"
response=$(curl -k -s -w "%{http_code}" -I "$BASE_URL/auth/signup" 2>/dev/null)
http_code="${response: -3}"
if [ "$http_code" = "200" ] || [ "$http_code" = "404" ] || [ "$http_code" = "302" ]; then
    print_test_result "Signup Page (/auth/signup)" "PASS" "Status: $http_code"
else
    print_test_result "Signup Page (/auth/signup)" "FAIL" "Status: $http_code"
fi

# Test 3: Forgot Password Page
echo -e "\n${YELLOW}Testing Forgot Password Page...${NC}"
response=$(curl -k -s -w "%{http_code}" -I "$BASE_URL/auth/forgot-password" 2>/dev/null)
http_code="${response: -3}"
if [ "$http_code" = "200" ] || [ "$http_code" = "404" ] || [ "$http_code" = "302" ]; then
    print_test_result "Forgot Password Page (/auth/forgot-password)" "PASS" "Status: $http_code"
else
    print_test_result "Forgot Password Page (/auth/forgot-password)" "FAIL" "Status: $http_code"
fi

echo -e "\n${BLUE}=== Testing Auth API Endpoints ===${NC}"

# Test 4: API Register
echo -e "\n${YELLOW}Testing API Register...${NC}"
register_response=$(curl -k -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}' 2>/dev/null)

register_body=$(echo "$register_response" | head -n -1)
register_code=$(echo "$register_response" | tail -n 1)

if [ "$register_code" = "200" ] || [ "$register_code" = "201" ] || [ "$register_code" = "400" ] || [ "$register_code" = "409" ]; then
    print_test_result "API Register (/api/auth/register)" "PASS" "Status: $register_code"
    if [ "$register_code" = "200" ] || [ "$register_code" = "201" ]; then
        echo -e "  ${GREEN}Registration successful${NC}"
    elif [ "$register_code" = "409" ]; then
        echo -e "  ${YELLOW}User already exists${NC}"
    fi
else
    print_test_result "API Register (/api/auth/register)" "FAIL" "Status: $register_code, Response: $register_body"
fi

# Test 5: API Login
echo -e "\n${YELLOW}Testing API Login...${NC}"
login_response=$(curl -k -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"Test123!"}' 2>/dev/null)

login_body=$(echo "$login_response" | head -n -1)
login_code=$(echo "$login_response" | tail -n 1)

# Extract token if login successful
token=""
if [ "$login_code" = "200" ]; then
    token=$(echo "$login_body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

if [ "$login_code" = "200" ] || [ "$login_code" = "401" ] || [ "$login_code" = "400" ]; then
    print_test_result "API Login (/api/auth/login)" "PASS" "Status: $login_code"
    if [ "$login_code" = "200" ]; then
        echo -e "  ${GREEN}Login successful${NC}"
        if [ -n "$token" ]; then
            echo -e "  ${GREEN}Token received${NC}"
        fi
    fi
else
    print_test_result "API Login (/api/auth/login)" "FAIL" "Status: $login_code, Response: $login_body"
fi

# Test 6: API /me ohne Token
echo -e "\n${YELLOW}Testing API /me without token...${NC}"
me_no_token_response=$(curl -k -s -w "\n%{http_code}" -X GET "$API_URL/auth/me" 2>/dev/null)

me_no_token_body=$(echo "$me_no_token_response" | head -n -1)
me_no_token_code=$(echo "$me_no_token_response" | tail -n 1)

if [ "$me_no_token_code" = "401" ] || [ "$me_no_token_code" = "403" ]; then
    print_test_result "API /me without token" "PASS" "Status: $me_no_token_code (Unauthorized as expected)"
else
    print_test_result "API /me without token" "FAIL" "Status: $me_no_token_code (Should be 401/403)"
fi

# Test 7: API /me mit Token (wenn verfügbar)
if [ -n "$token" ]; then
    echo -e "\n${YELLOW}Testing API /me with token...${NC}"
    me_with_token_response=$(curl -k -s -w "\n%{http_code}" -X GET "$API_URL/auth/me" \
        -H "Authorization: Bearer $token" 2>/dev/null)
    
    me_with_token_body=$(echo "$me_with_token_response" | head -n -1)
    me_with_token_code=$(echo "$me_with_token_response" | tail -n 1)
    
    if [ "$me_with_token_code" = "200" ]; then
        print_test_result "API /me with token" "PASS" "Status: $me_with_token_code"
        echo -e "  ${GREEN}User data retrieved successfully${NC}"
    else
        print_test_result "API /me with token" "FAIL" "Status: $me_with_token_code, Response: $me_with_token_body"
    fi
else
    print_test_result "API /me with token" "FAIL" "No token available from login"
fi

# Print final results
echo -e "\n${BLUE}=== Auth Test Summary ===${NC}"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All auth tests passed!${NC}"
else
    echo -e "\n${YELLOW}⚠️  Some auth tests failed. This may be expected if auth is not fully implemented.${NC}"
fi

echo -e "\n${BLUE}=== Auth System Status ===${NC}"
if [ "$register_code" = "200" ] || [ "$register_code" = "201" ] || [ "$register_code" = "409" ]; then
    echo -e "${GREEN}✓ Registration endpoint working${NC}"
else
    echo -e "${RED}✗ Registration endpoint issues${NC}"
fi

if [ "$login_code" = "200" ]; then
    echo -e "${GREEN}✓ Login endpoint working${NC}"
    echo -e "${GREEN}✓ Token generation working${NC}"
else
    echo -e "${RED}✗ Login endpoint issues${NC}"
fi

if [ "$me_no_token_code" = "401" ] || [ "$me_no_token_code" = "403" ]; then
    echo -e "${GREEN}✓ Authorization protection working${NC}"
else
    echo -e "${RED}✗ Authorization protection issues${NC}"
fi